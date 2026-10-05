'use client';

import { useFieldArray, UseFormReturn } from 'react-hook-form';
import type { UpdateResumeDTO } from '@/app/api/model/request/resume/resume';
import { FormArraySection } from './form-array-section';
import { FormInput, FormTextarea } from './form-field';

interface ProjectsFormProps {
  form: UseFormReturn<UpdateResumeDTO>;
}

export function ProjectsForm({ form }: ProjectsFormProps) {
  const {
    control,
    register,
    formState: { errors },
    setValue,
    watch,
  } = form;
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'projects',
  });

  const handleAdd = () => {
    append({
      title: '',
      field: '',
      startDate: '',
      endDate: '',
      description: '',
      technologies: [],
      link: '',
      order: fields.length,
    });
  };

  return (
    <FormArraySection
      title="Projects"
      addLabel="Add Project"
      emptyIcon="code"
      emptyTitle="+ Add Project"
      emptyDescription="Showcase personal, professional, or open-source projects."
      fields={fields}
      onAdd={handleAdd}
      onRemove={remove}
      onMove={move}
      getItemTitle={(_, index) => watch(`projects.${index}.title`) || 'Project Title'}
      getItemSubtitle={(_, index) => watch(`projects.${index}.field`) || 'SaaS / Web App'}
      renderItemFields={(_, index) => {
        const errorObj = errors.projects?.[index];
        const watchedTechs = watch(`projects.${index}.technologies`) || [];

        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Project Title"
                registration={register(`projects.${index}.title`)}
                error={errorObj?.title}
                placeholder="e.g. Elevate AI Platform"
              />
              <FormInput
                label="Project Category / Field"
                registration={register(`projects.${index}.field`)}
                placeholder="e.g. SaaS / Web App"
              />
              <FormInput
                label="Project Link / GitHub URL"
                registration={register(`projects.${index}.link`)}
                error={errorObj?.link}
                placeholder="https://github.com/..."
                colSpan="col-span-2"
              />
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#564240] uppercase tracking-wider font-['Hanken_Grotesk']">
                  Technologies (comma separated)
                </label>
                <input
                  type="text"
                  value={watchedTechs.join(', ')}
                  onChange={(e) => {
                    const val = e.target.value;
                    const array = val
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean);
                    setValue(`projects.${index}.technologies`, array, {
                      shouldDirty: true,
                    });
                  }}
                  className="w-full bg-white border border-[#ddc0bd] rounded-lg px-4 py-2.5 text-[#2b1611] text-[15px] focus:outline-none focus:border-[#7a1f1f] focus:ring-4 focus:ring-[#7a1f1f]/5 transition-all font-['Hanken_Grotesk']"
                  placeholder="React, TypeScript, Next.js"
                />
              </div>
              <FormInput
                label="Start Date"
                registration={register(`projects.${index}.startDate`)}
                placeholder="e.g. Jan 2024"
                colSpan="col-span-1"
              />
              <FormInput
                label="End Date"
                registration={register(`projects.${index}.endDate`)}
                placeholder="e.g. Mar 2024"
                colSpan="col-span-1"
              />
            </div>

            <FormTextarea
              label="Description"
              registration={register(`projects.${index}.description`)}
              placeholder="Developed an AI-powered resume builder from scratch..."
            />
          </>
        );
      }}
    />
  );
}
