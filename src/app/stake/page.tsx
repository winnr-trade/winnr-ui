import { Eye, Lock, Shield, Zap } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function StakePage() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden flex flex-col items-center justify-center p-6 lg:p-12">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px]" />
        <div className="absolute w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/4" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        {/* Left Content */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-8">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/30 bg-primary/10 w-fit mx-auto lg:mx-0">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-primary">
                Upcoming Upgrade
              </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-heading font-extrabold tracking-tighter text-white uppercase leading-none">
              The Native <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-primary">
                Optimistic Oracle
              </span>
            </h1>
            <p className="text-lg lg:text-xl font-sans text-muted-foreground leading-relaxed max-w-xl">
              Stake to secure the Winnr markets and earn native rewards. The ultimate source of
              truth for prediction markets and the broader Solana ecosystem is arriving soon.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-xl mt-4">
            <div className="flex items-start gap-3 p-4 border border-border bg-surface-container-low/50 backdrop-blur-sm">
              <Zap className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-white">
                  Faster
                </span>
                <span className="text-xs font-sans text-muted-foreground mt-1">
                  Fast resolution for the markets.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border border-border bg-surface-container-low/50 backdrop-blur-sm">
              <Lock className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-white">
                  Cryptoeconomic
                </span>
                <span className="text-xs font-sans text-muted-foreground mt-1">
                  Secured by staked $WINNR.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border border-border bg-surface-container-low/50 backdrop-blur-sm">
              <Shield className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-white">
                  Dispute Window
                </span>
                <span className="text-xs font-sans text-muted-foreground mt-1">
                  Built-in escalation and arbitration.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border border-border bg-surface-container-low/50 backdrop-blur-sm">
              <Eye className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-white">
                  Permissionless
                </span>
                <span className="text-xs font-sans text-muted-foreground mt-1">
                  Anyone can propose or dispute.
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 w-full max-w-xl">
            <Button
              disabled
              className="w-full bg-surface-container border border-border text-white hover:bg-surface-container h-14 font-sans font-bold text-[11px] uppercase tracking-[0.2em] shadow-none opacity-80 cursor-not-allowed"
            >
              Staking Opens Soon
            </Button>
          </div>
        </div>

        {/* Right Graphic */}
        <div className="flex-1 w-full flex justify-center items-center relative">
          <div className="relative w-64 h-64 lg:w-[400px] lg:h-[400px] animate-[pulse_4s_ease-in-out_infinite]">
            <Image
              src="/oracle.png"
              alt="Winnr Oracle"
              fill
              className="object-contain drop-shadow-[0_0_60px_rgba(16,185,129,0.3)]"
              priority
            />
          </div>

          {/* Orbital rings / tech elements */}
          <div className="absolute inset-0 z-[-1] flex items-center justify-center pointer-events-none">
            <div className="w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] border border-emerald-500/20 rounded-full absolute animate-[spin_20s_linear_infinite]" />
            <div className="w-[400px] h-[400px] lg:w-[700px] lg:h-[700px] border border-dashed border-primary/20 rounded-full absolute animate-[spin_30s_linear_infinite_reverse]" />
          </div>
        </div>
      </div>
    </div>
  );
}
