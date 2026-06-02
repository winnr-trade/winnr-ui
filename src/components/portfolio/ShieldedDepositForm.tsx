"use client";

import { ArrowDownToLine, ArrowUpFromLine, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useDepositShieldedWallet,
  useGetShieldedNote,
  useWithdrawShieldedWallet,
} from "@/api/notes";
import { useGetBalance } from "@/api/wallet/getBalance";
import { Button } from "@/components/ui/button";
import { useMainWallet } from "@/hooks/useMainWallet";
import { useShieldedWallet } from "@/hooks/useShieldedWallet";
import { formatCurrency, parseUsd } from "@/utils";

type Tab = "deposit" | "withdraw";

interface ShieldedDepositFormProps {
  onClose: () => void;
}

export function ShieldedDepositForm({ onClose }: ShieldedDepositFormProps) {
  const { address } = useMainWallet();
  const { wallet: shieldedWallet } = useShieldedWallet();
  const { data: balanceData } = useGetBalance({ address });
  const { data: shieldedNote } = useGetShieldedNote({
    mainAddress: address ?? undefined,
    shieldedWallet,
  });

  const [activeTab, setActiveTab] = useState<Tab>("deposit");
  const [amount, setAmount] = useState("");

  const depositMutation = useDepositShieldedWallet();
  const withdrawMutation = useWithdrawShieldedWallet();

  const shieldedBalance = useMemo(() => {
    if (!shieldedWallet || !shieldedNote) return 0n;
    return shieldedNote.amount;
  }, [shieldedWallet, shieldedNote]);

  const parsedAmount = useMemo(() => {
    try {
      return parseUsd(amount || "0");
    } catch {
      return 0n;
    }
  }, [amount]);

  // Deposit validations
  const depositExceedsBalance = useMemo(() => {
    if (balanceData === undefined) return false;
    return parsedAmount > balanceData;
  }, [parsedAmount, balanceData]);

  const isDepositDisabled =
    !amount ||
    parsedAmount <= 0n ||
    depositExceedsBalance ||
    depositMutation.isPending ||
    !shieldedWallet;

  // Withdraw validations
  const withdrawExceedsBalance = useMemo(() => {
    return parsedAmount > shieldedBalance;
  }, [parsedAmount, shieldedBalance]);

  const isWithdrawDisabled =
    !amount ||
    parsedAmount <= 0n ||
    withdrawExceedsBalance ||
    withdrawMutation.isPending ||
    !shieldedWallet ||
    !address;

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setAmount("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shieldedWallet || !address || !amount) return;

    if (activeTab === "deposit") {
      try {
        await depositMutation.mutateAsync({ amount: parsedAmount, wallet: shieldedWallet });
        toast.success("Funds deposited to shielded pool!");
        onClose();
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : "Deposit failed");
      }
    } else {
      try {
        await withdrawMutation.mutateAsync({
          amount: parsedAmount,
          wallet: shieldedWallet,
          recipient: address,
        });
        toast.success("Funds withdrawn to your main wallet!");
        onClose();
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : "Withdrawal failed");
      }
    }
  };

  const isPending =
    activeTab === "deposit" ? depositMutation.isPending : withdrawMutation.isPending;

  const isDisabled = activeTab === "deposit" ? isDepositDisabled : isWithdrawDisabled;

  const availableLabel =
    activeTab === "deposit"
      ? `Available: ${formatCurrency(balanceData || 0n)} USDC`
      : `Shielded: ${formatCurrency(shieldedBalance)} USDC`;

  const exceedsBalance = activeTab === "deposit" ? depositExceedsBalance : withdrawExceedsBalance;

  return (
    <div className="relative bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/5 p-12 rounded-none shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Top edge neon highlight */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-8 relative">
          <div className="size-20 bg-white/[0.02] border border-white/10 flex items-center justify-center relative overflow-hidden group">
            <Shield className="size-10 text-violet-400" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-violet-500/5 to-transparent translate-x-full group-hover:-translate-x-full transition-transform duration-1000" />
          </div>
        </div>

        <h2 className="text-2xl font-heading font-black text-white mb-2 tracking-tighter uppercase leading-tight">
          Shielded Pool
        </h2>
        <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-[0.2em] font-bold opacity-60 mb-8">
          Manage your private shielded balance
        </p>

        {/* Tabs */}
        <div className="w-full flex border border-border mb-8">
          <button
            type="button"
            id="shielded-tab-deposit"
            onClick={() => handleTabChange("deposit")}
            className={`flex-1 h-10 text-[10px] font-sans font-bold uppercase tracking-[0.15em] transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "deposit"
                ? "bg-violet-600 text-white border-r border-violet-500"
                : "bg-transparent text-muted-foreground hover:text-white hover:bg-white/[0.03] border-r border-border"
            }`}
          >
            <ArrowDownToLine className="size-3" />
            Deposit
          </button>
          <button
            type="button"
            id="shielded-tab-withdraw"
            onClick={() => handleTabChange("withdraw")}
            className={`flex-1 h-10 text-[10px] font-sans font-bold uppercase tracking-[0.15em] transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "withdraw"
                ? "bg-violet-600 text-white"
                : "bg-transparent text-muted-foreground hover:text-white hover:bg-white/[0.03]"
            }`}
          >
            <ArrowUpFromLine className="size-3" />
            Withdraw
          </button>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="shieldedAmount"
              className="text-[9px] font-sans font-bold uppercase tracking-widest text-muted-foreground opacity-70"
            >
              Amount (USDC)
            </label>
            <input
              id="shieldedAmount"
              type="text"
              pattern="[0-9]*\.?[0-9]*"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
                  setAmount(val);
                }
              }}
              className="w-full h-12 bg-transparent border border-border text-base font-sans rounded-none px-4 focus-visible:border-violet-500 text-white shadow-none focus:outline-none"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-[9px] font-mono text-white/30 uppercase">{availableLabel}</span>
              {exceedsBalance && (
                <span className="text-[9px] font-sans text-destructive uppercase font-bold">
                  Exceeds available balance
                </span>
              )}
            </div>
          </div>

          {/* Withdraw info note */}
          {activeTab === "withdraw" && (
            <div className="w-full border border-violet-500/20 bg-violet-500/5 px-4 py-3">
              <p className="text-[9px] font-sans text-violet-300/70 uppercase tracking-wider leading-relaxed">
                Funds will be withdrawn to your connected main wallet address.
              </p>
            </div>
          )}

          <div className="w-full flex flex-col gap-4 mt-4">
            <Button
              type="submit"
              disabled={isDisabled}
              className="relative w-full h-14 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:grayscale text-white font-sans font-bold text-[10px] tracking-[0.2em] uppercase rounded-none border-0 overflow-hidden group transition-all duration-300 active:scale-95 shadow-[0_10px_20px_rgba(139,92,246,0.1)]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2.5">
                {isPending ? (
                  <>
                    <div className="size-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    {activeTab === "deposit" ? "DEPOSITING..." : "WITHDRAWING..."}
                  </>
                ) : (
                  <>
                    {activeTab === "deposit" ? (
                      <ArrowDownToLine className="size-3.5" />
                    ) : (
                      <ArrowUpFromLine className="size-3.5" />
                    )}
                    {activeTab === "deposit" ? "DEPOSIT FUNDS" : "WITHDRAW FUNDS"}
                  </>
                )}
              </span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="w-full h-10 font-sans font-bold text-[9px] tracking-[0.2em] uppercase rounded-none text-muted-foreground hover:text-white transition-colors"
            >
              CANCEL
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
