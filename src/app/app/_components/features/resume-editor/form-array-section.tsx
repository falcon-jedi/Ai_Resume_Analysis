'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { reorderFieldArray } from '@/app/app/_util/reorder';

interface FieldItem {
  id: string;
}

interface FormArraySectionProps<T extends FieldItem> {
  title: string;
  addLabel: string;
  emptyIcon: string;
  emptyTitle: string;
  emptyDescription: string;
  fields: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  getItemTitle: (item: T, index: number) => string;
  getItemSubtitle?: (item: T, index: number) => string;
  renderItemFields: (item: T, index: number) => React.ReactNode;
}

export function FormArraySection<T extends FieldItem>({
  title,
  addLabel,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  fields,
  onAdd,
  onRemove,
  onMove,
  getItemTitle,
  getItemSubtitle,
  renderItemFields,
}: FormArraySectionProps<T>) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(fields.length > 0 ? 0 : null);

  useEffect(() => {
    if (fields.length > 0 && expandedIndex === null) {
      setExpandedIndex(0);
    }
  }, [fields.length]);

  const handleAdd = () => {
    onAdd();
    setExpandedIndex(fields.length);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[20px] font-bold text-[#7a1f1f] font-['Playfair_Display']">{title}</h3>
        {fields.length > 0 && (
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1 text-[#7a1f1f] text-[14px] font-bold hover:underline cursor-pointer"
          >
            <IconMapper name="add" className="text-[18px]" /> {addLabel}
          </button>
        )}
      </div>

      {fields.length === 0 ? (
        <button
          type="button"
          onClick={handleAdd}
          className="w-full py-12 border-2 border-dashed border-[#ddc0bd] rounded-xl flex flex-col items-center justify-center text-[#564240] hover:border-[#7a1f1f]/50 hover:bg-[#fff8f6] transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-[#fff0ed] flex items-center justify-center mb-3 group-hover:bg-[#ffe2db] transition-colors">
            <IconMapper name={emptyIcon} className="text-2xl text-[#7a1f1f]" />
          </div>
          <h4 className="font-['Playfair_Display'] text-[18px] leading-[24px] font-bold text-[#7a1f1f] mb-1">
            {emptyTitle}
          </h4>
          <p className="text-[12px] leading-[16px] text-[#564240]/60 font-['Hanken_Grotesk'] font-medium">
            {emptyDescription}
          </p>
        </button>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => {
            const isExpanded = expandedIndex === index;
            const itemTitle = getItemTitle(field, index);
            const itemSubtitle = getItemSubtitle?.(field, index);

            return (
              <div
                key={field.id}
                className="relative bg-white border border-[#ddc0bd] rounded-xl group transition-all duration-300 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer select-none"
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          reorderFieldArray(index, 'up', onMove);
                        }}
                        className="text-[#564240] hover:text-[#7a1f1f] disabled:opacity-30 cursor-pointer"
                      >
                        <IconMapper name="expand_less" className="text-[16px] leading-none" />
                      </button>
                      <button
                        type="button"
                        disabled={index === fields.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          reorderFieldArray(index, 'down', onMove);
                        }}
                        className="text-[#564240] hover:text-[#7a1f1f] disabled:opacity-30 cursor-pointer"
                      >
                        <IconMapper name="expand_more" className="text-[16px] leading-none" />
                      </button>
                    </div>

                    <div>
                      <h4 className="text-[15px] font-semibold text-[#2b1611]">{itemTitle}</h4>
                      {itemSubtitle && (
                        <p className="text-[13px] text-[#564240]/80 mt-0.5 font-['Hanken_Grotesk']">
                          {itemSubtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onRemove(index)}
                      className="w-8 h-8 rounded-full hover:bg-red-500/10 text-[#564240] hover:text-[#7a1f1f] flex items-center justify-center transition-all cursor-pointer"
                    >
                      <IconMapper name="delete" className="text-[18px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedIndex(isExpanded ? null : index)}
                      className="w-8 h-8 rounded-full hover:bg-[#fff0ed] text-[#564240] hover:text-[#7a1f1f] flex items-center justify-center transition-all cursor-pointer"
                    >
                      <IconMapper name={isExpanded ? 'expand_less' : 'expand_more'} />
                    </button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-[#ddc0bd]/60"
                    >
                      <div className="p-6 space-y-4 bg-[#fff8f6]/30">
                        {renderItemFields(field, index)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
