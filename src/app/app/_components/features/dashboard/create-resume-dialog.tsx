'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateResume } from '@/app/app/_hooks/use-resumes';
import { useTemplates } from '@/app/app/_hooks/use-templates';
import { Skeleton } from '@/app/app/_components/common/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

export function CreateResumeDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('classic-demo');
  const [title, setTitle] = useState('My Resume');

  const { data: templatesData, isLoading } = useTemplates();
  const templates = templatesData?.templates || [];
  const createMutation = useCreateResume();

  const handleCreate = async () => {
    const resume = await createMutation.mutateAsync({ title, templateId: selectedTemplate });
    router.push(`/app/resume/${resume.id}`);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-surface-container border border-glass-border rounded-2xl p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-on-surface-variant transition-colors"
            aria-label="Close"
          >
            <IconMapper name="close" className="text-[20px]" />
          </button>

          <h2 className="text-[24px] font-bold text-on-surface mb-6 font-[Space_Grotesk]">
            Create New Resume
          </h2>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-[11px] tracking-wider font-semibold text-on-surface-variant uppercase mb-2">
              Resume Title
            </label>
            <input
              id="new-resume-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-container-low border border-glass-border rounded-lg px-4 py-3 text-on-surface text-[15px] focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all"
              placeholder="e.g. Software Engineer Resume"
            />
          </div>

          {/* Template picker */}
          <div className="mb-8">
            <label className="block text-[11px] tracking-wider font-semibold text-on-surface-variant uppercase mb-3">
              Choose Template
            </label>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                {Array.isArray(templates) && templates.length > 0 ? (
                  (templates as { id: string; name: string }[]).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedTemplate === t.id
                          ? 'border-electric-blue bg-electric-blue/10 text-white'
                          : 'border-glass-border bg-surface-container-low text-on-surface-variant hover:border-outline hover:bg-white/5'
                      }`}
                    >
                      <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center mb-3">
                        <IconMapper name="description" className="text-[18px]" />
                      </div>
                      <p className="text-[13px] font-semibold">{t.name}</p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">{t.id}</p>
                    </button>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-on-surface-variant">
                    <IconMapper name="description" className="text-3xl block mb-2" />
                    No templates found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-glass-border text-on-surface-variant hover:bg-white/5 text-[14px] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              id="create-resume-confirm"
              onClick={handleCreate}
              disabled={createMutation.isPending || !title.trim()}
              className="flex-1 py-3 rounded-full bg-gradient-to-r from-deep-indigo to-electric-blue text-white text-[14px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Resume'
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
