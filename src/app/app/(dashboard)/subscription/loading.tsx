import { Skeleton } from '@/app/app/_components/common/skeleton';

export default function SubscriptionLoading() {
  return (
    <div className="h-full overflow-y-auto bg-[#FFF8EE] p-6 md:p-12 space-y-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <Skeleton className="h-10 w-72 mx-auto" />
        <Skeleton className="h-5 w-96 max-w-full mx-auto" />
      </div>

      {/* Pricing Toggle Placeholder */}
      <div className="flex justify-center">
        <Skeleton className="h-12 w-64 rounded-full" />
      </div>

      {/* 2 Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 pt-4 justify-center">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="p-8 bg-white/60 border border-[#ddc0bd] rounded-2xl space-y-6 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-4 w-full" />
              <div className="pt-4 border-t border-[#ddc0bd]/40 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
