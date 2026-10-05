'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumes, useResumePreview } from '@/app/app/_hooks/use-resumes';
import { useSubscriptionStatus } from '@/app/app/_hooks/use-subscription';
import { ResumeCard } from '@/app/app/_components/features/dashboard/resume-card';
import { Skeleton } from '@/app/app/_components/common/skeleton';
import { Pagination } from '@/app/app/_components/ui/pagination';
import Link from 'next/link';

const PAGE_SIZE = 5;

// Quick Preview Modal Component
function QuickPreviewDialog({ resumeId, onClose }: { resumeId: string; onClose: () => void }) {
  const { data: html, isLoading } = useResumePreview(resumeId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b1611]/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl h-[85vh] bg-[#FFF8EE] border border-[#ddc0bd] shadow-2xl flex flex-col p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between pb-4 border-b border-[#ddc0bd]/40 mb-4">
          <h3 className="text-xl font-bold text-[#5b060c] font-['Playfair_Display']">
            Document Archive Preview
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#ffe2db] text-[#564240] hover:text-[#5b060c] transition-colors"
            aria-label="Close"
          >
            <IconMapper name="close" className="text-[20px]" />
          </button>
        </header>
        <div className="flex-1 bg-white border border-[#ddc0bd]/50 rounded-sm overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 bg-[#fff0ed]/40 backdrop-blur-[2px] flex items-center justify-center z-50">
              <div className="w-8 h-8 border-4 border-[#ddc0bd]/30 border-t-[#5b060c] rounded-full animate-spin" />
            </div>
          )}
          {html ? (
            <iframe srcDoc={html} className="w-full h-full border-none" title="Quick Preview" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#564240] bg-[#FFF8EE]">
              <span>No preview available</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPageClient({ userName }: { userName: string }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'title-asc' | 'title-desc'>('updated');
  const [previewResumeId, setPreviewResumeId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useResumes({ limit: 50 });
  const { data: subData, isLoading: isSubLoading } = useSubscriptionStatus();

  const resumes = data?.data ?? [];
  const filtered = resumes.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'title-asc') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'title-desc') {
      return b.title.localeCompare(a.title);
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const validPage = Math.min(page, totalPages);
  const paginatedResumes = sorted.slice((validPage - 1) * PAGE_SIZE, validPage * PAGE_SIZE);

  return (
    <div className="h-full overflow-y-auto relative flex flex-col justify-between">
      {/* Main Content Canvas */}
      <div className="p-4 sm:p-6 lg:p-8 relative z-10 max-w-7xl mx-auto w-full">
        {/* Floating Nib Ornament */}
        <div className="absolute top-8 right-12 opacity-5 pointer-events-none hidden lg:block">
          <IconMapper name="ink_pen" className="text-[120px]" />
        </div>

        {/* Header */}
        <header className="mb-6 sm:mb-8 lg:mb-10">
          <h2 className="font-['Playfair_Display'] text-[24px] sm:text-[32px] md:text-[40px] font-bold text-[#5b060c] leading-tight mb-1.5">
            Welcome back, {userName}
          </h2>
          <p className="font-['Hanken_Grotesk'] text-[14px] sm:text-[16px] text-[#564240]">
            Your professional legacy is currently being refined in the workshop.
          </p>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-4 sm:gap-6">
          {/* Widget 1: Plan & Usage Summary (col-span-12 lg:col-span-8) */}
          <div className="col-span-12 lg:col-span-8 bg-[#FFF8EE] rounded-xl border border-[#E5D9C8] shadow-sm p-4 sm:p-6 flex flex-col justify-start relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 sm:mb-6">
              <div>
                <h3 className="font-['Playfair_Display'] text-[18px] sm:text-[20px] font-bold text-[#5b060c]">
                  Workshop Plan & Usage
                </h3>
                <p className="font-['Hanken_Grotesk'] text-[12px] text-[#564240]">
                  Current account limits and consumption
                </p>
              </div>
              {isSubLoading ? (
                <Skeleton className="h-6 w-24 rounded-none" />
              ) : (
                <div
                  className={`font-['Hanken_Grotesk'] text-[11px] font-bold uppercase tracking-wider px-3 py-1 border ${
                    (subData?.subscription?.plan ?? 'FREE') === 'FREE'
                      ? 'bg-[#fff8c4] border-[#d8be75] text-[#745a1c]'
                      : 'bg-[#fff0ed] border-[#ddc0bd]/40 text-[#5b060c]'
                  }`}
                >
                  {subData?.subscription?.planName || 'Free Plan'}
                </div>
              )}
            </div>

            {isSubLoading ? (
              <div className="space-y-5">
                {[1, 2].map((i) => (
                  <div key={i} className="h-10 bg-[#fff0ed] animate-pulse rounded-none" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* ATS Scans Usage */}
                <div>
                  <div className="flex justify-between text-[13px] font-['Hanken_Grotesk'] font-semibold text-[#564240] mb-1.5">
                    <span>ATS Analyses</span>
                    <span>
                      {subData?.usage?.atsScans?.current ?? 0} /{' '}
                      {subData?.usage?.atsScans?.max === -1
                        ? '∞'
                        : (subData?.usage?.atsScans?.max ?? 1)}
                    </span>
                  </div>
                  <div className="w-full bg-[#f3eae1] h-2 rounded-none overflow-hidden">
                    <div
                      className="bg-[#795900] h-full transition-all duration-500"
                      style={{ width: `${subData?.usage?.atsScans?.percent ?? 0}%` }}
                    />
                  </div>
                </div>

                {/* AI Suggestions Usage */}
                <div>
                  <div className="flex justify-between text-[13px] font-['Hanken_Grotesk'] font-semibold text-[#564240] mb-1.5">
                    <span>AI Suggestions Used</span>
                    <span>
                      {subData?.usage?.aiOptimizations?.current ?? 0} /{' '}
                      {subData?.usage?.aiOptimizations?.max === -1
                        ? '∞'
                        : (subData?.usage?.aiOptimizations?.max ?? 1)}
                    </span>
                  </div>
                  <div className="w-full bg-[#f3eae1] h-2 rounded-none overflow-hidden">
                    <div
                      className="bg-[#1b5e20] h-full transition-all duration-500"
                      style={{ width: `${subData?.usage?.aiOptimizations?.percent ?? 0}%` }}
                    />
                  </div>
                </div>

                {/* Template Access & Renewal Footer */}
                <div className="pt-3 border-t border-[#ddc0bd]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[12px] font-['Hanken_Grotesk'] text-[#564240]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#5b060c]">Template Access:</span>
                    <span className="font-medium text-[#2b1611]">
                      {subData?.subscription?.templateAccess === 'ALL'
                        ? 'All Templates'
                        : 'Free Templates'}
                    </span>
                  </div>
                  {subData?.subscription?.currentPeriodEnd ? (
                    <span className="text-[11px] text-[#795900] font-medium">
                      Renews{' '}
                      {new Date(subData.subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#564240]">Lifetime Access</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Widget 2: Quick Stats (col-span-12 lg:col-span-4) */}
          <div className="col-span-12 lg:col-span-4 rounded-xl bg-[#FFF8EE] border border-[#E5D9C8] shadow-sm p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden">
            <div>
              <h3 className="font-['Playfair_Display'] text-[18px] sm:text-[20px] font-bold text-[#5b060c] mb-1">
                Workshop Stats
              </h3>
              <p className="font-['Hanken_Grotesk'] text-[12px] text-[#564240] mb-3 sm:mb-4">
                Overview of your document folder
              </p>
            </div>

            <div className="space-y-3 sm:space-y-3.5 flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-center border-b border-[#ddc0bd]/30 pb-2">
                <span className="font-['Hanken_Grotesk'] text-[13px] font-semibold text-[#564240]">
                  Total Resumes
                </span>
                <span className="font-['Playfair_Display'] text-[18px] font-bold text-[#5b060c]">
                  {resumes.length}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[#ddc0bd]/30 pb-2">
                <span className="font-['Hanken_Grotesk'] text-[13px] font-semibold text-[#564240]">
                  Completed
                </span>
                <span className="font-['Playfair_Display'] text-[18px] font-bold text-[#1b5e20]">
                  {
                    resumes.filter((r) => r.status === 'COMPLETE' || r.status === 'completed')
                      .length
                  }
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[#ddc0bd]/30 pb-2">
                <span className="font-['Hanken_Grotesk'] text-[13px] font-semibold text-[#564240]">
                  Drafts
                </span>
                <span className="font-['Playfair_Display'] text-[18px] font-bold text-[#795900]">
                  {
                    resumes.filter((r) => r.status !== 'COMPLETE' && r.status !== 'completed')
                      .length
                  }
                </span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="font-['Hanken_Grotesk'] text-[13px] font-semibold text-[#564240]">
                  Last Edited
                </span>
                <span className="font-['Hanken_Grotesk'] text-[12px] font-semibold text-[#5b060c]">
                  {resumes.length > 0
                    ? new Date(resumes[0].updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Never'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Resumes (Folder Tabs) */}
          <div className="col-span-12 bg-[#FFF8EE] rounded-xl border border-[#E5D9C8] shadow-sm p-0 overflow-hidden mt-2 sm:mt-6">
            <div className="p-4 sm:p-6 lg:p-8 border-b border-[#ddc0bd]/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
              <div>
                <h3 className="font-['Playfair_Display'] text-[20px] sm:text-[24px] font-bold text-[#5b060c]">
                  Resume Repository
                </h3>
                <p className="font-['Hanken_Grotesk'] text-[13px] text-[#564240] mt-0.5 sm:mt-1">
                  Manage and craft your professional documents
                </p>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
                {/* Search bar — standardized to Resume Builder design */}
                <div className="relative w-full sm:w-80 shrink-0">
                  <IconMapper
                    name="search"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a716f]"
                  />
                  <input
                    id="dashboard-search"
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search archive..."
                    className="w-full pl-12 pr-4 py-2.5 sm:py-3 border border-[#ddc0bd] rounded-full transition-all outline-none focus:border-[#5b060c] focus:ring-1 focus:ring-[#5b060c]/20 bg-[#fff0ed] text-[#2b1611] font-['Hanken_Grotesk'] text-[14px] leading-[20px] placeholder:text-[#8a716f]/60 shadow-xs"
                  />
                </div>

                {/* Sort Selector */}
                <div className="relative w-full sm:w-auto shrink-0">
                  <select
                    id="dashboard-sort"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as 'updated' | 'title-asc' | 'title-desc');
                      setPage(1);
                    }}
                    className="w-full sm:w-auto bg-[#fff0ed] border border-[#ddc0bd] pl-5 pr-10 py-2.5 sm:py-3 rounded-full font-['Hanken_Grotesk'] text-[14px] leading-[20px] text-[#2b1611] focus:outline-none focus:border-[#5b060c] focus:ring-1 focus:ring-[#5b060c]/20 transition-all appearance-none cursor-pointer shadow-xs"
                  >
                    <option value="updated">Last Updated</option>
                    <option value="title-asc">Title (A-Z)</option>
                    <option value="title-desc">Title (Z-A)</option>
                  </select>
                  <IconMapper
                    name="keyboard_arrow_down"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#8a716f] pointer-events-none"
                  />
                </div>

                {/* Create */}
                <Link
                  id="create-resume-btn"
                  href="/app/resume/new"
                  className="flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 bg-[#5b060c] text-white font-['Hanken_Grotesk'] text-[13px] font-semibold tracking-wider uppercase rounded-full hover:bg-[#7a1f1f] transition-all w-full sm:w-auto shadow-xs shrink-0"
                >
                  <IconMapper name="add" className="text-[18px]" />
                  New Document
                </Link>
              </div>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-20 bg-[#fff0ed] border border-[#ddc0bd]/20 rounded-none"
                  />
                ))}
              </div>
            )}

            {/* Error state */}
            {isError && (
              <div className="text-center py-16 px-4">
                <IconMapper name="error_outline" className="text-4xl text-red-700 block mb-3" />
                <p className="font-['Hanken_Grotesk'] text-[#564240] text-[15px] font-medium">
                  Failed to load document repository. Please refresh.
                </p>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !isError && sorted.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 px-4"
              >
                <IconMapper name="description" className="text-5xl text-[#8a716f]/40 block mb-4" />
                <p className="font-['Hanken_Grotesk'] text-[#564240] text-[15px] mb-6 font-medium">
                  {search
                    ? 'No documents match your filter query.'
                    : 'Your workshop repository is empty.'}
                </p>
                {!search && (
                  <Link
                    href="/app/resume/new"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#5b060c] text-white font-['Hanken_Grotesk'] text-[13px] font-semibold uppercase tracking-wider hover:bg-[#7a1f1f] transition-all"
                  >
                    <IconMapper name="add" className="text-[18px]" />
                    Create First Document
                  </Link>
                )}
              </motion.div>
            )}

            {/* Resume list */}
            {!isLoading && !isError && sorted.length > 0 && (
              <>
                <AnimatePresence>
                  <div className="flex flex-col">
                    {paginatedResumes.map((resume) => (
                      <ResumeCard key={resume.id} resume={resume} onPreview={setPreviewResumeId} />
                    ))}
                  </div>
                </AnimatePresence>

                {/* Reusable Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 sm:p-6 border-t border-[#ddc0bd]/30 flex justify-center">
                    <Pagination
                      currentPage={validPage}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Preview dialog */}
      {previewResumeId && (
        <QuickPreviewDialog resumeId={previewResumeId} onClose={() => setPreviewResumeId(null)} />
      )}
    </div>
  );
}
