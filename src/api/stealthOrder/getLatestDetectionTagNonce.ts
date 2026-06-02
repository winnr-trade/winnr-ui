import { useQuery } from "@tanstack/react-query";
import { useShieldedWallet } from "@/hooks/useShieldedWallet";
import { BATCH_SIZE, probeBatch, shieldedQueryKey } from "./getStealthOrderMemos";

/**
 * Returns the highest detection-tag nonce that has an indexed memo for
 * the given market, or `null` if no memos exist yet.
 *
 * Useful for syncing the per-market detection nonce counter without having
 * to decrypt or store any memo contents.
 *
 * @param viewKey  The 32-byte shielded wallet view key.
 * @param marketId The market ID (bigint).
 */
export async function getLatestDetectionTagNonce(
  viewKey: Uint8Array,
  marketId: number,
): Promise<bigint | null> {
  let fromNonce = 0n;
  let latestNonce: bigint | null = null;

  while (true) {
    const { hitNonces } = await probeBatch(viewKey, marketId, fromNonce);

    if (hitNonces.length > 0) {
      latestNonce = hitNonces[hitNonces.length - 1];
    }

    if (hitNonces.length < BATCH_SIZE) break;
    fromNonce += BigInt(BATCH_SIZE);
  }

  return latestNonce;
}

/**
 * React-Query hook that returns the latest indexed detection-tag nonce for
 * the given market, or `null` if the wallet has placed no orders there yet.
 */
export function useGetLatestDetectionTagNonce(params: { marketId?: number | null }) {
  const { marketId } = params;
  const { wallet } = useShieldedWallet();
  const shieldedAddress = wallet?.address.toString(16) ?? null;

  return useQuery({
    queryKey: shieldedQueryKey("latestDetectionTagNonce", shieldedAddress, marketId),
    queryFn: () => getLatestDetectionTagNonce(wallet!.viewKey, marketId!),
    enabled: !!wallet && marketId != null,
  });
}
