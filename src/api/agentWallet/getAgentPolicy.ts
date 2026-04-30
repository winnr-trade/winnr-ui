import { useQuery } from "@tanstack/react-query";
import { rollup } from "@/api/utils";

export function useGetAgentPolicy(params: { ownerAddress?: string; agentAddress?: string }) {
  const { ownerAddress, agentAddress } = params;

  return useQuery({
    queryKey: ["agentPolicy", ownerAddress, agentAddress],
    queryFn: async () => {
      if (!ownerAddress || !agentAddress) return null;
      try {
        const res = await rollup.agentWallet.getAgentPolicy({
          owner: ownerAddress,
          agent: agentAddress,
        });
        return res;
      } catch (error) {
        console.error("Failed to fetch agent info:", error);
        return null;
      }
    },
    enabled: !!ownerAddress && !!agentAddress,
    staleTime: 60000, // 1 minute
  });
}
