import { bytesToHex } from "@noble/ciphers/utils.js";
import { useQuery } from "@tanstack/react-query";
import { http } from "@/api/utils";
import { useShieldedWallet } from "@/hooks/useShieldedWallet";
import { deriveDetectionTag } from "@/lib/crypto/stealth";

/** Number of detection tags to probe per round-trip. */
export const BATCH_SIZE = 5;

export interface StealthOrderMemoItem {
  id: number;
  commitment: string;
  stealth_address: string;
  detection_tag: string;
  timestamp: number;
  tx_hash: string;
}

interface StealthOrderMemosResponse {
  success: boolean;
  data: Record<string, StealthOrderMemoItem | null>;
}

interface BatchProbeResult {
  /** Nonces of tags that had an indexed memo. */
  hitNonces: bigint[];
  /** The corresponding memo items for those nonces. */
  hitItems: StealthOrderMemoItem[];
}

/**
 * Derives one batch of BATCH_SIZE detection tags starting at `fromNonce`,
 * queries the indexer, and returns only the hits.
 */
export async function probeBatch(
  viewKey: Uint8Array,
  marketId: number,
  fromNonce: bigint,
): Promise<BatchProbeResult> {
  const batch: Array<{ nonce: bigint; tag: string }> = [];
  for (let i = 0n; i < BigInt(BATCH_SIZE); i++) {
    const nonce = fromNonce + i;
    const tagBytes = deriveDetectionTag(viewKey, marketId, nonce);
    batch.push({ nonce, tag: `0x${bytesToHex(tagBytes)}` });
  }

  const tagList = batch.map((b) => b.tag).join(",");
  const { data: resp } = await http.get<StealthOrderMemosResponse>("/stealth-order-memos", {
    params: { detection_tags: tagList },
  });

  if (!resp.success) {
    throw new Error("Failed to fetch stealth order memos");
  }

  const hitNonces: bigint[] = [];
  const hitItems: StealthOrderMemoItem[] = [];

  for (const { nonce, tag } of batch) {
    const item = resp.data[tag.toLowerCase()];
    if (item) {
      hitNonces.push(nonce);
      hitItems.push(item);
    }
  }

  return { hitNonces, hitItems };
}

/**
 * Fetches all indexed stealth order memos for a single market.
 *
 * Strategy:
 *  1. Derive BATCH_SIZE detection tags starting at `fromNonce`.
 *  2. Send them to `GET /stealth-order-memos?detection_tags=...`.
 *  3. Collect hits (non-null entries).
 *  4. If ALL tags in the batch had a hit, advance `fromNonce` by BATCH_SIZE
 *     and repeat — there may be more memos ahead.
 *  5. Otherwise stop (a gap means we've seen all orders for this market).
 *
 * @param viewKey  The 32-byte shielded wallet view key.
 * @param marketId The market ID (bigint).
 * @returns Flat array of all memo items found, in nonce order.
 */
export async function getStealthOrderMemos(
  viewKey: Uint8Array,
  marketId: number,
): Promise<StealthOrderMemoItem[]> {
  const results: StealthOrderMemoItem[] = [];
  let fromNonce = 0n;

  while (true) {
    const { hitItems, hitNonces } = await probeBatch(viewKey, marketId, fromNonce);
    results.push(...hitItems);

    if (hitNonces.length < BATCH_SIZE) break;
    fromNonce += BigInt(BATCH_SIZE);
  }

  return results;
}

// ---------------------------------------------------------------------------
// React-Query hooks
// ---------------------------------------------------------------------------

/** Shared query key prefix builder — scopes to wallet + market. */
export function shieldedQueryKey(
  key: string,
  shieldedAddress: string | null,
  marketId: number | null | undefined,
) {
  return [key, shieldedAddress, marketId?.toString()];
}

/** React-Query hook that fetches all stealth order memos for a market.
 *
 * Obtains the view key from `useShieldedWallet` automatically.
 * The query key is scoped to the shielded address so every wallet
 * gets its own independent cache entry.
 */
export function useGetStealthOrderMemos(params: { marketId?: number | null }) {
  const { marketId } = params;
  const { wallet } = useShieldedWallet();
  const shieldedAddress = wallet?.address.toString(16) ?? null;

  return useQuery({
    queryKey: shieldedQueryKey("stealthOrderMemos", shieldedAddress, marketId),
    queryFn: () => getStealthOrderMemos(wallet!.viewKey, marketId!),
    enabled: !!wallet && marketId != null,
  });
}
