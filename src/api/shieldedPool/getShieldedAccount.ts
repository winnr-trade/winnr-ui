import { useQuery } from "@tanstack/react-query";
import { rollup } from "@/api/utils";

export function useHasShieldedAccount(params: { address?: string }) {
  const { address } = params;

  return useQuery({
    queryKey: ["shieldedAccount", address],
    queryFn: () => rollup.shieldedPool.hasAccount({ userAddress: address! }),
    enabled: !!address,
    staleTime: 60_000,
  });
}
