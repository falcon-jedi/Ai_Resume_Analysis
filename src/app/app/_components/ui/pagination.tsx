'use client';

import React from 'react';
import { IconMapper } from '@/app/_components/icons/IconMapper';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisible?: number;
  className?: string;
  variant?: 'dots' | 'simple';
  hideOnSinglePage?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisible = 5,
  className = '',
  variant = 'dots',
  hideOnSinglePage = true,
}: PaginationProps) {
  if (hideOnSinglePage && totalPages <= 1) return null;

  const safeTotalPages = Math.max(1, totalPages);
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= safeTotalPages;

  // Simple variant: Only Prev/Next with page indicator
  if (variant === 'simple') {
    return (
      <nav
        aria-label="Pagination Navigation"
        className={`flex items-center justify-between gap-3 font-['Hanken_Grotesk'] ${className}`}
      >
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirst}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#ddc0bd] text-[#564240] hover:bg-[#ffe2db] hover:text-[#5b060c] text-xs font-semibold transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          aria-label="Previous page"
        >
          <IconMapper name="chevron_left" className="text-[18px]" />
          <span>Previous</span>
        </button>

        <span className="text-xs font-semibold text-[#564240]">
          Page <strong className="text-[#5b060c]">{currentPage}</strong> of{' '}
          <strong className="text-[#5b060c]">{safeTotalPages}</strong>
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLast}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#ddc0bd] text-[#564240] hover:bg-[#ffe2db] hover:text-[#5b060c] text-xs font-semibold transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          aria-label="Next page"
        >
          <span>Next</span>
          <IconMapper name="chevron_right" className="text-[18px]" />
        </button>
      </nav>
    );
  }

  // Dots variant: Generate window of page numbers with ellipses
  const getPageNumbers = (): (number | '...')[] => {
    if (safeTotalPages <= maxVisible + 2) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [];
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(2, currentPage - half);
    let end = Math.min(safeTotalPages - 1, currentPage + half);

    if (currentPage <= half + 2) {
      start = 2;
      end = Math.min(safeTotalPages - 1, maxVisible);
    } else if (currentPage >= safeTotalPages - half - 1) {
      start = Math.max(2, safeTotalPages - maxVisible + 1);
      end = safeTotalPages - 1;
    }

    // Always show page 1
    pages.push(1);

    if (start > 2) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < safeTotalPages - 1) {
      pages.push('...');
    }

    // Always show last page
    pages.push(safeTotalPages);

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`flex items-center justify-center gap-1 sm:gap-1.5 font-['Hanken_Grotesk'] select-none ${className}`}
    >
      {/* First Page */}
      {showFirstLast && (
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={isFirst}
          title="First Page"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[#564240] hover:bg-[#ffe2db] hover:text-[#5b060c] border border-transparent hover:border-[#ddc0bd]/60 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          aria-label="Go to first page"
        >
          <IconMapper name="first_page" className="text-[18px] sm:text-[20px]" />
        </button>
      )}

      {/* Previous Page */}
      {showPrevNext && (
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirst}
          title="Previous Page"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[#564240] hover:bg-[#ffe2db] hover:text-[#5b060c] border border-transparent hover:border-[#ddc0bd]/60 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          aria-label="Go to previous page"
        >
          <IconMapper name="chevron_left" className="text-[18px] sm:text-[20px]" />
        </button>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((item, idx) => {
          if (item === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#564240]/60 font-semibold text-sm"
              >
                …
              </span>
            );
          }

          const isActive = item === currentPage;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[13px] sm:text-[14px] font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#370003] text-white shadow-xs'
                  : 'text-[#564240] hover:bg-[#ffe2db] hover:text-[#5b060c]'
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* Next Page */}
      {showPrevNext && (
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLast}
          title="Next Page"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[#564240] hover:bg-[#ffe2db] hover:text-[#5b060c] border border-transparent hover:border-[#ddc0bd]/60 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          aria-label="Go to next page"
        >
          <IconMapper name="chevron_right" className="text-[18px] sm:text-[20px]" />
        </button>
      )}

      {/* Last Page */}
      {showFirstLast && (
        <button
          type="button"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={isLast}
          title="Last Page"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[#564240] hover:bg-[#ffe2db] hover:text-[#5b060c] border border-transparent hover:border-[#ddc0bd]/60 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          aria-label="Go to last page"
        >
          <IconMapper name="last_page" className="text-[18px] sm:text-[20px]" />
        </button>
      )}
    </nav>
  );
}
