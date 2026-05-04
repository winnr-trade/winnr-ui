export type AddressResolverConfig = { address: string };
export type PythResolverConfig = {
  feedId: string;
  lowerBound?: bigint;
  upperBound?: bigint;
};
// biome-ignore lint/complexity/noBannedTypes: temporary
export type OptimisticResolverConfig = {};
export type Resolver = {
  type: string;
  config: AddressResolverConfig | PythResolverConfig | OptimisticResolverConfig;
};

export interface Market {
  id: string;
  category: string;
  subcategory: string;
  question: string;
  probability: number;
  totalVolume: bigint;
  totalShares: bigint;
  totalSharesVolume: bigint;
  resolutionTime: number;
  outcome: "yes" | "no" | null;
  status: string;
  creator: string;
  collateralToken: string;
  createdAt: number;
  eventNumber: number;
  txHash: string;
  resolver: Resolver;
  bestBid: bigint | null;
  bestAsk: bigint | null;
}

export interface Trade {
  id: number;
  marketId: number;
  makerOrderId: number;
  takerOrderId: number;
  price: number;
  quantity: number;
  buyer: string;
  seller: string;
  settlementKind: "mint_pair" | "transfer_yes" | "transfer_no" | "merge_pair";
  timestamp: number;
  txHash: string;
}

export type ChartDataPoint = {
  time: string;
  price: number;
};

export type ChartResponse = {
  success: boolean;
  resolution: string;
  data: ChartDataPoint[];
};
