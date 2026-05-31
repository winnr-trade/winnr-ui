import { Keypair } from "@solana/web3.js";
import { Ed25519Signer } from "@sovereign-sdk/signers";
import { bytesToHex } from "@sovereign-sdk/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { getMarketShares } from "@/api/market/getShares";
import { getUserNote } from "@/api/notes";
import { getStealthOrderMemos } from "@/api/stealthOrder";
import { rollup } from "@/api/utils";
import { useMainWallet } from "@/hooks/useMainWallet";
import { useShieldedWallet } from "@/hooks/useShieldedWallet";
import type { ShieldedWallet } from "@/lib/crypto/shielded";
import { deriveStealthKey } from "@/lib/crypto/stealth";
import type { OrderType } from "@/lib/rollup/types";
import { Outcome, Side } from "@/lib/rollup/types";
import { unitsToPrice } from "@/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StealthSellOrderParams {
  marketId: number;
  outcome: Outcome;
  price: bigint;
  quantity: number;
  orderType: OrderType;
}

// ---------------------------------------------------------------------------
// Core async function
// ---------------------------------------------------------------------------

/**
 * Executes a private sell order.
 * Fetches all stealth positions for the market, sorts them from largest to smallest,
 * derives their private keys, and places sell orders sequentially until filled.
 */
export const placeOrderStealthSell = async (
  params: StealthSellOrderParams,
  ctx: {
    mainAddress: string;
    shieldedWallet: ShieldedWallet;
  },
) => {
  const { marketId, outcome, price, quantity, orderType } = params;
  const { mainAddress, shieldedWallet } = ctx;

  // 1. Fetch all stealth order memos for the market
  const memos = await getStealthOrderMemos(shieldedWallet.viewKey, marketId);
  if (!memos || memos.length === 0) {
    throw new Error("No stealth positions found for this market.");
  }

  const stealthAddresses = Array.from(new Set(memos.map((m) => m.stealth_address).filter(Boolean)));

  // 2. Fetch positions for each stealth address
  const allShares = await Promise.all(
    stealthAddresses.map(async (addr) => {
      const shares = await getMarketShares(marketId, addr);
      return { address: addr, shares };
    }),
  );

  // 3. Filter and sort by share balance (largest to smallest)
  const targetShares = allShares
    .map((item) => ({
      address: item.address,
      balance: outcome === Outcome.Yes ? item.shares.yes : item.shares.no,
    }))
    .filter((item) => item.balance > 0)
    .sort((a, b) => b.balance - a.balance);

  const totalAvailable = targetShares.reduce((sum, item) => sum + item.balance, 0);
  if (totalAvailable === 0) {
    throw new Error("No stealth positions found for the selected outcome.");
  }

  if (totalAvailable < quantity) {
    throw new Error(
      `Insufficient stealth position. Requested: ${quantity}, Available: ${totalAvailable}`,
    );
  }

  // 4. Fetch the latest user note to get the maximum nonce
  const latestNote = await getUserNote(mainAddress, shieldedWallet);
  if (!latestNote) {
    throw new Error("Failed to retrieve user shielded wallet state.");
  }

  // 5. Derive private keys for the target stealth addresses
  const addressToPrivateKey: Record<string, Uint8Array> = {};
  const addressesToFind = new Set(targetShares.map((item) => item.address));

  for (let nonce = 1n; nonce <= latestNote.nonce; nonce++) {
    if (addressesToFind.size === 0) break;
    const stealthPrivateKey = deriveStealthKey(shieldedWallet.stealthSecret, nonce);
    const derivedAddr = Keypair.fromSeed(stealthPrivateKey).publicKey.toBase58();
    if (addressesToFind.has(derivedAddr)) {
      addressToPrivateKey[derivedAddr] = stealthPrivateKey;
      addressesToFind.delete(derivedAddr);
    }
  }

  // Check if we derived keys for all target addresses
  for (const item of targetShares) {
    if (!addressToPrivateKey[item.address]) {
      throw new Error(`Failed to derive key for stealth address: ${item.address}`);
    }
  }

  // 6. Execute sell orders starting from the largest position
  let remainingQuantity = quantity;
  const results = [];

  for (const item of targetShares) {
    if (remainingQuantity <= 0) break;

    const sellAmount = Math.min(item.balance, remainingQuantity);
    const stealthPrivateKey = addressToPrivateKey[item.address];
    const stealthSigner = new Ed25519Signer(bytesToHex(stealthPrivateKey));

    const res = await rollup.orderbook.placeOrder(
      {
        marketId,
        outcome,
        side: Side.Ask, // Sell
        price: unitsToPrice(price, 6),
        quantity: sellAmount,
        orderType,
      },
      stealthSigner,
    );

    results.push(res);
    remainingQuantity -= sellAmount;
  }

  return results;
};

// ---------------------------------------------------------------------------
// React-Query hook
// ---------------------------------------------------------------------------

export const usePlaceOrderStealthSell = () => {
  const { address: mainAddress } = useMainWallet();
  const { wallet, isEnabled } = useShieldedWallet();
  const queryClient = useQueryClient();

  const mainAddressRef = useRef(mainAddress);
  const walletRef = useRef(wallet);
  const isEnabledRef = useRef(isEnabled);

  mainAddressRef.current = mainAddress;
  walletRef.current = wallet;
  isEnabledRef.current = isEnabled;

  return useMutation({
    mutationFn: async (params: StealthSellOrderParams) => {
      if (!isEnabledRef.current || !walletRef.current) {
        throw new Error("Private mode is not enabled.");
      }
      if (!mainAddressRef.current) {
        throw new Error("Main wallet is not connected.");
      }

      return placeOrderStealthSell(params, {
        mainAddress: mainAddressRef.current,
        shieldedWallet: walletRef.current,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["marketShares"] });
      queryClient.invalidateQueries({ queryKey: ["shieldedNote"] });
      queryClient.invalidateQueries({ queryKey: ["stealthOrderMemos"] });
      queryClient.invalidateQueries({ queryKey: ["stealthShares"] });
    },
  });
};
