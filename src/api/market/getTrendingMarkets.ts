import { useQuery } from "@tanstack/react-query";
import { http } from "@/api/utils";
import { keysToCamelCase } from "@/utils";
import { transformMarketResponse } from "./transform";

export const getTrendingMarkets = async (limit: number = 10) => {
  const res = await http.get("/markets", { params: { limit } });
  const data = keysToCamelCase(res.data.data) as any[];

  return data
    .filter((m: any) => m.id !== 0 && m.id !== "0")
    .map((m: any) => transformMarketResponse(m))
    .reverse();
};

export const useGetTrendingMarkets = () => {
  return useQuery({
    queryKey: ["trendingMarkets"],
    queryFn: () => getTrendingMarkets(),
  });
};
