import { Skeleton } from '@/app/app/_components/common/skeleton';

export default function SettingsLoading() {
  return (
    <div className="min-h-full bg-[#FFF8EE] p-6 md:p-12 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-10 w-52 max-w-full" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#ddc0bd] pb-2 gap-4">
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-36 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Profile Form Card */}
      <div className="p-8 bg-white/60 border border-[#ddc0bd] rounded-2xl space-y-6 shadow-sm">
        <div className="flex items-center gap-4 pb-6 border-b border-[#ddc0bd]/40">
          <Skeleton className="w-16 h-16 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Skeleton className="h-11 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
