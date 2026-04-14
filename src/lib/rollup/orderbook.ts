import type { Signer } from "@sovereign-sdk/signers";
import type { Rollup } from "@sovereign-sdk/web3";
import type { OrderType, Outcome, Side } from "./types";

export class Orderbook {
  // biome-ignore lint/suspicious/noExplicitAny: types aren't used
  private readonly rollup: Rollup<any, any>;

  private readonly prefix: string = "/modules/orderbook";

  // biome-ignore lint/suspicious/noExplicitAny: types aren't used
  constructor(rollup: Rollup<any, any>) {
    this.rollup = rollup;
  }

  async placeOrder(
    params: {
      marketId: number;
      outcome: Outcome;
      side: Side;
      price: number;
      quantity: number;
      orderType: OrderType;
    },
    signer: Signer,
  ) {
    const callMessage = {
      orderbook: {
        place_order_normal: {
          market_id: params.marketId,
          outcome: params.outcome,
          side: params.side,
          price: params.price,
          quantity: params.quantity,
          order_type: params.orderType,
        },
      },
    };

    return this.rollup.call(callMessage, { signer });
  }

  // Fetch market module status
  async status() {
    return this.rollup.http.get(`${this.prefix}/status`);
  }
}
