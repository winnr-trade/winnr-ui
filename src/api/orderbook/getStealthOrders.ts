import { Keypair } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { getUserNote } from "@/api/notes";
import { getUserOrders, type UserOrder } from "@/api/orderbook/getUserOrders";
import { useMainWallet } from "@/hooks/useMainWallet";
import { useShieldedWallet } from "@/hooks/useShieldedWallet";
import type { ShieldedWallet } from "@/lib/crypto/shielded";
import { deriveStealthKey } from "@/lib/crypto/stealth";

export interface StealthUserOrder extends UserOrder {
  stealthPrivateKey: Uint8Array;
  stealthAddress: string;
}

const BATCH_SIZE = 5;
const MAX_EMPTY_BATCHES = 5;

/**
 * Fetches all open orders held by stealth addresses derived
 * from the user's shielded wallet. Scans nonces from latest down to 1 in batches,
 * stopping after MAX_EMPTY_BATCHES consecutive batches with no orders.
 */
export async function getStealthOrders(
  mainAddress: string,
  shieldedWallet: ShieldedWallet,
): Promise<StealthUserOrder[]> {
  const latestNote = await getUserNote(mainAddress, shieldedWallet);
  if (!latestNote || latestNote.nonce === 0n) return [];

  const allOrders: StealthUserOrder[] = [];
  let consecutiveEmptyBatches = 0;
  let nonce = latestNote.nonce;

  while (nonce >= 1n) {
    // 1. Derive a batch of stealth addresses (sync)
    const batch: { nonce: bigint; address: string; stealthPrivateKey: Uint8Array }[] = [];
    for (let i = 0; i < BATCH_SIZE && nonce >= 1n; i++, nonce--) {
      const stealthPrivateKey = deriveStealthKey(shieldedWallet.stealthSecret, nonce);
      const address = Keypair.fromSeed(stealthPrivateKey).publicKey.toBase58();
      batch.push({ nonce, address, stealthPrivateKey });
    }

    // 2. Fetch orders for all addresses in the batch concurrently
    const results = await Promise.all(batch.map((b) => getUserOrders(b.address)));

    // 3. Collect open orders from the results
    let batchHasOrders = false;
    for (let i = 0; i < batch.length; i++) {
      const orders = results[i];
      if (orders && orders.length > 0) {
        batchHasOrders = true;
        const openOrders = orders.filter((o) => o.status === "open");
        for (const order of openOrders) {
          allOrders.push({
            ...order,
            stealthPrivateKey: batch[i].stealthPrivateKey,
            stealthAddress: batch[i].address,
          });
        }
      }
    }

    // 4. Early-exit after too many consecutive empty batches
    if (batchHasOrders) {
      consecutiveEmptyBatches = 0;
    } else {
      consecutiveEmptyBatches++;
      if (consecutiveEmptyBatches >= MAX_EMPTY_BATCHES) break;
    }
  }

  return allOrders;
}

export function useGetStealthOrders() {
  const { address: mainAddress } = useMainWallet();
  const { isEnabled, wallet } = useShieldedWallet();

  return useQuery({
    queryKey: ["stealthOrders", mainAddress],
    queryFn: () => {
      if (!mainAddress || !wallet) throw new Error("Missing wallet context");
      return getStealthOrders(mainAddress, wallet);
    },
    enabled: isEnabled && !!mainAddress && !!wallet,
    staleTime: 30_000,
  });
}
