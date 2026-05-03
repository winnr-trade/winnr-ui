export interface PortfolioPosition {
  marketId: number;
  question: string;
  outcome?: string;
  yesShares: number;
  noShares: number;
  avgPriceYes?: number;
  avgPriceNo?: number;
  latestMidPrice?: number;
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
