import { useQuery } from "@tanstack/react-query";
import { getMarketShares } from "@/api/market/getShares";
import { useShieldedWallet } from "@/hooks/useShieldedWallet";
import { getStealthOrderMemos, shieldedQueryKey } from "./getStealthOrderMemos";

/**
 * Fetches and aggregates all market positions (YES and NO shares) held by
 * any stealth addresses associated with the given wallet for a specific market.
 *
 * @param marketId The market ID (number).
 * @param viewKey  The 32-byte shielded wallet view key.
 */
export async function getStealthShares(
  marketId: number,
  viewKey: Uint8Array,
): Promise<{ yes: number; no: number }> {
  const memos = await getStealthOrderMemos(viewKey, marketId);
  if (!memos || memos.length === 0) {
    return { yes: 0, no: 0 };
  }

  // Extract unique stealth addresses associated with non-null detection tag memo entries
  const stealthAddresses = Array.from(new Set(memos.map((m) => m.stealth_address).filter(Boolean)));

  // Fetch share balances for all these stealth addresses in parallel
  const sharePromises = stealthAddresses.map((addr) => getMarketShares(marketId, addr));
  const allShares = await Promise.all(sharePromises);

  let totalYes = 0;
  let totalNo = 0;
  for (const shares of allShares) {
    totalYes += shares.yes;
    totalNo += shares.no;
  }

  return { yes: totalYes, no: totalNo };
}

/**
 * React-Query hook that returns the aggregated YES/NO shares held by
 * all stealth addresses for the given market.
 */
export function useGetStealthShares(params: { marketId?: number | null }) {
  const { marketId } = params;
  const { wallet } = useShieldedWallet();
  const shieldedAddress = wallet?.address.toString(16) ?? null;

  return useQuery({
    queryKey: shieldedQueryKey("stealthShares", shieldedAddress, marketId),
    queryFn: () => getStealthShares(marketId!, wallet!.viewKey),
    enabled: !!wallet && marketId != null,
  });
}
