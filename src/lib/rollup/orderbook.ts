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

  async getBuyQuote(params: { marketId: number; outcome: Outcome; quantity: number }) {
    const res = await this.rollup.http.get(`${this.prefix}/buy-quote`, {
      query: {
        market_id: params.marketId,
        outcome: params.outcome,
        quantity: params.quantity,
      },
    });

    return res as {
      collateral_required: bigint;
      fillable_quantity: bigint;
      unfillable_quantity: bigint;
    };
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

  async placeOrderStealth(
    params: {
      proof: number[];
      root: string;
      commitment: string;
      nullifier: string;
      stealthAddress: string;
      marketId: number;
      outcome: Outcome;
      side: Side;
      price: number;
      quantity: number;
      orderType: OrderType;
      noteMemo: number[];
      detectionTag: string;
    },
    signer: Signer,
  ) {
    const callMessage = {
      orderbook: {
        place_order_stealth: {
          proof: params.proof,
          root: params.root,
          commitment: params.commitment,
          nullifier: params.nullifier,
          stealth_address: params.stealthAddress,
          market_id: params.marketId,
          outcome: params.outcome,
          side: params.side,
          price: params.price,
          quantity: params.quantity,
          order_type: params.orderType,
          note_memo: params.noteMemo,
          detection_tag: params.detectionTag,
        },
      },
    };

    return this.rollup.call(callMessage, { signer });
  }

  async cancelOrder(params: { orderId: number }, signer: Signer) {
    const callMessage = {
      orderbook: {
        cancel_order: {
          order_id: params.orderId,
        },
      },
    };

    return this.rollup.call(callMessage, { signer });
  }

  async getUserOrders(params: { userAddress: string; marketId?: number }) {
    const query = new URLSearchParams();
    query.set("user_address", params.userAddress);
    if (params.marketId) {
      query.set("market_id", params.marketId.toString());
    }
    return this.rollup.http.get(`${this.prefix}/user-orders?${query.toString()}`);
  }

  // Fetch market module status
  async status() {
    return this.rollup.http.get(`${this.prefix}/status`);
  }
}
