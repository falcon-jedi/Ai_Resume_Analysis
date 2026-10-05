import { Skeleton } from '@/app/app/_components/common/skeleton';

export default function ResumeEditorLoading() {
  return (
    <div className="h-full flex flex-col bg-[#FFF8EE] overflow-hidden">
      {/* Editor Top Navigation Bar */}
      <div className="h-14 sm:h-16 border-b border-[#ddc0bd] px-3 sm:px-6 bg-[#F8F2E8] flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-full shrink-0" />
          <Skeleton className="h-7 w-28 sm:w-48 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full md:hidden" />
          <Skeleton className="h-8 sm:h-9 w-16 sm:w-24 rounded-lg" />
          <Skeleton className="h-8 sm:h-9 w-24 sm:w-36 rounded-lg" />
        </div>
      </div>

      {/* Main 2-Column Split Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side — Section Form Editor */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 overflow-y-auto border-r border-[#ddc0bd] space-y-4 sm:space-y-6">
          {/* Section Selector Pills */}
          <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 sm:h-9 w-20 sm:w-24 rounded-lg shrink-0" />
            ))}
          </div>

          {/* Form Fields Skeletons */}
          <div className="p-4 sm:p-6 bg-white/60 border border-[#ddc0bd] rounded-2xl space-y-4 shadow-sm">
            <Skeleton className="h-6 w-36 sm:w-40" />
            <div className="space-y-3">
              <Skeleton className="h-10 sm:h-11 w-full rounded-lg" />
              <Skeleton className="h-10 sm:h-11 w-full rounded-lg" />
              <Skeleton className="h-24 sm:h-28 w-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* Right Side — Live Document Preview */}
        <div className="hidden lg:flex flex-1 bg-[#2b1611]/5 p-8 items-center justify-center overflow-y-auto">
          <div className="w-[595px] h-[842px] bg-white border border-[#ddc0bd] shadow-xl p-10 space-y-6 rounded-sm">
            <Skeleton className="h-10 w-2/3 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
