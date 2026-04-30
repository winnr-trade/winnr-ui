import { Hourglass, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useGetShares } from "@/api/market";
import { usePlaceOrder } from "@/api/orderbook/placeOrder";
import { useGetBalance } from "@/api/wallet/getBalance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tokens } from "@/config/constants";
import { useAgentWallet } from "@/hooks/useAgentWallet";
import { useMainWallet } from "@/hooks/useMainWallet";
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
  const [orderType, setOrderType] = useState<OrderType>(OrderType.Market);
  const [selectedOutcome, setSelectedOutcome] = useState<"YES" | "NO">("YES");
  const [shares, setShares] = useState<string>("1000");
  const [limitPrice, setLimitPrice] = useState<string>("");

  const placeOrder = usePlaceOrder();
  const { address } = useMainWallet();
  const { isActive: isAgentActive, enableTrading, isRegistering } = useAgentWallet();
  const { data: sharesData } = useGetShares({ marketId, address });
  const { data: balanceData } = useGetBalance({ address });
  const userBalance = balanceData ? Number(balanceData) / 10 ** tokens.usdc.decimals : 0;

  const parsedShares = Number(shares) || 0;

  const displayYesPrice = tradeSide === "BUY" ? buyYesPrice : sellYesPrice;
  const displayNoPrice = tradeSide === "BUY" ? buyNoPrice : sellNoPrice;

  const currentPrice = selectedOutcome === "YES" ? displayYesPrice : displayNoPrice;
  const effectivePrice = orderType === OrderType.Market ? currentPrice : Number(limitPrice) || 0;

  const totalCost = (parsedShares * effectivePrice) / 100;
  const maxPayout = parsedShares;
  const potentialReturn = maxPayout - totalCost;

  const handleConfirmPosition = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!isAgentActive) {
      await enableTrading();
      return;
    }

    if (parsedShares <= 0) {
      toast.error("Please enter a valid number of shares");
      return;
    }

    const orderPromise = placeOrder.mutateAsync({
      marketId,
      outcome: selectedOutcome === "YES" ? Outcome.Yes : Outcome.No,
      side: tradeSide === "BUY" ? Side.Bid : Side.Ask,
      price: effectivePrice,
      quantity: Math.floor(parsedShares),
      orderType: orderType,
    });

    toast.promise(orderPromise, {
      loading: "Placing order...",
      success: `Successfully ${tradeSide === "BUY" ? "placed buy order" : "placed sell order"} for ${formatNumber(parsedShares, 0, 0)} shares!`,
      error: (err) => `Order failed: ${err.message || "Unknown error"}`,
    });
  };

  return (
    <div className="flex flex-col w-full">
      <div className="border border-border p-6 rounded-none flex flex-col gap-6 bg-transparent">
        {/* Header */}
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground">
            EXECUTE ORDER
          </span>
          <span className="text-[10px] font-sans text-muted-foreground tracking-widest">
            Balance: ${formatNumber(userBalance)}
          </span>
        </div>

        {/* Action Toggles: BUY/SELL & MARKET/LIMIT */}
        <div className="flex justify-between items-center">
          <div className="flex border border-border rounded-none">
            <Button
              variant="ghost"
              className={`h-8 px-4 rounded-none text-[10px] font-sans font-bold tracking-widest ${
                tradeSide === "BUY"
                  ? "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-500"
                  : "text-muted-foreground hover:text-white hover:bg-transparent"
              }`}
              onClick={() => setTradeSide("BUY")}
              disabled={isFrozen}
            >
              BUY
            </Button>
            <Button
              variant="ghost"
              className={`h-8 px-4 rounded-none text-[10px] font-sans font-bold tracking-widest ${
                tradeSide === "SELL"
                  ? "bg-destructive/20 text-destructive hover:bg-destructive/20 hover:text-destructive"
                  : "text-muted-foreground hover:text-white hover:bg-transparent"
              }`}
              onClick={() => setTradeSide("SELL")}
              disabled={isFrozen}
            >
              SELL
            </Button>
          </div>
          <div className="flex border border-border rounded-none">
            <Button
              variant="ghost"
              className={`h-8 w-20 rounded-none text-[10px] font-sans font-bold tracking-widest ${
                orderType === OrderType.Market
                  ? "bg-white text-black hover:bg-white hover:text-black"
                  : "text-muted-foreground hover:text-white hover:bg-transparent"
              }`}
              onClick={() => setOrderType(OrderType.Market)}
              disabled={isFrozen}
            >
              MARKET
            </Button>
            <Button
              variant="ghost"
              className={`h-8 w-20 rounded-none text-[10px] font-sans font-bold tracking-widest ${
                orderType === OrderType.Limit
                  ? "bg-white text-black hover:bg-white hover:text-black"
                  : "text-muted-foreground hover:text-white hover:bg-transparent"
              }`}
              onClick={() => setOrderType(OrderType.Limit)}
              disabled={isFrozen}
            >
              LIMIT
            </Button>
          </div>
        </div>

        {/* YES / NO Toggles */}
        <div className="flex gap-4">
          <div
            className={`flex-1 border p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              selectedOutcome === "YES"
                ? "border-emerald-500 bg-emerald-500/20"
                : "border-border hover:border-emerald-500/50"
            }`}
            onClick={() => !isFrozen && setSelectedOutcome("YES")}
          >
            <div
              className={`text-[11px] font-sans font-bold uppercase tracking-widest ${selectedOutcome === "YES" ? "text-emerald-500" : "text-emerald-500/70"}`}
            >
              {tradeSide} YES
            </div>
            <div className="text-xl font-heading font-bold text-white mt-1">
              {Math.round(displayYesPrice)}¢
            </div>
          </div>

          <div
            className={`flex-1 border p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              selectedOutcome === "NO"
                ? "border-destructive bg-destructive/20"
                : "border-border hover:border-destructive/50"
            }`}
            onClick={() => !isFrozen && setSelectedOutcome("NO")}
          >
            <div
              className={`text-[11px] font-sans font-bold uppercase tracking-widest ${selectedOutcome === "NO" ? "text-destructive" : "text-destructive/70"}`}
            >
              {tradeSide} NO
            </div>
            <div className="text-xl font-heading font-bold text-white mt-1">
              {Math.round(displayNoPrice)}¢
            </div>
          </div>
        </div>

        {/* Limit Price Input */}
        {orderType === OrderType.Limit && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">
              LIMIT PRICE (¢)
            </span>
            <div className="relative flex items-center">
              <Input
                type="number"
                disabled={isFrozen}
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                placeholder="0"
                className="w-full h-12 bg-transparent border border-border text-base font-sans rounded-none px-4 focus-visible:border-white text-white shadow-none"
              />
              <span className="absolute right-4 text-muted-foreground font-sans font-bold">%</span>
            </div>
          </div>
        )}

        {/* Shares Input */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">
              SHARES TO {tradeSide}
            </span>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">
              COST: ${formatNumber(totalCost)}
            </span>
          </div>
          <div className="relative flex items-center">
            <Input
              type="number"
              disabled={isFrozen}
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="0"
              className="w-full h-12 bg-transparent border border-border text-base font-sans rounded-none px-4 focus-visible:border-white text-white shadow-none"
            />
          </div>
        </div>

        {/* Stats List */}
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-sans text-muted-foreground">
              {tradeSide === "BUY" ? "Potential Return" : "Total Proceeds"}
            </span>
            <span
              className={`text-xs font-sans font-bold ${tradeSide === "BUY" ? "text-emerald-500" : "text-white"}`}
            >
              {tradeSide === "BUY" && potentialReturn > 0 ? "+" : ""}
              {tradeSide === "BUY" && potentialReturn > 0 ? "$" : ""}
              {tradeSide === "BUY" ? potentialReturn.toFixed(2) : `$${totalCost.toFixed(2)}`}
            </span>
          </div>
          {tradeSide === "BUY" && (
            <div className="flex justify-between items-center">
              <span className="text-xs font-sans text-muted-foreground">Total Payout</span>
              <span className="text-xs font-sans font-bold text-white">
                ${maxPayout.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleConfirmPosition}
          disabled={
            isFrozen ||
            placeOrder.isPending ||
            isRegistering ||
            (isAgentActive && parsedShares <= 0)
          }
          className={`w-full h-12 text-white border-0 rounded-none mt-2 tracking-[0.2em] font-sans font-bold text-[11px] uppercase transition-all shadow-none ${
            tradeSide === "BUY"
              ? "bg-emerald-500 hover:bg-emerald-400"
              : "bg-destructive hover:bg-red-500"
          }`}
        >
          {placeOrder.isPending || isRegistering ? (
            <Loader2 className="size-4 animate-spin" />
          ) : !isAgentActive ? (
            "ENABLE TRADING"
          ) : isFullyResolved ? (
            "RESOLVED"
          ) : isAwaitingResolution ? (
            "AWAITING"
          ) : isFrozen ? (
            "HALTED"
          ) : tradeSide === "BUY" ? (
            "PLACE ORDER"
          ) : (
            "SELL POSITION"
          )}
        </Button>
      </div>
    </div>
  );
}
