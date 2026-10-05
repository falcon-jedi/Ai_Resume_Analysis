import { Skeleton } from '@/app/app/_components/common/skeleton';

export default function AtsWorkspaceLoading() {
  return (
    <div className="min-h-full bg-[#FFF8EE] p-6 md:p-12 space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="space-y-3">
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column — Resume Selector Skeleton */}
        <div className="p-6 bg-white/60 border border-[#ddc0bd] rounded-2xl space-y-6 shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-[#ddc0bd]/40">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>

        {/* Right Column — Job Description Selector Skeleton */}
        <div className="p-6 bg-white/60 border border-[#ddc0bd] rounded-2xl space-y-6 shadow-sm">
          <div className="flex gap-2 p-1 bg-[#fff8ee] border border-[#ddc0bd] rounded-lg">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <Skeleton className="h-9 flex-1 rounded-md" />
          </div>
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex justify-end pt-4">
        <Skeleton className="h-12 w-56 rounded-xl" />
      </div>
    </div>
  );
}
