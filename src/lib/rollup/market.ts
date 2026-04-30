import type { Signer } from "@sovereign-sdk/signers";
import type { Rollup } from "@sovereign-sdk/web3";
import type { ResolutionData, Resolver } from "./types";

export class Market {
  // biome-ignore lint/suspicious/noExplicitAny: types aren't used
  private readonly rollup: Rollup<any, any>;

  private readonly prefix: string = "/modules/market";

  constructor(rollup: Rollup<any, any>) {
    this.rollup = rollup;
  }

  async createMarket(
    params: {
      question: string;
      collateralToken: string;
      resolutionTime: number;
      resolver: Resolver;
    },
    signer: Signer,
  ) {
    const callMessage = {
      market: {
        create_market: {
          question: params.question,
          collateral_token: params.collateralToken,
          resolution_time: params.resolutionTime,
          resolver: params.resolver,
        },
      },
    };

    return this.rollup.call(callMessage, { signer });
  }

  async mintShares(params: { marketId: number; amount: bigint }, signer: Signer) {
    const callMessage = {
      market: {
        mint_shares: {
          market_id: params.marketId,
          amount: params.amount,
        },
      },
    };

    return this.rollup.call(callMessage, { signer });
  }

  async redeemShares(params: { marketId: number; amount: bigint }, signer: Signer) {
    const callMessage = {
      market: {
        redeem_shares: {
          market_id: params.marketId,
          amount: params.amount,
        },
      },
    };

    return this.rollup.call(callMessage, { signer });
  }

  async resolveMarket(
    params: { marketId: number; resolutionData: ResolutionData },
    signer: Signer,
  ) {
    const callMessage = {
      market: {
        resolve_market: {
          market_id: params.marketId,
          data: params.resolutionData,
        },
      },
    };

    return this.rollup.call(callMessage, { signer });
  }

  async claimWinnings(params: { marketId: number }, signer: Signer) {
    const callMessage = {
      market: {
        claim_winnings: {
          market_id: params.marketId,
        },
      },
    };

    return this.rollup.call(callMessage, { signer });
  }

  async setSupportedCollateralToken(params: { tokenId: string; support: boolean }, signer: Signer) {
    const callMessage = {
      market: {
        set_supported_collateral_token: {
          token_id: params.tokenId,
          support: params.support,
        },
      },
    };

    return this.rollup.call(callMessage, { signer });
  }

  async haltMarket(params: { marketId: number }, signer: Signer) {
    const callMessage = {
      market: {
        halt_market: {
          market_id: params.marketId,
        },
      },
    };

    return this.rollup.call(callMessage, { signer });
  }

  async resumeMarket(params: { marketId: number }, signer: Signer) {
    const callMessage = {
      market: {
        resume_market: {
          market_id: params.marketId,
        },
      },
    };

    return this.rollup.call(callMessage, { signer });
  }

  // Fetch a list of markets, with optional from_id and limit
  async list(params: { page: number; limit?: number }) {
    const query = { page: params.page, limit: params.limit };
    return this.rollup.http.get(`${this.prefix}/list`, { query });
  }

  // Fetch a single market by ID
  async get(marketId: number) {
    return this.rollup.http.get(`${this.prefix}/${marketId}`);
  }

  async getShares(params: { marketId: number; userAddress: string }) {
    return this.rollup.http.get(`${this.prefix}/shares`, {
      query: { market_id: params.marketId, user_address: params.userAddress },
    });
  }

  // Fetch market module status
  async status() {
    return this.rollup.http.get(`${this.prefix}/status`);
  }
}
