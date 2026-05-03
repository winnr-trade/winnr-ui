import { useQuery } from "@tanstack/react-query";
import { http } from "@/api/utils";
import { keysToCamelCase } from "@/utils";
import { transformMarketResponse } from "./transform";

export const getNewestMarkets = async (limit: number = 10) => {
  const res = await http.get("/markets", { params: { limit } });
  const data = keysToCamelCase(res.data.data) as any[];

  return data.map((m: any) => {
    const market = transformMarketResponse(m);

    return market;
  });
};

export const useGetNewestMarkets = () => {
  return useQuery({
    queryKey: ["newestMarkets"],
    queryFn: () => getNewestMarkets(),
  });
};
