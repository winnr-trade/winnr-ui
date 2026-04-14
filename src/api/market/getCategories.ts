import { useQuery } from "@tanstack/react-query";
import { MOCK_CATEGORIES } from "@/api/mock";

export const useGetCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return MOCK_CATEGORIES;
    },
  });
};
