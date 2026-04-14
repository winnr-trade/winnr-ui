import { useQuery } from "@tanstack/react-query";
import { MOCK_CLOSING } from "@/api/mock";

export const useGetClosingSoon = () => {
  return useQuery({
    queryKey: ["closingSoon"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return MOCK_CLOSING;
    },
  });
};
