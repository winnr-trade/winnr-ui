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
      const kind = trade.settlement_kind?.toLowerCase();

      let action: string;
      if (kind === "mint_pair") {
        action = "Minted Shares";
      } else if (kind === "merge_pair") {
        action = "Merged Shares";
      } else {
        action = isBuyer ? "Bought Shares" : "Sold Shares";
      }

      const totalValue = (trade.price * trade.quantity) / 10000;

      return {
        id: trade.id.toString(),
        action,
        subtext: trimmedQuestion,
        amount: `$${totalValue.toFixed(2)}`,
        amountPositive: !isBuyer, // Receiving money (selling/merging) is positive
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
