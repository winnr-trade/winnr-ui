import type { Signer } from "@sovereign-sdk/signers";
import type { Rollup } from "@sovereign-sdk/web3";

export type ShieldedAccount = {
  commitment: string;
  nullifier: string;
};

export class ShieldedPool {
  private readonly rollup: Rollup<any, any>;
  private readonly prefix: string = "/modules/shielded-pool";
  // biome-ignore lint/suspicious/noExplicitAny: types arent used
  constructor(rollup: Rollup<any, any>) {
    this.rollup = rollup;
  }

  async hasAccount(params: { userAddress: string }): Promise<boolean> {
    const has: any = await this.rollup.http.get(`${this.prefix}/has-shielded`, {
      query: { user_address: params.userAddress },
    });
    return has.has_shielded as boolean;
  }

  async registerAccount(
    params: {
      proof: Uint8Array;
      root: Uint8Array;
      amount: bigint;
      commitment: Uint8Array;
      nullifier: Uint8Array;
      memo: Uint8Array;
      owner: string;
      signature: Uint8Array;
    },
    signer: Signer,
  ) {
    const callMessage = {
      shielded_pool: {
        register_account: {
          proof: params.proof,
          root: params.root,
          amount: params.amount,
          commitment: params.commitment,
          nullifier: params.nullifier,
          owner: params.owner,
          signature: params.signature,
          memo: params.memo,
        },
      },
    };

    try {
      const res = await this.rollup.call(callMessage, { signer });
      return res;
    } catch (error) {
      console.log({ error });
      console.log(JSON.stringify(error, null, 2));
      throw error;
    }
  }

  async deposit(
    params: {
      owner: string;
      signature: Uint8Array;
      proof: Uint8Array;
      root: Uint8Array;
      amount: bigint;
      commitment: Uint8Array;
      nullifier: Uint8Array;
      memo: Uint8Array;
    },
    signer: Signer,
  ) {
    const callMessage = {
      shielded_pool: {
        deposit: {
          owner: params.owner,
          signature: params.signature,
          proof: params.proof,
          root: params.root,
          amount: params.amount,
          commitment: params.commitment,
          nullifier: params.nullifier,
          memo: params.memo,
        },
      },
    };

    try {
      const res = await this.rollup.call(callMessage, { signer });
      return res;
    } catch (error) {
      console.log({ error });
      console.log(JSON.stringify(error, null, 2));
      throw error;
    }
  }

  async withdraw(
    params: {
      owner: string;
      signature: Uint8Array;
      recipient: string;
      proof: Uint8Array;
      root: Uint8Array;
      amount: bigint;
      commitment: Uint8Array;
      nullifier: Uint8Array;
      memo: Uint8Array;
    },
    signer: Signer,
  ) {
    const callMessage = {
      shielded_pool: {
        withdraw: {
          owner: params.owner,
          signature: params.signature,
          recipient: params.recipient,
          proof: params.proof,
          root: params.root,
          amount: params.amount,
          commitment: params.commitment,
          nullifier: params.nullifier,
          memo: params.memo,
        },
      },
    };

    try {
      const res = await this.rollup.call(callMessage, { signer });
      return res;
    } catch (error) {
      console.log({ error });
      console.log(JSON.stringify(error, null, 2));
      throw error;
    }
  }
}
