import { Skeleton } from "@/components/ui/skeleton";

export function MarketDetailSkeleton() {
  return (
    <div className="container mx-auto p-6 flex flex-col gap-8 max-w-[1400px]">
      {/* Loading Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div className="max-w-3xl w-full">
          <Skeleton className="w-32 h-6 mb-4 bg-surface-container" />
          <Skeleton className="w-full h-16 bg-surface-container mb-2" />
          <Skeleton className="w-3/4 h-16 bg-surface-container" />
        </div>
        <div className="text-right w-48">
          <Skeleton className="w-full h-24 bg-surface-container" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-[450px] bg-surface-container" />
        <Skeleton className="h-[600px] bg-surface-container" />
      </div>
    </div>
  );
}
