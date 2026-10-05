import { Skeleton } from '@/app/app/_components/common/skeleton';

export default function PublicPricingLoading() {
  return (
    <div className="min-h-screen bg-[#FFF8EE] p-6 md:p-16 space-y-12 max-w-6xl mx-auto">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Skeleton className="h-12 w-80 mx-auto" />
        <Skeleton className="h-5 w-full mx-auto" />
      </div>

      <div className="flex justify-center">
        <Skeleton className="h-12 w-64 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 justify-center">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="p-8 bg-white/70 border border-[#ddc0bd] rounded-2xl space-y-6 shadow-sm"
          >
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-12 w-28" />
            <Skeleton className="h-4 w-full" />
            <div className="space-y-3 pt-4 border-t border-[#ddc0bd]/40">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
