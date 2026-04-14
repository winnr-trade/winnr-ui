import { rollupChainId, rollupEndpoint } from "@/config/env";
import { RollupClient } from "@/lib/rollup";

export const rollup = new RollupClient(rollupEndpoint, rollupChainId);
