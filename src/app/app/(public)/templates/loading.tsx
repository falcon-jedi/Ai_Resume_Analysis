import { Skeleton } from '@/app/app/_components/common/skeleton';

export default function TemplatesLoading() {
  return (
    <div className="min-h-screen bg-[#FFF8EE] p-6 md:p-16 space-y-12 max-w-6xl mx-auto">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Skeleton className="h-12 w-80 mx-auto" />
        <Skeleton className="h-5 w-full mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-6 bg-white/70 border border-[#ddc0bd] rounded-2xl space-y-4 shadow-sm"
          >
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
