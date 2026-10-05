'use client';

import { useFieldArray, UseFormReturn } from 'react-hook-form';
import type { UpdateResumeDTO } from '@/app/api/model/request/resume/resume';
import { FormArraySection } from './form-array-section';
import { FormInput, FormTextarea } from './form-field';
import { AIImproveButton } from './ai-improve-button';

interface ExperienceFormProps {
  form: UseFormReturn<UpdateResumeDTO>;
}

export function ExperienceForm({ form }: ExperienceFormProps) {
  const {
    control,
    register,
    formState: { errors },
    watch,
  } = form;
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'experiences',
  });

  const handleAdd = () => {
    append({
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      description: '',
      highlights: [],
      order: fields.length,
    });
  };

  return (
    <FormArraySection
      title="Work Experience"
      addLabel="Add Role"
      emptyIcon="add"
      emptyTitle="+ Add Experience"
      emptyDescription="Start building your work history."
      fields={fields}
      onAdd={handleAdd}
      onRemove={remove}
      onMove={move}
      getItemTitle={(_, index) => watch(`experiences.${index}.position`) || 'Untitled Position'}
      getItemSubtitle={(_, index) => {
        const company = watch(`experiences.${index}.company`) || 'Company Name';
        const startDate = watch(`experiences.${index}.startDate`) || 'Start Date';
        const currentlyWorking = watch(`experiences.${index}.currentlyWorking`);
        const endDate = currentlyWorking
          ? 'Present'
          : watch(`experiences.${index}.endDate`) || 'End Date';
        return `${company} · ${startDate} - ${endDate}`;
      }}
      renderItemFields={(_, index) => {
        const errorObj = errors.experiences?.[index];
        const currentlyWorking = watch(`experiences.${index}.currentlyWorking`);

        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Job Title / Position"
                registration={register(`experiences.${index}.position`)}
                error={errorObj?.position}
                placeholder="e.g. Senior Product Designer"
              />
              <FormInput
                label="Company Name"
                registration={register(`experiences.${index}.company`)}
                error={errorObj?.company}
                placeholder="e.g. TechNova Solutions"
              />
              <FormInput
                label="Location"
                registration={register(`experiences.${index}.location`)}
                placeholder="e.g. San Francisco, CA"
              />

              {/* Currently working checkbox */}
              <div className="col-span-2 flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id={`exp-curr-${index}`}
                  {...register(`experiences.${index}.currentlyWorking`)}
                  className="rounded border-[#ddc0bd] bg-white text-[#7a1f1f] focus:ring-[#7a1f1f]/20 w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor={`exp-curr-${index}`}
                  className="text-[13px] text-[#2b1611] font-medium font-['Hanken_Grotesk'] cursor-pointer"
                >
                  I currently work here
                </label>
              </div>

              <FormInput
                label="Start Date"
                registration={register(`experiences.${index}.startDate`)}
                error={errorObj?.startDate}
                placeholder="e.g. Mar 2021"
                colSpan="col-span-1"
              />

              {!currentlyWorking && (
                <FormInput
                  label="End Date"
                  registration={register(`experiences.${index}.endDate`)}
                  placeholder="e.g. Present"
                  colSpan="col-span-1"
                />
              )}
            </div>

            <FormTextarea
              label="Description"
              registration={register(`experiences.${index}.description`)}
              placeholder="Spearheaded the redesign of the core platform, increasing user retention by 24%..."
            />
            <AIImproveButton
              sectionType="experience"
              currentText={watch(`experiences.${index}.description`) ?? ''}
              onAccept={(newText) =>
                form.setValue(`experiences.${index}.description`, newText, { shouldDirty: true })
              }
            />
          </>
        );
      }}
    />
  );
}
