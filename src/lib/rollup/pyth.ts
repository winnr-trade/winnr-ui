import type { Signer } from "@sovereign-sdk/signers";
import type { Rollup } from "@sovereign-sdk/web3";

export class Pyth {
  // biome-ignore lint/suspicious/noExplicitAny: types aren't used
  private readonly rollup: Rollup<any, any>;

  constructor(rollup: Rollup<any, any>) {
    this.rollup = rollup;
  }

  async updatePriceFeeds(params: { priceFeeds: number[] }, signer: Signer) {
    const callMessage = {
      pyth: {
        update_price_feeds: {
          update_data: params.priceFeeds,
        },
      },
    };

    return this.rollup.call(callMessage, { signer });
  }
}
