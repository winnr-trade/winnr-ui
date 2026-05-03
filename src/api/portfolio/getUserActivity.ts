import { useQuery } from "@tanstack/react-query";
import { http } from "@/api/utils";
import { useMainWallet } from "@/hooks/useMainWallet";
import type { PortfolioActivity } from "@/types";
import { formatFullDate } from "@/utils";

export const getUserActivity = async (
  address: string,
  page = 0,
  limit = 10,
): Promise<PortfolioActivity[]> => {
  try {
    const res = await http.get("/trades", {
      params: { userAddress: address, page, limit },
    });

    if (!res.data.success) {
      throw new Error(res.data.error || "Failed to fetch activity");
    }

    return res.data.data.map((trade: any) => {
      const isBuyer = trade.buyer.toLowerCase() === address.toLowerCase();
      const question = trade.question || `Market #${trade.market_id}`;
      const trimmedQuestion = question.length > 30 ? `${question.substring(0, 27)}...` : question;

      // In binary markets, if price is < 50 and you are buyer, you bought YES? 
      // Actually, we should probably check what exactly happened.
      // For now, let's assume if you are buyer, you bought shares.
      
      return {
        id: trade.id.toString(),
        action: `${isBuyer ? "Bought" : "Sold"} shares`,
        subtext: `${trimmedQuestion}`,
        amount: `$${((trade.price * trade.quantity) / 10000).toFixed(2)}`,
        amountPositive: !isBuyer, // Selling is positive (getting money), Buying is negative?
        // Actually usually "amountPositive" in UI means green color.
        // Let's stick to the convention used in getPortfolioData.ts: o.side === "ask" was true.
        // o.side === "ask" means you are SELLING. So amountPositive = true for selling.
        date: formatFullDate(new Date(trade.timestamp).getTime()),
        icon: isBuyer ? "plus" : "arrow-right-left",
      };
    });
  } catch (error) {
    console.error("Failed to fetch user activity:", error);
    return [];
  }
};

export const useUserActivity = (limit = 10) => {
  const { address } = useMainWallet();

  return useQuery<PortfolioActivity[]>({
    queryKey: ["userActivity", address, limit],
    queryFn: () => {
      if (!address) return [];
      return getUserActivity(address, 0, limit);
    },
    enabled: !!address,
  });
};
