export interface PortfolioPosition {
  marketId: number;
  question: string;
  outcome?: string;
  quantityYes: number;
  quantityNo: number;
  totalCostYes: bigint;
  totalCostNo: bigint;
  bestBid: bigint | null;
  bestAsk: bigint | null;
}

export interface PortfolioActivity {
  id: string;
  action: string;
  subtext: string;
  amount: string;
  amountPositive: boolean;
  date: string;
  icon: string;
}

export interface PortfolioData {
  activePositions: PortfolioPosition[];
}
