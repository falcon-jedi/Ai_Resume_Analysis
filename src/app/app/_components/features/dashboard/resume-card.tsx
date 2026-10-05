'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDuplicateResume, useDeleteResume, useDownloadPdf } from '@/app/app/_hooks/use-resumes';
import type { ResumeListItem } from '@/app/api/model/response/resume';

interface ResumeCardProps {
  resume: ResumeListItem;
  onPreview: (id: string) => void;
}

function formatDate(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHrs = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffHrs < 1) return 'just now';
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return 'yesterday';
  return `${diffDays}d ago`;
}

import { useState } from 'react';
import { ConfirmationModal } from '@/app/app/_components/common/confirmation-modal';

export function ResumeCard({ resume, onPreview }: ResumeCardProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const duplicate = useDuplicateResume();
  const del = useDeleteResume();
  const pdf = useDownloadPdf();

  const handleEdit = () => router.push(`/app/resume/${resume.id}`);
  const handleDuplicate = () => duplicate.mutate(resume.id);
  const handleDelete = () => setShowDeleteModal(true);
  const handleConfirmDelete = () => {
    del.mutate(resume.id, {
      onSuccess: () => setShowDeleteModal(false),
    });
  };
  const handleDownload = () => pdf.mutate({ id: resume.id, filename: `${resume.title}.pdf` });
  const handlePreview = () => onPreview(resume.id);

  // Tab indicator color based on completion status
  const tabColorClass = resume.status === 'COMPLETE' ? 'bg-[#5b060c]' : 'bg-[#8a716f]';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="group flex flex-col sm:flex-row sm:items-center p-4 sm:p-6 hover:bg-[#fff0ed]/45 transition-colors border-b border-[#ddc0bd]/30 relative cursor-pointer"
      onClick={handleEdit}
    >
      {/* Folder Tab Indicator */}
      <div
        className={`absolute left-0 top-0 h-full w-1 sm:w-1.5 ${tabColorClass} group-hover:w-3 sm:group-hover:w-3.5 transition-all duration-300`}
      ></div>

      <div className="flex-1 flex items-center min-w-0">
        <div className="w-12 h-14 sm:w-14 sm:h-16 bg-white border border-[#ddc0bd]/60 rounded-sm shadow-sm flex items-center justify-center mr-3.5 sm:mr-5 shrink-0">
          <IconMapper name="description" className="text-[#5b060c]/40 text-xl sm:text-2xl" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-['Playfair_Display'] text-[16px] sm:text-[18px] font-semibold text-[#5b060c] truncate group-hover:underline">
            {resume.title}
          </h4>
          <p className="font-['Hanken_Grotesk'] text-[11px] sm:text-[12px] leading-[15px] sm:leading-[16px] text-[#564240]/80 mt-1">
            Template: {resume.templateId} • Edited {formatDate(resume.updatedAt)} • Status:{' '}
            <span
              className={
                resume.status === 'COMPLETE' ? 'text-[#1b5e20] font-semibold' : 'text-[#795900]'
              }
            >
              {resume.status}
            </span>
          </p>
        </div>
      </div>

      {/* Flat Action Buttons: visible on mobile, reveal on hover for sm+ */}
      <div
        className="flex items-center justify-end gap-1 sm:gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity px-0 sm:px-6 pt-3 sm:pt-0 mt-3 sm:mt-0 border-t border-[#ddc0bd]/20 sm:border-0 relative z-30"
        onClick={(e) => e.stopPropagation()} // prevent card navigation when calling actions
      >
        <button
          onClick={handleEdit}
          className="p-1.5 sm:p-2 hover:bg-[#ffe2db] text-[#564240] hover:text-[#5b060c] rounded transition-colors"
          title="Edit Resume"
        >
          <IconMapper name="edit" className="text-[18px] sm:text-[20px]" />
        </button>
        <button
          onClick={handlePreview}
          className="p-1.5 sm:p-2 hover:bg-[#ffe2db] text-[#564240] hover:text-[#5b060c] rounded transition-colors"
          title="Quick Preview"
        >
          <IconMapper name="visibility" className="text-[18px] sm:text-[20px]" />
        </button>
        <button
          onClick={handleDuplicate}
          className="p-1.5 sm:p-2 hover:bg-[#ffe2db] text-[#564240] hover:text-[#5b060c] rounded transition-colors"
          title="Duplicate"
        >
          <IconMapper name="content_copy" className="text-[18px] sm:text-[20px]" />
        </button>
        <button
          onClick={handleDownload}
          className="p-1.5 sm:p-2 hover:bg-[#ffe2db] text-[#564240] hover:text-[#5b060c] rounded transition-colors"
          title="Download PDF"
        >
          <IconMapper name="download" className="text-[18px] sm:text-[20px]" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 sm:p-2 hover:bg-red-50 text-[#564240] hover:text-red-600 rounded transition-colors"
          title="Delete"
        >
          <IconMapper name="delete" className="text-[18px] sm:text-[20px]" />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete "${resume.title}"?`}
        description="This action cannot be undone. This will permanently delete the resume and all its contents."
        confirmText="Delete Resume"
        isLoading={del.isPending}
      />
    </motion.div>
  );
}
