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
    <Card className="bg-surface-container-high border-0 shadow-none p-6 sticky top-6 relative">
      <div className="flex justify-between items-center mb-6">
        <div className="flex bg-surface-container-low p-1 rounded-sm">
          <button
            type="button"
            disabled={isFrozen}
            onClick={() => setTradeSide("BUY")}
            className={`text-[10px] font-bold font-sans uppercase tracking-widest px-4 py-1.5 rounded-sm transition-all ${
              tradeSide === "BUY"
                ? "bg-primary text-black shadow-[0_0_10px_rgba(159,251,6,0.2)]"
                : "text-muted-foreground hover:text-foreground"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Buy
          </button>
          <button
            type="button"
            disabled={isFrozen}
            onClick={() => setTradeSide("SELL")}
            className={`text-[10px] font-bold font-sans uppercase tracking-widest px-4 py-1.5 rounded-sm transition-all ${
              tradeSide === "SELL"
                ? "bg-destructive text-white shadow-[0_0_10px_rgba(255,50,50,0.2)]"
                : "text-muted-foreground hover:text-foreground"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Sell
          </button>
        </div>

        <div className="flex bg-surface-container-low p-1 rounded-sm">
          <button
            type="button"
            disabled={isFrozen}
            onClick={() => setOrderType(OrderType.Market)}
            className={`text-[10px] font-bold font-sans uppercase tracking-widest px-3 py-1.5 rounded-sm transition-all ${
              orderType === OrderType.Market
                ? "bg-surface-container-high text-primary shadow-[0_0_10px_rgba(159,251,6,0.1)]"
                : "text-muted-foreground hover:text-foreground"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Market
          </button>
          <button
            type="button"
            disabled={isFrozen}
            onClick={() => setOrderType(OrderType.Limit)}
            className={`text-[10px] font-bold font-sans uppercase tracking-widest px-3 py-1.5 rounded-sm transition-all ${
              orderType === OrderType.Limit
                ? "bg-surface-container-high text-primary shadow-[0_0_10px_rgba(159,251,6,0.1)]"
                : "text-muted-foreground hover:text-foreground"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
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
          disabled={isFrozen}
          onClick={() => setSelectedOutcome("YES")}
          className={`flex-1 rounded-lg p-4 border text-center cursor-pointer relative transition-all duration-200 ${
            selectedOutcome === "YES"
              ? tradeSide === "BUY"
                ? "bg-surface-container-low border-primary shadow-[0_0_15px_rgba(159,251,6,0.15)]"
                : "bg-surface-container-low border-destructive shadow-[0_0_15px_rgba(255,50,50,0.15)]"
              : "bg-surface-container-lowest border-transparent hover:bg-surface-container-low"
          } disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          <div
            className={`font-heading font-bold text-xl mb-1 ${
              selectedOutcome === "YES"
                ? tradeSide === "BUY"
                  ? "text-primary"
                  : "text-destructive"
                : "text-foreground"
            }`}
          >
            YES
          </div>
          <div
            className={`text-xs font-sans ${
              selectedOutcome === "YES"
                ? tradeSide === "BUY"
                  ? "text-primary"
                  : "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {displayYesPrice.toFixed(1)}¢
          </div>
          {/* Glow active indicator */}
          {selectedOutcome === "YES" && !isFrozen && (
            <div
              className={`absolute top-0 right-0 size-2 rounded-full m-2 animate-pulse ${
                tradeSide === "BUY"
                  ? "bg-primary shadow-[0_0_8px_rgba(159,251,6,1)]"
                  : "bg-destructive shadow-[0_0_8px_rgba(255,50,50,1)]"
              }`}
            ></div>
          )}
        </button>
        <button
          type="button"
          disabled={isFrozen}
          onClick={() => setSelectedOutcome("NO")}
          className={`flex-1 rounded-lg p-4 border text-center cursor-pointer relative transition-all duration-200 ${
            selectedOutcome === "NO"
              ? tradeSide === "BUY"
                ? "bg-surface-container-low border-primary shadow-[0_0_15px_rgba(159,251,6,0.15)]"
                : "bg-surface-container-low border-destructive shadow-[0_0_15px_rgba(255,50,50,0.15)]"
              : "bg-surface-container-lowest border-transparent hover:bg-surface-container-low"
          } disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          <div
            className={`font-heading font-bold text-xl mb-1 ${
              selectedOutcome === "NO"
                ? tradeSide === "BUY"
                  ? "text-primary"
                  : "text-destructive"
                : "text-foreground"
            }`}
          >
            NO
          </div>
          <div
            className={`text-xs font-sans ${
              selectedOutcome === "NO"
                ? tradeSide === "BUY"
                  ? "text-primary"
                  : "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {displayNoPrice.toFixed(1)}¢
          </div>
          {/* Glow active indicator */}
          {selectedOutcome === "NO" && !isFrozen && (
            <div
              className={`absolute top-0 right-0 size-2 rounded-full m-2 animate-pulse ${
                tradeSide === "BUY"
                  ? "bg-primary shadow-[0_0_8px_rgba(159,251,6,1)]"
                  : "bg-destructive shadow-[0_0_8px_rgba(255,50,50,1)]"
              }`}
            ></div>
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
                disabled={isFrozen}
                className={`h-16 text-3xl font-heading bg-background font-bold border-b-2 pt-0 pb-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  tradeSide === "BUY" ? "border-primary" : "border-destructive"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
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
              {tradeSide === "BUY" ? "STAKE AMOUNT" : "AMOUNT TO SELL"}
            </span>
            <button
              type="button"
              disabled={isFrozen}
              onClick={() => setAmount(userBalance.toString())}
              className={`text-[10px] font-bold font-sans tracking-widest uppercase cursor-pointer hover:underline text-right ${
                tradeSide === "BUY" ? "text-primary" : "text-destructive"
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline`}
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
              disabled={isFrozen}
              className={`h-16 text-3xl font-heading bg-background font-bold border-b-2 pt-0 pb-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                tradeSide === "BUY" ? "border-primary" : "border-destructive"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
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
                className={`h-full ${tradeSide === "BUY" ? "bg-primary/60" : "bg-destructive/60"}`}
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
              disabled={isFrozen}
              value={amount || 0}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
            />
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-4 rounded-full pointer-events-none transition-all duration-75 ${
                tradeSide === "BUY"
                  ? "bg-primary shadow-[0_0_8px_rgba(159,251,6,0.8)]"
                  : "bg-destructive shadow-[0_0_8px_rgba(255,50,50,0.8)]"
              } ${isFrozen ? "opacity-50" : ""}`}
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
                disabled={isFrozen}
                onClick={() =>
                  setAmount(
                    pct === 100 ? userBalance.toString() : ((userBalance * pct) / 100).toFixed(2),
                  )
                }
                className={`flex-1 bg-surface-container px-0 py-2 rounded text-center text-[10px] font-bold font-sans text-muted-foreground cursor-pointer transition-colors ${
                  tradeSide === "BUY"
                    ? "hover:bg-primary/20 hover:text-primary"
                    : "hover:bg-destructive/20 hover:text-destructive"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {pct === 100 ? "MAX" : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="bg-surface-container-low rounded-lg p-4 flex flex-col gap-3 mt-4">
          <div className="flex justify-between text-sm font-sans text-muted-foreground">
            <span>{tradeSide === "BUY" ? "Est. Shares" : "Shares to Sell"}</span>
            <span className="font-bold text-foreground font-mono">
              {formatNumber(shares, 0, 0)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-sans text-muted-foreground">
            <span>{tradeSide === "BUY" ? "Max Payout" : "Total Proceeds"}</span>
            <span
              className={`font-bold font-mono ${
                tradeSide === "BUY" ? "text-primary" : "text-destructive"
              }`}
            >
              ${formatNumber(maxPayout)}
            </span>
          </div>
          {tradeSide === "BUY" && (
            <>
              <div className="w-full border-t border-surface-container-highest my-1"></div>
              <div className="flex justify-between text-sm font-sans text-foreground font-bold">
                <span>Potential Return</span>
                <span className="text-primary font-mono">+{potentialReturn.toFixed(1)}%</span>
              </div>
            </>
          )}
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
          className={`w-full h-16 text-xl tracking-wide uppercase disabled:shadow-none transition-all ${
            tradeSide === "BUY"
              ? "bg-primary text-black shadow-[0_0_20px_rgba(159,251,6,0.25)] hover:shadow-[0_0_30_px_rgba(159,251,6,0.4)]"
              : "bg-destructive text-white shadow-[0_0_20px_rgba(255,50,50,0.25)] hover:shadow-[0_0_30px_rgba(255,50,50,0.4)]"
          }`}
        >
          {placeOrder.isPending ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              {tradeSide === "BUY" ? "PLACING ORDER..." : "SELLING SHARES..."}
            </>
          ) : isFullyResolved ? (
            "MARKET RESOLVED"
          ) : isAwaitingResolution ? (
            "AWAITING RESOLUTION"
          ) : isFrozen ? (
            "TRADING HALTED"
          ) : (
            `${tradeSide?.toUpperCase()} ${selectedOutcome?.toUpperCase()}`
          )}
        </Button>
      </div>
    </Card>
  );
}
