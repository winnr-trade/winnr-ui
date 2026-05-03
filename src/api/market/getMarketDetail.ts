import { useQuery } from "@tanstack/react-query";
import { http } from "@/api/utils";
import type { Market, Resolver } from "@/types";
import { calculateProbability, keysToCamelCase, priceToUnits } from "@/utils";

import { transformMarketResponse } from "./transform";

export const getMarketDetail = async (id: number): Promise<Market> => {
  const m = await http.get(`/markets/${id}`).then((res) => keysToCamelCase(res.data.data));
  return transformMarketResponse(m);
};

export const useMarketDetail = (params: { id: number }) => {
  const { id } = params;
  return useQuery<Market>({
    queryKey: ["marketDetail", id],
    queryFn: () => getMarketDetail(id),
  });
};
