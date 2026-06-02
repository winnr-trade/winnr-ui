"use client";

import { useActivePositions } from "@/api/portfolio";
import { PortfolioActivity } from "@/components/portfolio/PortfolioActivity";
import { PortfolioHeader } from "@/components/portfolio/PortfolioHeader";
import { PortfolioOpenOrders } from "@/components/portfolio/PortfolioOpenOrders";
import { PortfolioPositions } from "@/components/portfolio/PortfolioPositions";
import { PortfolioStats } from "@/components/portfolio/PortfolioStats";
import { StealthAddresses } from "@/components/portfolio/StealthAddresses";
import { StealthOpenOrders } from "@/components/portfolio/StealthOpenOrders";
import { StealthPositions } from "@/components/portfolio/StealthPositions";
import { useShieldedWallet } from "@/hooks/useShieldedWallet";

export default function PortfolioPage() {
  const { isLoading, error } = useActivePositions();
  const { isEnabled } = useShieldedWallet();

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex justify-center items-center h-64 text-muted-foreground font-sans text-xs tracking-widest uppercase animate-pulse">
        Loading Portfolio...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center text-red-500 font-sans">
        Failed to load portfolio data.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 md:p-12 max-w-6xl">
      <PortfolioHeader />
      <PortfolioStats />
      <StealthAddresses />
      <StealthPositions />
      {!isEnabled && <PortfolioPositions />}
      {isEnabled ? <StealthOpenOrders /> : <PortfolioOpenOrders />}
      <PortfolioActivity />
    </div>
  );
}
