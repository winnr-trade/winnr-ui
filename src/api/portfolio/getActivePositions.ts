import { useQuery } from "@tanstack/react-query";
import { http } from "@/api/utils";
import { useMainWallet } from "@/hooks/useMainWallet";
import type { PortfolioPosition } from "@/types";

export const getActivePositions = async (address: string): Promise<PortfolioPosition[]> => {
  // Fetch Real Active Positions (Share balances) from the Indexer
  const res = await http.get("/positions", { params: { user_address: address, limit: 100 } });
  const positions: any = res.data.data;

  const activePositions: PortfolioPosition[] = (positions || []).map((pos: any) => ({
    marketId: pos.market_id,
    question: pos.question,
    outcome: pos.outcome,
    yesShares: pos.yes_shares,
    noShares: pos.no_shares,
    avgPriceYes: pos.avg_price_yes,
    avgPriceNo: pos.avg_price_no,
    latestMidPrice: pos.latest_mid_price,
  }));

  return activePositions;
};

export const useActivePositions = () => {
  const { address } = useMainWallet();

  return useQuery<PortfolioPosition[]>({
    queryKey: ["activePositions", address],
    queryFn: () => {
      if (!address) return [];
      return getActivePositions(address);
    },
    enabled: !!address,
  });
};
