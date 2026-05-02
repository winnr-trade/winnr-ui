import SovereignClient from "@sovereign-sdk/client";
import { Bank } from "@sovereign-sdk/modules";
import { JsSerializer } from "@sovereign-sdk/serializers";
import {
  DEFAULT_TX_DETAILS,
  type Rollup,
  type RollupConfig,
  StandardRollup,
  type StandardRollupContext,
  type StandardRollupSpec,
  standardTypeBuilder,
  type TypeBuilder,
} from "@sovereign-sdk/web3";
import { AgentWallet } from "./agentWallet";
import { ChainState } from "./chainState";
import { Market } from "./market";
import { Orderbook } from "./orderbook";

export class RollupClient {
  rollup!: Rollup<any, any>;
  bank!: Bank;
  chainState!: ChainState;
  market!: Market;
  orderbook!: Orderbook;
  agentWallet!: AgentWallet;

  //   private readonly ready: Promise<void>;

  constructor(url: string, chainId: number) {
    this.rollup = createRollup({ url, context: { defaultTxDetails: { chain_id: chainId } } });
    this.bank = new Bank(this.rollup);
    this.chainState = new ChainState(this.rollup);
    this.market = new Market(this.rollup);
    this.orderbook = new Orderbook(this.rollup);
    this.agentWallet = new AgentWallet(this.rollup);
  }
}

export function createRollup<RuntimeCall, C extends StandardRollupContext = StandardRollupContext>(
  rollupConfig?: Partial<RollupConfig<DeepPartial<C>>>,
  typeBuilderOverrides?: Partial<TypeBuilder<StandardRollupSpec<RuntimeCall>, C>>,
) {
  const config = rollupConfig ?? {};
  const client = config.client ?? new SovereignClient({ baseURL: config.url });
  const getSerializer = config.getSerializer ?? ((schema) => new JsSerializer(schema));
  const context = {
    defaultTxDetails: { ...DEFAULT_TX_DETAILS, ...config.context?.defaultTxDetails },
  };

  // Default to the standard transaction submission endpoint
  const txSubmissionEndpoint = config.txSubmissionEndpoint ?? "/sequencer/txs";

  return new StandardRollup<RuntimeCall>(
    {
      ...config,
      client,
      getSerializer,
      context,
      txSubmissionEndpoint,
    },
    //@ts-expect-error
    {
      ...standardTypeBuilder(),
      ...typeBuilderOverrides,
    },
  );
}

export type DeepPartial<T> = T extends unknown[]
  ? T
  : T extends Record<string, unknown>
    ? {
        [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;
