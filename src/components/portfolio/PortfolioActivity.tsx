"use client";

import { ArrowRight, ArrowRightLeft, Plus, Wallet } from "lucide-react";
import { useUserActivity } from "@/api/portfolio";
import { Button } from "@/components/ui/button";

export function PortfolioActivity() {
  const { data: activityList, isLoading } = useUserActivity(10);

  if (isLoading) {
    return (
      <div className="flex flex-col animate-pulse">
        <div className="h-8 w-48 bg-surface-container mb-6"></div>
        <div className="border border-border bg-surface-container-low h-64"></div>
      </div>
    );
  }

  if (!activityList) return null;

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-heading font-bold text-white">Recent Activity</h2>
        <Button
          variant="link"
          className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-white p-0 h-auto flex items-center gap-2"
        >
          View All <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

      <div className="border border-border bg-surface-container-low flex flex-col">
        {activityList.map((activity, idx) => (
          <div
            key={activity.id}
            className={`flex justify-between items-center p-6 hover:bg-surface-container transition-colors cursor-pointer ${
              idx !== activityList.length - 1 ? "border-b border-border/50" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-border bg-surface-container flex items-center justify-center text-muted-foreground rounded-none">
                {activity.icon === "plus" && <Plus className="w-4 h-4" />}
                {activity.icon === "arrow-right-left" && <ArrowRightLeft className="w-4 h-4" />}
                {activity.icon === "wallet" && <Wallet className="w-4 h-4" />}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-sans font-bold text-white">{activity.action}</span>
                <span className="text-xs font-sans text-muted-foreground">{activity.subtext}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={`text-sm font-sans font-bold ${
                  activity.amountPositive ? "text-emerald-500" : "text-white"
                }`}
              >
                {activity.amount}
              </span>
              <span className="text-[10px] font-sans text-muted-foreground uppercase tracking-widest">
                {activity.date}
              </span>
            </div>
          </div>
        ))}
        {activityList.length === 0 && (
          <div className="p-12 text-center">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground">
              No recent activity
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
