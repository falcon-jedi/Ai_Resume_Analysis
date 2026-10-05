import { Skeleton } from '@/app/app/_components/common/skeleton';

export default function PublicAtsCheckerLoading() {
  return (
    <div className="min-h-screen bg-[#FFF8EE] p-6 md:p-16 space-y-12 max-w-6xl mx-auto">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Skeleton className="h-12 w-80 mx-auto" />
        <Skeleton className="h-5 w-full mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <div className="p-8 bg-white/70 border border-[#ddc0bd] rounded-2xl space-y-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <div className="p-8 bg-white/70 border border-[#ddc0bd] rounded-2xl space-y-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
