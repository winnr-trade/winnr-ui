import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useMarketDetail } from "@/api/market";
import { usePlaceOrder } from "@/api/orderbook/placeOrder";
import { useGetBalance } from "@/api/wallet/getBalance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAgentWallet } from "@/hooks/useAgentWallet";
import { useMainWallet } from "@/hooks/useMainWallet";
import { OrderType, Outcome, Side } from "@/lib/rollup/types";
import { formatCents, formatNumber, formatUsd, parseCents, parseUsd } from "@/utils";
import { deriveMarketState } from "@/utils/market";

const tradeSchema = z.object({
  side: z.enum([Side.Bid, Side.Ask]),
  orderType: z.enum([OrderType.Market, OrderType.Limit]),
  outcome: z.enum([Outcome.Yes, Outcome.No]),
  shares: z.number().min(1, "Please enter a valid number of shares"),
  limitPrice: z.number().min(0).max(100).optional(),
});

type TradeFormValues = z.infer<typeof tradeSchema>;

interface TradePanelProps {
  marketId: number;
}

export function TradePanel({ marketId }: TradePanelProps) {
  const { address } = useMainWallet();
  const { isActive: isAgentActive, enableTrading, isRegistering } = useAgentWallet();
  const { data: balanceData } = useGetBalance({ address });
  const { data: market } = useMarketDetail({ id: marketId });
  const placeOrder = usePlaceOrder();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      side: Side.Bid,
      orderType: OrderType.Market,
      outcome: Outcome.Yes,
      shares: 100,
      limitPrice: 50,
    },
  });

  const {
    buyYesPrice,
    sellYesPrice,
    buyNoPrice,
    sellNoPrice,
    isFrozen,
    isFullyResolved,
    isAwaitingResolution,
  } = deriveMarketState(market);

  const side = watch("side");
  const orderType = watch("orderType");
  const outcome = watch("outcome");
  const shares = watch("shares");
  const limitPrice = watch("limitPrice");

  const userBalance = formatUsd(balanceData || 0);

  const yesPrice = side === Side.Bid ? buyYesPrice : sellYesPrice;
  const noPrice = side === Side.Bid ? buyNoPrice : sellNoPrice;

  const currentPrice = outcome === Outcome.Yes ? yesPrice : noPrice;
  const effectivePrice =
    orderType === OrderType.Market ? currentPrice : parseCents(limitPrice || 0);

  const totalCost = BigInt(shares || 0) * effectivePrice;
  const maxPayout = BigInt(shares || 0) * parseUsd(1);
  const potentialReturn = maxPayout - totalCost;

  const onFormSubmit = async (values: TradeFormValues) => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    const orderPromise = placeOrder.mutateAsync({
      marketId,
      outcome: values.outcome,
      side: values.side,
      price:
        values.orderType === OrderType.Market ? currentPrice : parseCents(values.limitPrice || 0),
      quantity: Math.floor(values.shares),
      orderType: values.orderType,
    });

    toast.promise(orderPromise, {
      loading: "Placing order...",
      success: `Successfully ${values.side === Side.Bid ? "placed buy order" : "placed sell order"} for ${formatNumber(values.shares, 0, 0)} shares!`,
      error: (err) => `Order failed: ${err.message || "Unknown error"}`,
    });
  };

  const getButtonLabel = () => {
    if (placeOrder.isPending) return <Loader2 className="size-4 animate-spin" />;
    if (isFullyResolved) return "RESOLVED";
    if (isAwaitingResolution) return "AWAITING";
    if (isFrozen) return "HALTED";
    return side === Side.Bid ? "PLACE ORDER" : "SELL POSITION";
  };

  const tradeButtonColor =
    side === Side.Bid ? "bg-emerald-500 hover:bg-emerald-400" : "bg-destructive hover:bg-red-500";

  return (
    <div className="flex flex-col w-full">
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="border border-border p-6 rounded-none flex flex-col gap-6 bg-transparent"
      >
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
          <div className="flex border border-border rounded-none overflow-hidden">
            <label className="contents">
              <input type="radio" className="hidden" value={Side.Bid} {...register("side")} />
              <Button
                type="button"
                variant="ghost"
                className={`h-8 px-4 rounded-none text-[10px] font-sans font-bold tracking-widest ${
                  side === Side.Bid
                    ? "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-500"
                    : "text-muted-foreground hover:text-white hover:bg-transparent"
                }`}
                onClick={() => setValue("side", Side.Bid)}
                disabled={isFrozen}
              >
                BUY
              </Button>
            </label>
            <label className="contents">
              <input type="radio" className="hidden" value={Side.Ask} {...register("side")} />
              <Button
                type="button"
                variant="ghost"
                className={`h-8 px-4 rounded-none text-[10px] font-sans font-bold tracking-widest ${
                  side === Side.Ask
                    ? "bg-destructive/20 text-destructive hover:bg-destructive/20 hover:text-destructive"
                    : "text-muted-foreground hover:text-white hover:bg-transparent"
                }`}
                onClick={() => setValue("side", Side.Ask)}
                disabled={isFrozen}
              >
                SELL
              </Button>
            </label>
          </div>
          <div className="flex border border-border rounded-none overflow-hidden">
            <label className="contents">
              <input
                type="radio"
                className="hidden"
                value={OrderType.Market}
                {...register("orderType")}
              />
              <Button
                type="button"
                variant="ghost"
                className={`h-8 w-20 rounded-none text-[10px] font-sans font-bold tracking-widest ${
                  orderType === OrderType.Market
                    ? "bg-white text-black hover:bg-white hover:text-black"
                    : "text-muted-foreground hover:text-white hover:bg-transparent"
                }`}
                onClick={() => setValue("orderType", OrderType.Market)}
                disabled={isFrozen}
              >
                MARKET
              </Button>
            </label>
            <label className="contents">
              <input
                type="radio"
                className="hidden"
                value={OrderType.Limit}
                {...register("orderType")}
              />
              <Button
                type="button"
                variant="ghost"
                className={`h-8 w-20 rounded-none text-[10px] font-sans font-bold tracking-widest ${
                  orderType === OrderType.Limit
                    ? "bg-white text-black hover:bg-white hover:text-black"
                    : "text-muted-foreground hover:text-white hover:bg-transparent"
                }`}
                onClick={() => setValue("orderType", OrderType.Limit)}
                disabled={isFrozen}
              >
                LIMIT
              </Button>
            </label>
          </div>
        </div>

        {/* YES / NO Toggles */}
        <div className="flex gap-4">
          <label className="flex-1 contents">
            <input type="radio" className="hidden" value={Outcome.Yes} {...register("outcome")} />
            <button
              type="button"
              className={`flex-1 border p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                outcome === Outcome.Yes
                  ? "border-emerald-500 bg-emerald-500/20"
                  : "border-border hover:border-emerald-500/50"
              }`}
              onClick={() => !isFrozen && setValue("outcome", Outcome.Yes)}
            >
              <div
                className={`text-[11px] font-sans font-bold uppercase tracking-widest ${outcome === Outcome.Yes ? "text-emerald-500" : "text-emerald-500/70"}`}
              >
                {side === Side.Bid ? "BUY" : "SELL"} YES
              </div>
              <div className="text-xl font-heading font-bold text-white mt-1">
                {formatCents(yesPrice)}¢
              </div>
            </button>
          </label>

          <label className="flex-1 contents">
            <input type="radio" className="hidden" value={Outcome.No} {...register("outcome")} />
            <button
              type="button"
              className={`flex-1 border p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                outcome === Outcome.No
                  ? "border-destructive bg-destructive/20"
                  : "border-border hover:border-destructive/50"
              }`}
              onClick={() => !isFrozen && setValue("outcome", Outcome.No)}
            >
              <div
                className={`text-[11px] font-sans font-bold uppercase tracking-widest ${outcome === Outcome.No ? "text-destructive" : "text-destructive/70"}`}
              >
                {side === Side.Bid ? "BUY" : "SELL"} NO
              </div>
              <div className="text-xl font-heading font-bold text-white mt-1">
                {formatCents(noPrice)}¢
              </div>
            </button>
          </label>
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
                placeholder="0"
                className="w-full h-12 bg-transparent border border-border text-base font-sans rounded-none px-4 focus-visible:border-white text-white shadow-none"
                {...register("limitPrice", { valueAsNumber: true })}
              />
              <span className="absolute right-4 text-muted-foreground font-sans font-bold">%</span>
            </div>
          </div>
        )}

        {/* Shares Input */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">
              SHARES TO {side === Side.Bid ? "BUY" : "SELL"}
            </span>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">
              COST: ${formatNumber(totalCost)}
            </span>
          </div>
          <div className="relative flex items-center">
            <Input
              type="number"
              disabled={isFrozen}
              placeholder="0"
              className="w-full h-12 bg-transparent border border-border text-base font-sans rounded-none px-4 focus-visible:border-white text-white shadow-none"
              {...register("shares", { valueAsNumber: true })}
            />
          </div>
          {errors.shares && (
            <span className="text-[10px] text-destructive uppercase tracking-widest font-bold">
              {errors.shares.message}
            </span>
          )}
        </div>

        {/* Stats List */}
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-sans text-muted-foreground">
              {side === Side.Bid ? "Potential Return" : "Total Proceeds"}
            </span>
            <span
              className={`text-xs font-sans font-bold ${side === Side.Bid ? "text-emerald-500" : "text-white"}`}
            >
              {side === Side.Bid && potentialReturn > 0 ? "+" : ""}
              {side === Side.Bid && potentialReturn > 0 ? "$" : ""}
              {side === Side.Bid ? formatUsd(potentialReturn) : formatUsd(totalCost)}
            </span>
          </div>
          {side === Side.Bid && (
            <div className="flex justify-between items-center">
              <span className="text-xs font-sans text-muted-foreground">Total Payout</span>
              <span className="text-xs font-sans font-bold text-white">
                ${formatUsd(maxPayout)}
              </span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        {!isAgentActive ? (
          <Button
            type="button"
            onClick={enableTrading}
            disabled={isRegistering}
            variant="secondary"
            className="w-full h-12 border border-border rounded-none mt-2 tracking-[0.2em] font-sans font-bold text-[11px] uppercase transition-all shadow-none"
          >
            {isRegistering ? <Loader2 className="size-4 animate-spin" /> : "ENABLE TRADING"}
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isFrozen || placeOrder.isPending || (shares || 0) <= 0}
            className={`w-full h-12 text-white border-0 rounded-none mt-2 tracking-[0.2em] font-sans font-bold text-[11px] uppercase transition-all shadow-none ${tradeButtonColor}`}
          >
            {getButtonLabel()}
          </Button>
        )}
      </form>
    </div>
  );
}
