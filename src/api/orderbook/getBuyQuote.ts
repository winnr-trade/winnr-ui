import { rollup } from "@/api/utils";
import type { Outcome } from "@/lib/rollup/types";

export interface GetBuyQuoteParams {
  marketId: number;
  outcome: Outcome;
  quantity: number;
}

export interface BuyQuoteResponse {
  collateralRequired: bigint;
  fillableQuantity: bigint;
  unfillableQuantity: bigint;
}

export const getBuyQuote = async (params: GetBuyQuoteParams): Promise<BuyQuoteResponse> => {
  const res = await rollup.orderbook.getBuyQuote(params);
  return {
    collateralRequired: BigInt(res.collateral_required),
    fillableQuantity: BigInt(res.fillable_quantity),
    unfillableQuantity: BigInt(res.unfillable_quantity),
  };
};
