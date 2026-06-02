import { Keypair } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { getUserNote } from "@/api/notes";
import { getUserOrders } from "@/api/orderbook/getUserOrders";
import { getStealthOrderMemos } from "@/api/stealthOrder";
import { useMainWallet } from "@/hooks/useMainWallet";
import { useShieldedWallet } from "@/hooks/useShieldedWallet";
import type { ShieldedWallet } from "@/lib/crypto/shielded";
import { deriveStealthKey } from "@/lib/crypto/stealth";
import type { StealthUserOrder } from "./getStealthOrders";

/**
 * Fetches all open stealth orders for a single market using detection tags.
 * It first finds all stealth addresses that interacted with the market,
 * then queries their open orders, and finally derives the necessary private keys.
 */
export async function getMarketStealthOrders(
  mainAddress: string,
  shieldedWallet: ShieldedWallet,
  marketId: number,
): Promise<StealthUserOrder[]> {
  // 1. Fetch stealth memos to find which addresses interacted with this market
  const memos = await getStealthOrderMemos(shieldedWallet.viewKey, marketId);
  if (!memos || memos.length === 0) return [];

  const stealthAddresses = Array.from(new Set(memos.map((m) => m.stealth_address).filter(Boolean)));

  // 2. Fetch all orders for these addresses concurrently
  const orderResults = await Promise.all(stealthAddresses.map((addr) => getUserOrders(addr)));

  // 3. Filter down to open orders for this specific market
  const openOrdersByAddress = new Map<string, any[]>();
  let totalOpenOrders = 0;

  for (let i = 0; i < stealthAddresses.length; i++) {
    const address = stealthAddresses[i];
    const orders = orderResults[i] || [];
    const openOrders = orders.filter((o) => o.status === "open" && o.marketId === marketId);

    if (openOrders.length > 0) {
      openOrdersByAddress.set(address, openOrders);
      totalOpenOrders += openOrders.length;
    }
  }

  if (totalOpenOrders === 0) return [];

  // 4. We have open orders. Now we need their private keys to enable cancellation.
  // We scan the global nonces down from latest until we find the keys for all target addresses.
  const latestNote = await getUserNote(mainAddress, shieldedWallet);
  if (!latestNote) return [];

  const targetAddresses = new Set(openOrdersByAddress.keys());
  const addressToPrivateKey = new Map<string, Uint8Array>();

  for (let nonce = latestNote.nonce; nonce >= 1n; nonce--) {
    if (targetAddresses.size === 0) break; // Found all needed keys!

    const stealthPrivateKey = deriveStealthKey(shieldedWallet.stealthSecret, nonce);
    const derivedAddr = Keypair.fromSeed(stealthPrivateKey).publicKey.toBase58();

    if (targetAddresses.has(derivedAddr)) {
      addressToPrivateKey.set(derivedAddr, stealthPrivateKey);
      targetAddresses.delete(derivedAddr);
    }
  }

  // 5. Build the final array of StealthUserOrder
  const finalOrders: StealthUserOrder[] = [];
  for (const [address, openOrders] of openOrdersByAddress.entries()) {
    const stealthPrivateKey = addressToPrivateKey.get(address);
    if (!stealthPrivateKey) {
      console.warn(`Could not find private key for stealth address ${address}`);
      continue;
    }

    for (const order of openOrders) {
      finalOrders.push({
        ...order,
        stealthAddress: address,
        stealthPrivateKey,
      });
    }
  }

  return finalOrders;
}

export function useGetMarketStealthOrders(params: { marketId?: number | null }) {
  const { marketId } = params;
  const { address: mainAddress } = useMainWallet();
  const { isEnabled, wallet } = useShieldedWallet();

  return useQuery({
    queryKey: ["marketStealthOrders", mainAddress, marketId],
    queryFn: () => {
      if (!mainAddress || !wallet || marketId == null) throw new Error("Missing context");
      return getMarketStealthOrders(mainAddress, wallet, marketId);
    },
    enabled: isEnabled && !!mainAddress && !!wallet && marketId != null,
    staleTime: 10_000,
  });
}
