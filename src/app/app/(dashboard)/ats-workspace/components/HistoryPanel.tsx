'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useAtsHistory,
  useDeleteAtsAnalysis,
  useClearAtsHistory,
} from '@/app/app/_hooks/use-ats-history';
import { ConfirmationModal } from '@/app/app/_components/common/confirmation-modal';
import { Pagination } from '@/app/app/_components/ui/pagination';

const PAGE_SIZE = 5;

export function HistoryPanel() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAtsHistory({ page, limit: PAGE_SIZE });
  const deleteMutation = useDeleteAtsAnalysis();
  const clearMutation = useClearAtsHistory();

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const analyses = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteItemId(id);
  };

  const handleConfirmDeleteItem = () => {
    if (deleteItemId) {
      deleteMutation.mutate(deleteItemId, {
        onSuccess: () => {
          setDeleteItemId(null);
          if (analyses.length === 1 && page > 1) {
            setPage((prev) => prev - 1);
          }
        },
      });
    }
  };

  const handleConfirmClearAll = () => {
    clearMutation.mutate(undefined, {
      onSuccess: () => {
        setConfirmClearOpen(false);
        setPage(1);
      },
    });
  };

  return (
    <div className="bg-[#FFF8EE] border border-[#E5D9C8] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#E5D9C8] mb-3 sm:mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <IconMapper name="history" className="text-[#5b060c] text-[20px] sm:text-[22px]" />
          <h3 className="font-['Playfair_Display'] text-[16px] sm:text-[18px] font-bold text-[#5b060c]">
            Analysis History
          </h3>
        </div>
        {analyses.length > 0 && (
          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            disabled={clearMutation.isPending}
            className="font-['Hanken_Grotesk'] text-[10px] font-bold text-[#ba1a1a] uppercase tracking-wider hover:underline disabled:opacity-50 cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Body List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin max-h-[480px]">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-[#f5ece8] animate-pulse" />
            ))}
          </div>
        ) : analyses.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-12 text-center text-[#564240]/60 font-['Hanken_Grotesk'] text-[13px] space-y-2">
            <IconMapper name="analytics" className="text-[32px] text-[#7a1f1f]/50" />
            <p>No previous analyses found.</p>
            <p className="text-[11px] text-[#564240]/40 max-w-[200px]">
              Complete an ATS analysis to build your history log.
            </p>
          </div>
        ) : (
          analyses.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/app/ats-workspace/result/${item.id}`)}
              className="group p-4 bg-white/60 border border-[#ddc0bd]/60 rounded-xl hover:border-[#7a1f1f] hover:bg-white transition-all cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <h4 className="font-['Hanken_Grotesk'] text-[13px] font-bold text-[#2b1611] truncate group-hover:text-[#7a1f1f]">
                  {item.resumeName || 'Untitled Resume'}
                </h4>
                <p className="font-['Hanken_Grotesk'] text-[11px] text-[#564240]/80 truncate">
                  JD: {item.jobTitle || 'General Matching'}
                </p>
                <p className="font-['Hanken_Grotesk'] text-[9px] text-[#564240]/50 uppercase tracking-wider mt-1">
                  {new Date(item.analysisDate).toLocaleDateString()} at{' '}
                  {new Date(item.analysisDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`font-['Hanken_Grotesk'] text-[16px] font-black ${
                    item.overallScore >= 80
                      ? 'text-[#1B5E20]'
                      : item.overallScore >= 60
                        ? 'text-[#795900]'
                        : 'text-[#ba1a1a]'
                  }`}
                >
                  {item.overallScore}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleDelete(item.id, e)}
                  disabled={deleteMutation.isPending}
                  className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#ffe4e4] text-[#ba1a1a] transition-all disabled:opacity-50"
                  title="Delete"
                >
                  <IconMapper name="delete" className="text-[16px]" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reusable Pagination */}
      {totalPages > 1 && (
        <div className="pt-3 border-t border-[#E5D9C8] mt-3 shrink-0">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            maxVisible={3}
            showFirstLast={false}
          />
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={handleConfirmClearAll}
        title="Clear Analysis History?"
        description="Are you sure you want to clear your entire analysis history? This action cannot be undone."
        confirmText="Clear History"
        isLoading={clearMutation.isPending}
      />

      {/* Delete Item Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteItemId !== null}
        onClose={() => setDeleteItemId(null)}
        onConfirm={handleConfirmDeleteItem}
        title="Delete Analysis Record?"
        description="This will permanently delete this analysis record from your history."
        confirmText="Delete Record"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
