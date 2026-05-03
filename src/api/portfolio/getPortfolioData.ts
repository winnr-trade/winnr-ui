import { useQuery } from "@tanstack/react-query";
import { http, rollup } from "@/api/utils";
import { useMainWallet } from "@/hooks/useMainWallet";
import type { PortfolioData, PortfolioPosition } from "@/types";

export const getPortfolioData = async (address: string): Promise<PortfolioData> => {
  // 1. Fetch Real Active Positions (Share balances) from the Indexer
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

  return {
    activePositions,
  };
};

export const usePortfolioData = () => {
  const { address } = useMainWallet();

  return useQuery<PortfolioData | null>({
    queryKey: ["portfolioData", address],
    queryFn: () => {
      if (!address) return null;
      return getPortfolioData(address);
    },
    enabled: !!address,
  });
};
