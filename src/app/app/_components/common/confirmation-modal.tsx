'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconMapper } from '@/app/_components/icons/IconMapper';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  icon?: string;
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  icon,
  isLoading = false,
}: ConfirmationModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // Prevent background body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const resolvedIcon =
    icon || (variant === 'danger' ? 'delete' : variant === 'warning' ? 'warning' : 'help_outline');

  const iconBgClass =
    variant === 'danger'
      ? 'bg-[#ffdad6] text-[#ba1a1a]'
      : variant === 'warning'
        ? 'bg-[#fff8c4] text-[#745a1c]'
        : 'bg-[#fff0ed] text-[#5b060c]';

  const confirmBtnClass =
    variant === 'danger'
      ? 'bg-[#ba1a1a] hover:bg-[#93000a] text-white shadow-xs'
      : variant === 'warning'
        ? 'bg-[#d8be75] hover:bg-[#c9af66] text-[#2b1611] shadow-xs'
        : 'bg-[#5b060c] hover:bg-[#7a1f1f] text-white shadow-xs';

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmation-modal-title"
        >
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#2b1611]/50 backdrop-blur-xs"
            onClick={() => !isLoading && onClose()}
            aria-hidden="true"
          />

          {/* Modal Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', duration: 0.25, bounce: 0 }}
            className="relative w-full max-w-md bg-[#FFF8EE] border border-[#ddc0bd] rounded-2xl p-6 sm:p-7 shadow-2xl z-10 overflow-hidden font-['Hanken_Grotesk'] text-[#2b1611]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => !isLoading && onClose()}
              disabled={isLoading}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#8a716f] hover:text-[#5b060c] hover:bg-[#ffe2db]/60 transition cursor-pointer disabled:opacity-40"
              aria-label="Close dialog"
            >
              <IconMapper name="close" className="text-[20px]" />
            </button>

            {/* Icon Header */}
            <div
              className={`w-12 h-12 rounded-full ${iconBgClass} flex items-center justify-center mb-4 shrink-0`}
            >
              <IconMapper name={resolvedIcon} className="text-[24px]" />
            </div>

            {/* Title & Description */}
            <div className="mb-6">
              <h3
                id="confirmation-modal-title"
                className="font-['Playfair_Display'] text-[20px] sm:text-[22px] font-bold text-[#5b060c] leading-tight mb-2"
              >
                {title}
              </h3>
              <div className="text-[14px] text-[#564240] leading-[22px]">{description}</div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#ddc0bd] text-[#564240] hover:text-[#2b1611] hover:bg-[#ffe2db]/50 text-[14px] font-semibold transition cursor-pointer text-center disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onConfirm();
                }}
                disabled={isLoading}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-full ${confirmBtnClass} text-[14px] font-semibold transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                <span>{confirmText}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
