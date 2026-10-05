'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconMapper } from '@/app/_components/icons/IconMapper';

interface LeaveEditorDialogProps {
  isOpen: boolean;
  isSaving?: boolean;
  onSaveAndLeave: () => void;
  onDiscardAndLeave: () => void;
  onClose: () => void;
}

export function LeaveEditorDialog({
  isOpen,
  isSaving = false,
  onSaveAndLeave,
  onDiscardAndLeave,
  onClose,
}: LeaveEditorDialogProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b1611]/60 backdrop-blur-xs p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-md bg-[#FFF8EE] border border-[#E5D9C8] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 font-['Hanken_Grotesk'] text-[#2b1611]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#fff0ed] text-[#564240] hover:text-[#370003] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <IconMapper name="close" className="text-[18px]" />
          </button>

          {/* Icon & Title */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#fff0ee] border border-[#E5D9C8] flex items-center justify-center text-[#ba1a1a] shrink-0 shadow-xs">
              <IconMapper name="warning" className="text-2xl" />
            </div>
            <div className="space-y-1 pt-0.5">
              <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#370003] leading-snug">
                Unsaved Changes
              </h3>
              <p className="text-sm text-[#564240] leading-relaxed">
                You have unsaved edits in your resume. Do you want to save your progress before
                leaving the editor?
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row-reverse items-stretch sm:items-center gap-2.5 pt-2">
            {/* Save & Leave */}
            <button
              type="button"
              disabled={isSaving}
              onClick={onSaveAndLeave}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#370003] text-white hover:bg-[#5b060c] px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <IconMapper name="check" className="text-sm" />
                  <span>Save and Leave</span>
                </>
              )}
            </button>

            {/* Discard & Leave */}
            <button
              type="button"
              disabled={isSaving}
              onClick={onDiscardAndLeave}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-[#ba1a1a]/30 text-[#ba1a1a] hover:bg-[#ba1a1a]/5 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
            >
              <IconMapper name="delete" className="text-sm" />
              <span>Discard Changes</span>
            </button>
          </div>

          {/* Keep Editing */}
          <div className="text-center pt-1 border-t border-[#E5D9C8]/60">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-[#564240] hover:text-[#370003] hover:underline cursor-pointer"
            >
              Keep editing resume
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
