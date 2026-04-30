import type { Signer } from "@sovereign-sdk/signers";
import type { Rollup } from "@sovereign-sdk/web3";

export type AgentPolicy = {
  scope: number;
  expiresAt: number;
};

export class AgentWallet {
  private readonly rollup: Rollup<any, any>;
  private readonly prefix: string = "/modules/agent-wallet";
  // biome-ignore lint/suspicious/noExplicitAny: types arent used
  constructor(rollup: Rollup<any, any>) {
    this.rollup = rollup;
  }

  async registerAgent(
    params: {
      agent: string;
      scopes: number;
      expiresAt: number;
      nonce: number;
      owner: string;
      signature: Uint8Array;
    },
    signer: Signer,
  ) {
    const callMessage = {
      agent_wallet: {
        register_agent: {
          agent: params.agent,
          scopes: params.scopes,
          expires_at: params.expiresAt,
          nonce: params.nonce,
          owner: params.owner,
          signature: params.signature,
        },
      },
    };

    console.log("callMessage", callMessage);

    let res: any;
    try {
      res = await this.rollup.call(callMessage, { signer });
    } catch (error) {
      console.log("error:", error);
      console.log("error:", JSON.stringify(error));
      throw error;
    }

    return res;
  }

  async getNonce(params: { owner: string }) {
    const nonce = (await this.rollup.http.get(`${this.prefix}/nonce`, {
      query: { owner: params.owner },
    })) as number;
    return nonce;
  }

  async getAgentPolicy(params: { owner: string; agent: string }) {
    const policy: AgentPolicy = await this.rollup.http.get(`${this.prefix}/policy`, {
      query: { owner: params.owner, agent: params.agent },
    });

    return policy;
  }
}
