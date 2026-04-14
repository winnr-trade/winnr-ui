import { Copy, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Display, Heading } from "@/components/ui/typography";

export default function HallOfFame() {
  return (
    <div className="container mx-auto p-6 flex flex-col gap-12 max-w-[1400px]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-4">
        <div>
          <div className="uppercase tracking-widest text-xs text-primary font-bold font-sans mb-3 drop-shadow-[0_0_8px_rgba(159,251,6,0.3)]">
            SEASONAL GLOBAL RANKINGS
          </div>
          <Display className="text-6xl md:text-8xl">
            HALL OF <span className="text-primary tracking-tighter">FAME</span>
          </Display>
        </div>

        <div className="bg-surface-container-high border-l-4 border-l-primary p-4 rounded-r-lg min-w-[200px] shadow-[0_0_30px_rgba(159,251,6,0.05)]">
          <div className="uppercase tracking-widest text-[10px] text-muted-foreground font-bold font-sans mb-1">
            PRIZE POOL
          </div>
          <div className="text-3xl font-heading font-bold text-primary">
            $1,240,000
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Podium & Ranks */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          {/* Podium */}
          <div className="grid grid-cols-3 gap-4 items-end h-[340px]">
            {/* #2 */}
            <div className="bg-surface-container-low rounded-t-2xl p-6 flex flex-col items-center justify-between h-[260px] relative border-t border-surface-container-high">
              <div className="text-4xl font-heading font-bold text-surface-container-highest absolute top-4 left-6 italic">
                #2
              </div>
              <div className="mt-8 flex flex-col items-center">
                <div className="size-16 rounded-xl bg-blue-100 overflow-hidden border-2 border-surface-container-high shadow-lg">
                  {/* Avatar placeholder */}
                  <div className="size-full bg-slate-300"></div>
                </div>
                <div className="font-heading font-bold text-lg mt-4 text-foreground">
                  OxKinetik
                </div>
                <div className="text-primary font-bold font-sans text-sm mt-1 drop-shadow-[0_0_5px_rgba(159,251,6,0.4)]">
                  14.2K WINNR
                </div>
              </div>
            </div>

            {/* #1 */}
            <div className="bg-surface-container-high rounded-t-2xl flex flex-col items-center justify-between h-[340px] relative border-2 border-primary shadow-[0_[-15px]_40px_-15px_rgba(159,251,6,0.3)] z-10">
              <div className="text-5xl font-heading font-bold text-primary opacity-30 absolute top-4 left-6 italic drop-shadow-[0_0_10px_rgba(159,251,6,0.8)]">
                #1
              </div>
              <div className="mt-16 flex flex-col items-center flex-1 w-full relative">
                <div className="size-24 rounded-2xl bg-green-100 overflow-hidden border-4 border-primary shadow-[0_0_20px_rgba(159,251,6,0.5)]">
                  {/* Avatar placeholder */}
                  <div className="size-full bg-[#1b3819]"></div>
                </div>
                <div className="absolute top-[84px] bg-primary text-primary-foreground font-bold font-sans text-[10px] px-3 py-1 rounded-full border-2 border-surface-container-high uppercase tracking-wider shadow-lg">
                  GOD TIER
                </div>
                <div className="font-heading font-bold text-2xl mt-8 text-foreground drop-shadow-md">
                  NeonProphet
                </div>
                <div className="text-primary font-bold font-sans text-lg mt-1 drop-shadow-[0_0_8px_rgba(159,251,6,0.6)]">
                  28.9K WINNR
                </div>
              </div>
            </div>

            {/* #3 */}
            <div className="bg-surface-container-lowest rounded-t-2xl p-6 flex flex-col items-center justify-between h-[230px] relative border-t border-surface-container-high">
              <div className="text-4xl font-heading font-bold text-surface-container-high absolute top-4 right-6 italic">
                #3
              </div>
              <div className="mt-6 flex flex-col items-center">
                <div className="size-14 rounded-xl bg-purple-100 flex items-center justify-center border-2 border-surface-container shadow-sm overflow-hidden text-center text-primary/50 text-2xl font-bold font-heading">
                  3
                </div>
                <div className="font-heading font-bold text-base mt-4 text-foreground">
                  VortexBet
                </div>
                <div className="text-primary font-bold font-sans text-xs mt-1 drop-shadow-[0_0_5px_rgba(159,251,6,0.3)]">
                  12.1K WINNR
                </div>
              </div>
            </div>
          </div>

          {/* Rank List */}
          <div className="flex flex-col gap-3">
            {[
              {
                rank: "04",
                name: "AlphaStaker",
                bet: "+$4.2K ON BTC/USD",
                score: "9,420",
                status: "FOLLOW",
                avatar: "bg-gray-200",
              },
              {
                rank: "05",
                name: "ShadowWhale",
                bet: "+$8.1K ON SOL/PREDICTION",
                score: "8,812",
                status: "FOLLOWING",
                avatar: "bg-surface-bright",
                active: true,
              },
              {
                rank: "06",
                name: "Z_Entropy",
                bet: "+$2.5K ON ETH/LONG",
                score: "7,905",
                status: "FOLLOW",
                avatar: "bg-teal-700",
              },
            ].map((user) => (
              <Card
                key={user.name}
                className={`p-4 flex items-center justify-between border-0 shadow-none transition-colors ${user.active ? "bg-surface-container-high" : "bg-surface-container-low hover:bg-surface-container"}`}
              >
                <div className="flex items-center gap-6">
                  <div className="text-2xl font-heading font-bold text-surface-container-highest whitespace-nowrap w-10">
                    {user.rank}
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      className={`size-10 rounded-lg ${user.avatar} ${user.active ? "opacity-100" : "opacity-70"}`}
                    ></div>
                    <div>
                      <div className="font-heading font-bold">{user.name}</div>
                      <div className="text-[10px] font-sans font-bold text-primary uppercase tracking-wider mt-1">
                        RECENT BIG WIN: {user.bet}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] uppercase text-muted-foreground font-sans tracking-widest font-bold">
                      WINNR SCORE
                    </div>
                    <div className="font-heading font-bold text-xl">
                      {user.score}
                    </div>
                  </div>
                  <Button
                    variant={user.active ? "secondary" : "default"}
                    className={`w-28 text-xs tracking-wider h-10 ${!user.active ? "shadow-[0_0_10px_rgba(159,251,6,0.3)]" : ""}`}
                  >
                    {user.status}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Live Bets & Discord */}
        <div className="flex gap-6 flex-col">
          <div className="flex items-center gap-3">
            <Heading className="text-xl">
              LIVE <span className="text-primary">BETS</span>
            </Heading>
            <div className="flex items-center gap-1.5 ml-auto">
              <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(159,251,6,0.8)] animate-pulse"></div>
              <span className="text-[10px] uppercase font-sans font-bold text-primary tracking-widest">
                REAL-TIME
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {/* Live Bet 1 */}
            <Card className="bg-surface-container-low border-0 shadow-none p-5 relative overflow-hidden group hover:bg-surface-container transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_10px_rgba(159,251,6,1)]"></div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-orange-100"></div>
                  <div className="text-sm font-sans text-muted-foreground">
                    <span className="font-bold text-primary mr-1">
                      DegenKing
                    </span>
                    placed a bet
                  </div>
                </div>
                <div className="text-[10px] font-sans font-bold text-muted-foreground uppercase opacity-70">
                  2M AGO
                </div>
              </div>
              <div className="font-heading font-bold text-sm mb-3">
                Prediction: BTC to $100k by EOY
              </div>
              <div className="flex justify-between items-center">
                <span className="bg-surface-container-highest px-2 py-1 rounded text-[10px] font-bold font-sans text-muted-foreground uppercase tracking-wider">
                  $5,000 AT STAKE
                </span>
                <span className="text-primary font-bold font-sans text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:underline">
                  COPY BET <Copy className="size-3" />
                </span>
              </div>
            </Card>

            {/* Live Bet 2 (Settled) */}
            <Card className="bg-surface-container-low border-0 shadow-none p-5 relative overflow-hidden group hover:bg-surface-container transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-pink-200"></div>
                  <div className="text-sm font-sans text-muted-foreground">
                    <span className="font-bold text-foreground mr-1">
                      CyberMancer
                    </span>
                    just cashed out
                  </div>
                </div>
                <div className="text-[10px] font-sans font-bold text-muted-foreground uppercase opacity-70">
                  5M AGO
                </div>
              </div>
              <div className="font-heading font-bold text-sm mb-2 text-foreground">
                Market: Tesla Quarterly Earnings
              </div>
              <div className="text-primary font-heading transform scale-[1.05] origin-left font-bold text-lg mb-1 drop-shadow-[0_0_8px_rgba(159,251,6,0.3)]">
                +$12,450.00{" "}
                <span className="text-xs inline-block align-middle ml-1">
                  📈
                </span>
              </div>
            </Card>

            {/* Live Bet 3 */}
            <Card className="bg-surface-container-low border-0 shadow-none p-5 relative overflow-hidden group hover:bg-surface-container transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_10px_rgba(159,251,6,1)]"></div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-indigo-900 border border-surface-container-high"></div>
                  <div className="text-sm font-sans text-muted-foreground">
                    <span className="font-bold text-primary mr-1">
                      MoonShot
                    </span>
                    placed a bet
                  </div>
                </div>
                <div className="text-[10px] font-sans font-bold text-muted-foreground uppercase opacity-70">
                  12M AGO
                </div>
              </div>
              <div className="font-heading font-bold text-sm mb-3">
                Prediction: ETH Flip by 2025
              </div>
              <div className="flex justify-between items-center">
                <span className="bg-surface-container-highest px-2 py-1 rounded text-[10px] font-bold font-sans text-muted-foreground uppercase tracking-wider">
                  $1,200 AT STAKE
                </span>
                <span className="text-primary font-bold font-sans text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:underline">
                  COPY BET <Copy className="size-3" />
                </span>
              </div>
            </Card>
          </div>

          <Card className="bg-surface-container-high border-0 shadow-none p-6 mt-auto">
            <h3 className="font-heading font-bold text-lg mb-2">
              Join the Collective
            </h3>
            <p className="text-muted-foreground font-body text-sm mb-6">
              Connect with 45k+ predictors in the winnr discord.
            </p>
            <Button className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white flex gap-2 h-12 shadow-[0_4px_14px_rgba(88,101,242,0.4)] transition-all hover:shadow-[0_6px_20px_rgba(88,101,242,0.6)]">
              <MessageSquare className="size-5 fill-current" />
              JOIN DISCORD
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
