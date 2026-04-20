export enum Outcome {
  Yes = "yes",
  No = "no",
}

export enum Side {
  Bid = "bid",
  Ask = "ask",
}

export enum OrderType {
  Limit = "limit",
  Market = "market",
  PostOnly = "post_only",
  ImmediateOrCancel = "immediate_or_cancel",
  FillOrKill = "fill_or_kill",
}

type ResolverAddress = {
  Address: string;
};
type ResolverPyth = {
  Pyth: {
    feed_id: number[];
    lower_bound?: number;
    upper_bound?: number;
  };
};
type ResolverOptimistic = { Optimistic: {} };
export type Resolver = ResolverAddress | ResolverPyth | ResolverOptimistic;

type AddressResolutionData = { outcome: Outcome };
type PythResolutionData = { publishTime: number };
export type ResolutionData = AddressResolutionData | PythResolutionData;
