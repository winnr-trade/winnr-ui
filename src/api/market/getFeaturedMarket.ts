import { useQuery } from "@tanstack/react-query";
import { getMarketDetail } from "./getMarketDetail";

export const getFeaturedMarket = async () => {
  return await getMarketDetail(0);
};

export const useGetFeaturedMarket = () => {
  return useQuery({
    queryKey: ["featuredMarket"],
    queryFn: () => getFeaturedMarket(),
  });
};
