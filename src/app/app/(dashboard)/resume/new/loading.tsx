import { Skeleton } from '@/app/app/_components/common/skeleton';

export default function NewResumeLoading() {
  return (
    <div className="min-h-full bg-[#FFF8EE] p-6 md:p-12 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-10 w-64 max-w-full" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      {/* Form Details Box */}
      <div className="p-6 bg-white/60 border border-[#ddc0bd] rounded-2xl space-y-4 shadow-sm">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>

      {/* Template Grid Section */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 bg-white/60 border border-[#ddc0bd] rounded-2xl space-y-4 shadow-sm"
            >
              <Skeleton className="h-56 w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
