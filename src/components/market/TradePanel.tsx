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
  buyNoPrice: number;
  isFrozen: boolean;
  isFullyResolved: boolean;
  isAwaitingResolution: boolean;
}

export function TradePanel({
  marketId,
  buyYesPrice,
  buyNoPrice,
  isFrozen,
  isFullyResolved,
  isAwaitingResolution,
}: TradePanelProps) {
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
  const currentPrice = selectedOutcome === "YES" ? buyYesPrice : buyNoPrice;
  const effectivePrice = orderType === OrderType.Market ? currentPrice : Number(limitPrice) || 0;
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
      side: Side.Bid,
      price: effectivePrice,
      quantity: Math.floor(shares),
      orderType: orderType,
    });

    toast.promise(orderPromise, {
      loading: "Placing order...",
      success: `Successfully bought ${formatNumber(shares, 0, 0)} shares!`,
      error: (err) => `Order failed: ${err.message || "Unknown error"}`,
    });
  };

  return (
    <Card className="bg-surface-container-high border-0 shadow-none p-6 sticky top-6 relative">
      <div className="flex justify-between items-center mb-6">
        <Heading className="text-xl">TAKE POSITION</Heading>

        <div className="flex bg-surface-container-low p-1 rounded-sm">
          <button
            type="button"
            onClick={() => setOrderType(OrderType.Market)}
            className={`text-[10px] font-bold font-sans uppercase tracking-widest px-3 py-1.5 rounded-sm transition-all ${
              orderType === OrderType.Market
                ? "bg-surface-container-high text-primary shadow-[0_0_10px_rgba(159,251,6,0.1)]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Market
          </button>
          <button
            type="button"
            onClick={() => setOrderType(OrderType.Limit)}
            className={`text-[10px] font-bold font-sans uppercase tracking-widest px-3 py-1.5 rounded-sm transition-all ${
              orderType === OrderType.Limit
                ? "bg-surface-container-high text-primary shadow-[0_0_10px_rgba(159,251,6,0.1)]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Limit
          </button>
        </div>
      </div>

      {/* User Position */}
      {address && (
        <div className="bg-surface-container-low rounded-lg p-3 mb-6 flex justify-between items-center text-sm font-sans border border-surface-container">
          <span className="text-muted-foreground uppercase tracking-widest font-bold text-[10px]">
            YOUR POSITION
          </span>
          <div className="flex gap-3">
            <span className="text-primary font-mono font-bold">
              {formatNumber(sharesData?.yes || 0, 0, 0)} YES
            </span>
            <span className="text-destructive font-mono font-bold">
              {formatNumber(sharesData?.no || 0, 0, 0)} NO
            </span>
          </div>
        </div>
      )}

      {/* Action Toggle */}
      <div className="flex gap-4 mb-8">
        <button
          type="button"
          onClick={() => setSelectedOutcome("YES")}
          className={`flex-1 rounded-lg p-4 border text-center cursor-pointer relative transition-all duration-200 ${
            selectedOutcome === "YES"
              ? "bg-surface-container-low border-primary shadow-[0_0_15px_rgba(159,251,6,0.15)]"
              : "bg-surface-container-lowest border-transparent hover:bg-surface-container-low"
          }`}
        >
          <div
            className={`font-heading font-bold text-xl mb-1 ${selectedOutcome === "YES" ? "text-primary" : "text-foreground"}`}
          >
            YES
          </div>
          <div
            className={`text-xs font-sans ${selectedOutcome === "YES" ? "text-primary" : "text-muted-foreground"}`}
          >
            {buyYesPrice.toFixed(1)}¢
          </div>
          {/* Glow active indicator */}
          {selectedOutcome === "YES" && (
            <div className="absolute top-0 right-0 size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(159,251,6,1)] m-2 animate-pulse"></div>
          )}
        </button>
        <button
          type="button"
          onClick={() => setSelectedOutcome("NO")}
          className={`flex-1 rounded-lg p-4 border text-center cursor-pointer relative transition-all duration-200 ${
            selectedOutcome === "NO"
              ? "bg-surface-container-low border-destructive shadow-[0_0_15px_rgba(255,50,50,0.15)]"
              : "bg-surface-container-lowest border-transparent hover:bg-surface-container-low"
          }`}
        >
          <div
            className={`font-heading font-bold text-xl mb-1 ${selectedOutcome === "NO" ? "text-destructive" : "text-foreground"}`}
          >
            NO
          </div>
          <div
            className={`text-xs font-sans ${selectedOutcome === "NO" ? "text-destructive" : "text-muted-foreground"}`}
          >
            {buyNoPrice.toFixed(1)}¢
          </div>
          {/* Glow active indicator */}
          {selectedOutcome === "NO" && (
            <div className="absolute top-0 right-0 size-2 rounded-full bg-destructive shadow-[0_0_8px_rgba(255,50,50,1)] m-2 animate-pulse"></div>
          )}
        </button>
      </div>

      {/* Input Form */}
      <div className="flex flex-col gap-6">
        {orderType === OrderType.Limit && (
          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold font-sans text-foreground tracking-widest uppercase">
                LIMIT PRICE (¢)
              </span>
            </div>
            <div className="relative">
              <Input
                type="number"
                min="1"
                max="99"
                step="1"
                className="h-16 text-3xl font-heading bg-background font-bold border-b-2 border-primary pt-0 pb-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0"
                value={limitPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setLimitPrice("");
                    return;
                  }
                  if (!/^\d+$/.test(val)) return;
                  const parsed = parseInt(val, 10);
                  if (parsed > 99) {
                    setLimitPrice("99");
                  } else {
                    setLimitPrice(parsed.toString());
                  }
                }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-heading font-bold text-lg text-muted-foreground pointer-events-none">
                ¢
              </span>
            </div>
          </div>
        )}

        <div className="mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold font-sans text-foreground tracking-widest uppercase">
              STAKE AMOUNT
            </span>
            <button
              type="button"
              onClick={() => setAmount(userBalance.toString())}
              className="text-[10px] font-bold font-sans text-primary tracking-widest uppercase cursor-pointer hover:underline text-right"
            >
              BAL: ${formatNumber(userBalance)}
            </button>
          </div>
          <div className="relative">
            <Input
              type="number"
              min="0"
              max={userBalance}
              step="0.01"
              className="h-16 text-3xl font-heading bg-background font-bold border-b-2 border-primary pt-0 pb-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-heading font-bold text-lg text-muted-foreground pointer-events-none">
              USD
            </span>
          </div>
        </div>

        {/* Slider / Percentages */}
        <div className="flex flex-col gap-4">
          <div className="w-full h-8 relative flex items-center group">
            <div className="w-full h-2 bg-surface-container-highest rounded-full absolute top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden">
              <div
                className={`h-full ${selectedOutcome === "YES" ? "bg-primary/60" : "bg-destructive/60"}`}
                style={{
                  width: `${Math.min(100, Math.max(0, (Number(amount || 0) / userBalance) * 100))}%`,
                }}
              ></div>
            </div>
            <input
              type="range"
              min="0"
              max={userBalance}
              step="0.01"
              value={amount || 0}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-4 rounded-full pointer-events-none transition-all duration-75 ${
                selectedOutcome === "YES"
                  ? "bg-primary shadow-[0_0_8px_rgba(159,251,6,0.8)]"
                  : "bg-destructive shadow-[0_0_8px_rgba(255,50,50,0.8)]"
              }`}
              style={{
                left: `${Math.min(100, Math.max(0, (Number(amount || 0) / userBalance) * 100))}%`,
              }}
            ></div>
          </div>
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((pct) => (
              <button
                type="button"
                key={pct}
                onClick={() =>
                  setAmount(
                    pct === 100
                      ? userBalance.toString()
                      : ((userBalance * pct) / 100).toFixed(2),
                  )
                }
                className={`flex-1 bg-surface-container px-0 py-2 rounded text-center text-[10px] font-bold font-sans text-muted-foreground cursor-pointer transition-colors ${
                  selectedOutcome === "YES"
                    ? "hover:bg-primary/20 hover:text-primary"
                    : "hover:bg-destructive/20 hover:text-destructive"
                }`}
              >
                {pct === 100 ? "MAX" : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="bg-surface-container-low rounded-lg p-4 flex flex-col gap-3 mt-4">
          <div className="flex justify-between text-sm font-sans text-muted-foreground">
            <span>Est. Shares</span>
            <span className="font-bold text-foreground font-mono">
              {formatNumber(shares, 0, 0)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-sans text-muted-foreground">
            <span>Max Payout</span>
            <span className="font-bold text-primary font-mono">
              ${formatNumber(maxPayout)}
            </span>
          </div>
          <div className="w-full border-t border-surface-container-highest my-1"></div>
          <div className="flex justify-between text-sm font-sans text-foreground font-bold">
            <span>Potential Return</span>
            <span className="text-primary font-mono">+{potentialReturn.toFixed(1)}%</span>
          </div>
        </div>

        <Button
          onClick={handleConfirmPosition}
          disabled={
            isFrozen ||
            placeOrder.isPending ||
            !signer ||
            parsedAmount <= 0 ||
            (orderType === OrderType.Limit &&
              (!limitPrice || Number(limitPrice) <= 0 || Number(limitPrice) >= 100))
          }
          className="w-full h-16 text-xl tracking-wide uppercase shadow-[0_0_20px_rgba(159,251,6,0.25)] hover:shadow-[0_0_30px_rgba(159,251,6,0.4)] disabled:shadow-none"
        >
          {placeOrder.isPending ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              PLACING ORDER...
            </>
          ) : (
            "CONFIRM POSITION"
          )}
        </Button>
      </div>

      {/* Frozen Overlay */}
      {isFrozen && (
        <div className="absolute inset-0 bg-surface-container-high/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-3 z-20">
          {isFullyResolved ? (
            <Lock className="size-8 text-muted-foreground" />
          ) : (
            <Hourglass className="size-8 text-yellow-500 animate-pulse" />
          )}
          <span
            className={`text-sm font-bold font-sans uppercase tracking-widest ${
              isFullyResolved ? "text-muted-foreground" : "text-yellow-500"
            }`}
          >
            {isFullyResolved ? "Market Resolved" : "Awaiting Resolution"}
          </span>
          <span className="text-xs font-sans text-muted-foreground">
            {isFullyResolved
              ? "Trading is no longer available"
              : "Market has closed — pending outcome"}
          </span>
        </div>
      )}
    </Card>
  );
}
