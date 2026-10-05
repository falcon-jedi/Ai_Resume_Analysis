import { Skeleton } from '@/app/app/_components/common/skeleton';

export default function DashboardLoading() {
  return (
    <div className="h-full overflow-y-auto relative flex flex-col justify-between bg-[#FFF8EE]">
      <div>
        {/* Main Content */}
        <div className="p-8 md:p-16 relative z-10 max-w-7xl mx-auto w-full space-y-12">
          {/* Header */}
          <div className="space-y-3">
            <Skeleton className="h-12 w-80 max-w-full" />
            <Skeleton className="h-5 w-96 max-w-full" />
          </div>

          {/* Stats / Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>

          {/* Controls bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center pt-4">
            <Skeleton className="h-11 w-full md:w-80 rounded-lg" />
            <div className="flex gap-3">
              <Skeleton className="h-11 w-32 rounded-lg" />
              <Skeleton className="h-11 w-40 rounded-lg" />
            </div>
          </div>

          {/* Resume Grid Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="p-6 bg-white/60 border border-[#ddc0bd] rounded-xl space-y-4 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <Skeleton className="h-4 w-1/2" />
                <div className="pt-4 border-t border-[#ddc0bd]/40 flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
