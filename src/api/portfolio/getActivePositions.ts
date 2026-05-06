import { useQuery } from "@tanstack/react-query";
import { http } from "@/api/utils";
import { useMainWallet } from "@/hooks/useMainWallet";
import type { PortfolioPosition } from "@/types";
import { priceBasisToUnits } from "@/utils";

export const getActivePositions = async (address: string): Promise<PortfolioPosition[]> => {
  // Fetch Real Active Positions (Share balances) from the Indexer
  const res = await http.get("/positions", { params: { user_address: address, limit: 100 } });
  const positions: any = res.data.data;

  const activePositions: PortfolioPosition[] = (positions || []).map((pos: any) => ({
    marketId: pos.market_id,
    question: pos.question,
    outcome: pos.outcome,
    quantityYes: pos.quantity_yes,
    quantityNo: pos.quantity_no,
    totalCostYes: pos.total_cost_yes ? BigInt(pos.total_cost_yes) : BigInt(0),
    totalCostNo: pos.total_cost_no ? BigInt(pos.total_cost_no) : BigInt(0),
    // API returns prices in bps (basis 10000)
    bestBid: pos.best_bid ? priceBasisToUnits(pos.best_bid, 6) : null,
    bestAsk: pos.best_ask ? priceBasisToUnits(pos.best_ask, 6) : null,
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
