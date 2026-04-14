import { useQuery } from "@tanstack/react-query";
import { indexerApiBaseUrl } from "@/config/env";

export const useGetMarketStats = () => {
  return useQuery({
    queryKey: ["marketStats"],
    queryFn: async () => {
      const res = await fetch(`${indexerApiBaseUrl}/api/v1/markets?limit=100`);
      if (!res.ok) throw new Error("Failed to fetch market stats");
      const json = await res.json();

      // biome-ignore lint/suspicious/noExplicitAny: indexer response
      const data: any[] = json.data ?? [];

      const activeMarkets = data.filter((m) => m.status === "Active").length;
      const totalVolume = data.reduce((acc: number, m: any) => acc + Number(m.volume ?? 0), 0);
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
    },
  });
};
