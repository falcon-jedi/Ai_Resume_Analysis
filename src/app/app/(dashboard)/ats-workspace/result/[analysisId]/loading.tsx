import { Skeleton } from '@/app/app/_components/common/skeleton';

export default function AtsResultLoading() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F2E8] p-6 md:p-10 relative">
      <div className="max-w-6xl mb-6 flex justify-between items-center">
        <Skeleton className="h-6 w-36 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      <div className="max-w-6xl bg-[#FFF8EE] border border-[#E5D9C8] p-8 md:p-12 shadow-md rounded-2xl space-y-8">
        {/* Header Board */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-[#5b060c]/20 pb-8 gap-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-72 max-w-full" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="w-32 h-36 rounded-xl shrink-0" />
        </div>

        {/* Tab Controls Skeleton */}
        <div className="flex border-b border-[#E5D9C8] pb-2 gap-3 overflow-x-auto">
          <Skeleton className="h-10 w-36 rounded-lg shrink-0" />
          <Skeleton className="h-10 w-36 rounded-lg shrink-0" />
          <Skeleton className="h-10 w-40 rounded-lg shrink-0" />
          <Skeleton className="h-10 w-32 rounded-lg shrink-0" />
        </div>

        {/* Main Overview Breakdown Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          <div className="lg:col-span-7 space-y-6">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="p-6 bg-white/40 border border-[#E5D9C8] rounded-xl space-y-4">
              <Skeleton className="h-4 w-36" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
