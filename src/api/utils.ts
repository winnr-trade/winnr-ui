import axios from "axios";
import { indexerApiBaseUrl, rollupChainId, rollupEndpoint } from "@/config/env";
import { RollupClient } from "@/lib/rollup";

export const rollup = new RollupClient(rollupEndpoint, rollupChainId);

export const http = axios.create({
  baseURL: indexerApiBaseUrl,
});
