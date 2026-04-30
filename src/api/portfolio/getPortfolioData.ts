import { useQuery } from "@tanstack/react-query";
import { rollup } from "@/api/utils";
import { tokens } from "@/config/constants";
import { indexerApiBaseUrl } from "@/config/env";
import { useMainWallet } from "@/hooks/useMainWallet";

export const usePortfolioData = () => {
  const { address } = useMainWallet();

  return useQuery({
    queryKey: ["portfolioData", address],
    queryFn: async () => {
      if (!address) return null;

      // 1. Fetch Balance
      const balance = await rollup.bank.balance(address, tokens.usdc.id);
      const balanceValue = Number(balance) / 1_000_000;

      // 2. Fetch All Markets (to map market IDs to questions)
      const marketsRes = await fetch(`${indexerApiBaseUrl}/api/v1/markets?limit=100`);
      if (!marketsRes.ok) throw new Error("Failed to fetch markets");
      const marketsJson = await marketsRes.json();
      const allMarkets = marketsJson.data || [];
      const marketMap = new Map(allMarkets.map((m: any) => [m.id, m]));

      // 3. Fetch All User Orders (these are our "positions" for this view)
      const orders: any = await rollup.orderbook.getUserOrders({ userAddress: address });
      const openOrders = (orders || []).filter(
        (o: any) => o.status === "open" || o.status === "partially_filled",
      );

      const activePositions = openOrders.map((o: any) => {
        const market = marketMap.get(o.market_id);
        const question = market?.question || `Market #${o.market_id}`;
        const trimmedQuestion = question.length > 50 ? question.substring(0, 47) + "..." : question;

        const price = o.canonical_price / 100;
        const currentMidPrice = market?.latest_mid_price ? market.latest_mid_price / 100 : price;

        return {
          id: o.id.toString(),
          marketId: o.market_id,
          market: trimmedQuestion,
          fullMarket: question,
          outcome: o.outcome.toUpperCase(),
          position: `${o.original_quantity.toLocaleString()} ${o.outcome.toUpperCase()}`,
          avgPrice: `$${price.toFixed(2)}`,
          currentPrice: `$${currentMidPrice.toFixed(2)}`,
          unrealizedPnl: "$0.00",
          pnlPositive: true,
          value: o.original_quantity * currentMidPrice,
        };
      });

      const totalPositionValue = activePositions.reduce((acc: number, p: any) => acc + p.value, 0);

      // 4. Recent Activity (Last 5 orders)
      const recentActivity = (orders || []).slice(0, 5).map((o: any) => {
        const market = marketMap.get(o.market_id);
        const question = market?.question || `Market #${o.market_id}`;
        const trimmedQuestion = question.length > 30 ? question.substring(0, 27) + "..." : question;

        return {
          id: o.id.toString(),
          action: `${o.status === "filled" ? "Filled" : o.status === "cancelled" ? "Cancelled" : "Placed"} ${o.side.toUpperCase()} order`,
          subtext: `${trimmedQuestion} • ${o.outcome.toUpperCase()}`,
          amount: `$${((o.canonical_price * o.original_quantity) / 100).toFixed(2)}`,
          amountPositive: o.side === "ask",
          date: new Date(o.created_at).toLocaleDateString(),
          icon:
            o.status === "filled"
              ? "arrow-right-left"
              : o.status === "cancelled"
                ? "wallet"
                : "plus",
        };
      });

      return {
        stats: {
          totalValue: `$${(balanceValue + totalPositionValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          unrealizedPnl: "+$0.00",
          unrealizedPnlPercent: "0.0%",
          availableBalance: `$${balanceValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        },
        activePositions,
        recentActivity,
      };
    },
    enabled: !!address,
  });
};
