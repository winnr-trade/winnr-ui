"use client";

import { Hourglass, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useGetShares } from "@/api/market";
import { usePlaceOrder } from "@/api/orderbook/placeOrder";
import { useGetBalance } from "@/api/wallet/useGetBalance";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heading } from "@/components/ui/typography";
import { tokens } from "@/config/constants";
import { useUserWallet } from "@/hooks/useUserWallet";
import { OrderType, Outcome, Side } from "@/lib/rollup/types";
import { formatNumber } from "@/utils";

interface TradePanelProps {
  marketId: number;
  buyYesPrice: number;
  sellYesPrice: number;
  buyNoPrice: number;
  sellNoPrice: number;
  isFrozen: boolean;
  isFullyResolved: boolean;
  isAwaitingResolution: boolean;
}

export function TradePanel({
  marketId,
  buyYesPrice,
  sellYesPrice,
  buyNoPrice,
  sellNoPrice,
  isFrozen,
  isFullyResolved,
  isAwaitingResolution,
}: TradePanelProps) {
  const [tradeSide, setTradeSide] = useState<"BUY" | "SELL">("BUY");
  const [selectedOutcome, setSelectedOutcome] = useState<"YES" | "NO">("YES");
  const [orderType, setOrderType] = useState<OrderType>(OrderType.Market);
  const [amount, setAmount] = useState<string>("");
  const [limitPrice, setLimitPrice] = useState<string>("");

  const placeOrder = usePlaceOrder();
  const { address, signer } = useUserWallet();
  const { data: sharesData } = useGetShares(marketId, address);
  const { data: balanceData } = useGetBalance(address);
  const userBalance = balanceData ? Number(balanceData) / 10 ** tokens.usdc.decimals : 0;

  const parsedAmount = Number(amount) || 0;

  // Determine which price to show based on Side and Outcome
  const displayYesPrice = tradeSide === "BUY" ? buyYesPrice : sellYesPrice;
  const displayNoPrice = tradeSide === "BUY" ? buyNoPrice : sellNoPrice;

  const currentPrice = selectedOutcome === "YES" ? displayYesPrice : displayNoPrice;
  const effectivePrice = orderType === OrderType.Market ? currentPrice : Number(limitPrice) || 0;

  // For Sell orders, if they are entering USD, we still calculate shares to sell.
  // In a real app, selling might involve entering shares directly.
  const shares = effectivePrice > 0 ? Math.floor(parsedAmount / (effectivePrice / 100)) : 0;
  const maxPayout = shares;
  const potentialReturn = parsedAmount > 0 ? ((maxPayout - parsedAmount) / parsedAmount) * 100 : 0;

  const handleConfirmPosition = async () => {
    if (!signer) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (shares <= 0) {
      toast.error("Invalid shares calculated");
      return;
    }

    const orderPromise = placeOrder.mutateAsync({
      marketId,
      outcome: selectedOutcome === "YES" ? Outcome.Yes : Outcome.No,
      side: tradeSide === "BUY" ? Side.Bid : Side.Ask,
      price: effectivePrice,
      quantity: Math.floor(shares),
      orderType: orderType,
    });

    toast.promise(orderPromise, {
      loading: "Placing order...",
      success: `Successfully ${tradeSide === "BUY" ? "bought" : "sold"} ${formatNumber(shares, 0, 0)} shares!`,
      error: (err) => `Order failed: ${err.message || "Unknown error"}`,
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-surface-container border-0 p-6 sm:p-8 rounded-sm shadow-none flex flex-col gap-6 text-[#f4fffa]">
        {/* Header Row: Title & Action Toggles */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground">
            POSITION ENTRY
          </span>
          <div className="flex gap-4">
            <div className="flex gap-2 text-[10px] uppercase font-sans font-bold tracking-widest text-muted-foreground">
              <Button
                variant="tab"
                size="tab"
                disabled={isFrozen}
                onClick={() => setTradeSide("BUY")}
                data-active={tradeSide === "BUY"}
              >
                BUY
              </Button>
              <Button
                variant="tab"
                size="tab"
                disabled={isFrozen}
                onClick={() => setTradeSide("SELL")}
                data-active={tradeSide === "SELL"}
              >
                SELL
              </Button>
            </div>
            <div className="flex gap-2 text-[10px] uppercase font-sans font-bold tracking-widest text-muted-foreground border-l border-white/10 pl-4">
              <Button
                variant="tabWhite"
                size="tab"
                disabled={isFrozen}
                onClick={() => setOrderType(OrderType.Market)}
                data-active={orderType === OrderType.Market}
              >
                MARKET
              </Button>
              <Button
                variant="tabWhite"
                size="tab"
                disabled={isFrozen}
                onClick={() => setOrderType(OrderType.Limit)}
                data-active={orderType === OrderType.Limit}
              >
                LIMIT
              </Button>
            </div>
          </div>
        </div>

        {/* YES / NO Toggle Block  */}
        <div className="flex w-full h-12 bg-[#0a110f] rounded-sm p-1 border border-white/[0.02]">
          <Button
            variant="outcome"
            size="outcome"
            disabled={isFrozen}
            onClick={() => setSelectedOutcome("YES")}
            data-active={selectedOutcome === "YES"}
          >
            YES
          </Button>
          <Button
            variant="outcome"
            size="outcome"
            disabled={isFrozen}
            onClick={() => setSelectedOutcome("NO")}
            data-active={selectedOutcome === "NO"}
          >
            NO
          </Button>
        </div>

        {orderType === OrderType.Limit && (
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground">
              LIMIT PRICE (¢)
            </span>
            <div className="relative">
              <Input
                type="number"
                disabled={isFrozen}
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="w-full h-14 bg-[#0a110f] border border-white/[0.02] text-xl font-heading font-bold rounded-sm px-4 focus-visible:border-primary/50 text-[#f4fffa]"
                placeholder="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-sans text-muted-foreground">
                ¢
              </span>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {tradeSide === "BUY" ? "AMOUNT TO BET (USDC)" : "SHARES TO SELL"}
            </span>
            <span className="text-[10px] font-sans text-muted-foreground tracking-widest">
              BAL: {formatNumber(userBalance)}
            </span>
          </div>
          <div className="relative flex items-center">
            <Input
              type="number"
              disabled={isFrozen}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full h-14 bg-[#0a110f] border border-white/[0.02] text-xl font-heading font-bold rounded-sm pl-4 pr-[120px] focus-visible:border-primary/50 text-[#f4fffa]"
            />
            <div className="absolute right-2 flex gap-1">
              <Button
                variant="tech"
                size="xs"
                className="shadow-none"
                onClick={() => setAmount(((userBalance * 25) / 100).toFixed(2))}
              >
                25%
              </Button>
              <Button
                variant="tech"
                size="xs"
                className="shadow-none"
                onClick={() => setAmount(userBalance.toString())}
              >
                MAX
              </Button>
            </div>
          </div>
        </div>

        {/* Stats List */}
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex justify-between items-center border-b border-white/[0.05] pb-3">
            <span className="text-[11px] font-sans text-muted-foreground">
              {tradeSide === "BUY" ? "Potential Payout" : "Total Proceeds"}
            </span>
            <span
              className={`text-[13px] font-heading font-bold ${tradeSide === "BUY" ? "text-primary" : "text-[#f4fffa]"}`}
            >
              ${formatNumber(maxPayout)}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-white/[0.05] pb-3">
            <span className="text-[11px] font-sans text-muted-foreground">Price per share</span>
            <span className="text-[13px] font-heading font-bold text-[#f4fffa]">
              ${(effectivePrice / 100).toFixed(3)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-sans text-muted-foreground">Slippage</span>
            <span className="text-[13px] font-heading font-bold text-[#f4fffa]">0.05%</span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleConfirmPosition}
          disabled={isFrozen || placeOrder.isPending || !signer || parsedAmount <= 0}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-black border-0 rounded-sm mt-4 tracking-[0.3em] font-sans font-bold text-[11px] uppercase transition-all shadow-none"
        >
          {placeOrder.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isFullyResolved ? (
            "R E S O L V E D"
          ) : isAwaitingResolution ? (
            "A W A I T I N G"
          ) : isFrozen ? (
            "H A L T E D"
          ) : tradeSide === "BUY" ? (
            "C O N F I R M  P O S I T I O N"
          ) : (
            "S E L L  P O S I T I O N"
          )}
        </Button>
      </div>
    </div>
  );
}
