export interface PortfolioPosition {
  id: string;
  marketId: number;
  market: string;
  fullMarket: string;
  outcome: string;
  position: string;
  avgPrice: string;
  currentPrice: string;
  unrealizedPnl: string;
  pnlPositive: boolean;
  value: number;
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
  stats: {
    totalValue: string;
    unrealizedPnl: string;
    unrealizedPnlPercent: string;
    availableBalance: string;
  };
  activePositions: PortfolioPosition[];
  recentActivity: PortfolioActivity[];
}
