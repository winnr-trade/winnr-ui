import { useQuery } from "@tanstack/react-query";
import { MOCK_PORTFOLIO_DATA } from "@/api/mock";

export const usePortfolioData = () => {
  return useQuery({
    queryKey: ["portfolioData"],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_PORTFOLIO_DATA;
    },
  });
};
