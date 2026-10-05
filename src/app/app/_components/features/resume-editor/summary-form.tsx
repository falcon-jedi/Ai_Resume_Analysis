'use client';

import { UseFormReturn } from 'react-hook-form';
import type { UpdateResumeDTO } from '@/app/api/model/request/resume/resume';
import { FormTextarea } from './form-field';
import { AIImproveButton } from './ai-improve-button';

interface SummaryFormProps {
  form: UseFormReturn<UpdateResumeDTO>;
}

export function SummaryForm({ form }: SummaryFormProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-[20px] font-bold text-[#7a1f1f] font-['Playfair_Display'] mb-2">
          Professional Summary
        </h3>
        <p className="text-[13px] text-[#564240]">
          Write a short, engaging summary about your skills, experience, and what drives you.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <FormTextarea
          id="personalInfo-summary-standalone"
          label="Summary"
          rows={8}
          registration={register('personalInfo.summary')}
          error={errors.personalInfo?.summary}
          placeholder="e.g. Forward-thinking Senior Product Designer with 6+ years of experience..."
        />
        <AIImproveButton
          sectionType="summary"
          currentText={watch('personalInfo.summary') ?? ''}
          onAccept={(newText) => setValue('personalInfo.summary', newText, { shouldDirty: true })}
        />
      </div>
    </div>
  );
}
