import { useQuery } from "@tanstack/react-query";
import { keysToCamelCase } from "@/utils";
import { http } from "@/api/utils";

export const getMarketStats = async () => {
  const res = await http.get("/markets", { params: { limit: 100 } });
  const data = keysToCamelCase(res.data.data ?? []) as any[];

  const activeMarkets = data.filter((m) => m.status === "active").length;
  const totalVolume = data.reduce((acc: number, m: any) => acc + Number(m.totalVolume ?? 0), 0);
  const totalVolumeDollars = totalVolume / 1_000_000;

  let tvlStr: string;
  if (totalVolumeDollars >= 1_000_000) tvlStr = `$${(totalVolumeDollars / 1_000_000).toFixed(1)}M`;
  else if (totalVolumeDollars >= 1_000) tvlStr = `$${(totalVolumeDollars / 1_000).toFixed(1)}K`;
  else tvlStr = `$${totalVolumeDollars.toFixed(0)}`;

  return {
    traders24h: "—", // not yet tracked by indexer
    totalTvl: tvlStr,
    activeMarkets: activeMarkets.toLocaleString(),
  };
};

export const useGetMarketStats = () => {
  return useQuery({
    queryKey: ["marketStats"],
    queryFn: () => getMarketStats(),
  });
};
