import { Keypair } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { getUserNote } from "@/api/notes";
import { useMainWallet } from "@/hooks/useMainWallet";
import { useShieldedWallet } from "@/hooks/useShieldedWallet";
import type { ShieldedWallet } from "@/lib/crypto/shielded";
import { deriveStealthKey } from "@/lib/crypto/stealth";
import type { PortfolioPosition } from "@/types";
import { getActivePositions } from "./getActivePositions";

const BATCH_SIZE = 5;
const MAX_EMPTY_BATCHES = 2;

/**
 * Fetches and aggregates all market positions held by stealth addresses derived
 * from the user's shielded wallet. Scans nonces from latest down to 1 in batches,
 * stopping after MAX_EMPTY_BATCHES consecutive batches with no positions.
 */
export async function getStealthPositions(
  mainAddress: string,
  shieldedWallet: ShieldedWallet,
): Promise<PortfolioPosition[]> {
  const latestNote = await getUserNote(mainAddress, shieldedWallet);
  if (!latestNote || latestNote.nonce === 0n) return [];

  // marketId → aggregated position
  const aggregated = new Map<number, PortfolioPosition>();
  let consecutiveEmptyBatches = 0;
  let nonce = latestNote.nonce;

  while (nonce >= 1n) {
    // 1. Derive a batch of stealth addresses (sync)
    const batch: string[] = [];
    for (let i = 0; i < BATCH_SIZE && nonce >= 1n; i++, nonce--) {
      const stealthPrivateKey = deriveStealthKey(shieldedWallet.stealthSecret, nonce);
      batch.push(Keypair.fromSeed(stealthPrivateKey).publicKey.toBase58());
    }

    // 2. Fetch positions for all addresses in the batch concurrently
    const results = await Promise.all(batch.map((addr) => getActivePositions(addr)));
    const batchPositions = results.flat();

    // 3. Merge into the aggregated map
    let batchHasPositions = false;
    for (const pos of batchPositions) {
      if (pos.quantityYes === 0 && pos.quantityNo === 0) continue;
      batchHasPositions = true;

      const existing = aggregated.get(pos.marketId);
      if (existing) {
        existing.quantityYes += pos.quantityYes;
        existing.quantityNo += pos.quantityNo;
        existing.totalCostYes += pos.totalCostYes;
        existing.totalCostNo += pos.totalCostNo;
        // bestBid/bestAsk are market-level — keep the first non-null value seen
        existing.bestBid ??= pos.bestBid;
        existing.bestAsk ??= pos.bestAsk;
      } else {
        aggregated.set(pos.marketId, { ...pos });
      }
    }

    // 4. Early-exit after too many consecutive empty batches
    if (batchHasPositions) {
      consecutiveEmptyBatches = 0;
    } else {
      consecutiveEmptyBatches++;
      if (consecutiveEmptyBatches >= MAX_EMPTY_BATCHES) break;
    }
  }

  return Array.from(aggregated.values());
}

export function useGetStealthPositions() {
  const { address: mainAddress } = useMainWallet();
  const { isEnabled, wallet } = useShieldedWallet();

  return useQuery({
    queryKey: ["stealthPositions", mainAddress],
    queryFn: () => {
      if (!mainAddress || !wallet) throw new Error("Missing wallet context");
      return getStealthPositions(mainAddress, wallet);
    },
    enabled: isEnabled && !!mainAddress && !!wallet,
    staleTime: 30_000,
  });
}
