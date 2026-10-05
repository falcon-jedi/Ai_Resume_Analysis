'use client';

import { useFieldArray, UseFormReturn } from 'react-hook-form';
import type { UpdateResumeDTO } from '@/app/api/model/request/resume/resume';
import { FormArraySection } from './form-array-section';
import { FormInput } from './form-field';

interface EducationFormProps {
  form: UseFormReturn<UpdateResumeDTO>;
}

export function EducationForm({ form }: EducationFormProps) {
  const {
    control,
    register,
    formState: { errors },
    watch,
  } = form;
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'education',
  });

  const handleAdd = () => {
    append({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      result: '',
      order: fields.length,
    });
  };

  return (
    <FormArraySection
      title="Education"
      addLabel="Add Education"
      emptyIcon="school"
      emptyTitle="+ Add Education"
      emptyDescription="Add your degrees, certifications, and academic achievements."
      fields={fields}
      onAdd={handleAdd}
      onRemove={remove}
      onMove={move}
      getItemTitle={(_, index) => watch(`education.${index}.degree`) || 'Degree / Diploma'}
      getItemSubtitle={(_, index) => {
        const inst = watch(`education.${index}.institution`) || 'Institution';
        const start = watch(`education.${index}.startDate`) || 'Start';
        const end = watch(`education.${index}.endDate`) || 'End';
        return `${inst} · ${start} - ${end}`;
      }}
      renderItemFields={(_, index) => {
        const errorObj = errors.education?.[index];
        return (
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Degree / Certificate"
              registration={register(`education.${index}.degree`)}
              error={errorObj?.degree}
              placeholder="e.g. B.S. Interaction Design"
            />
            <FormInput
              label="School / Institution"
              registration={register(`education.${index}.institution`)}
              error={errorObj?.institution}
              placeholder="e.g. California College of the Arts"
            />
            <FormInput
              label="Field of Study"
              registration={register(`education.${index}.fieldOfStudy`)}
              placeholder="e.g. Interaction Design"
            />
            <FormInput
              label="Result / Grade / GPA"
              registration={register(`education.${index}.result`)}
              placeholder="e.g. 3.8 / 4.0"
            />
            <FormInput
              label="Start Date"
              registration={register(`education.${index}.startDate`)}
              error={errorObj?.startDate}
              placeholder="e.g. 2014"
              colSpan="col-span-1"
            />
            <FormInput
              label="End Date"
              registration={register(`education.${index}.endDate`)}
              placeholder="e.g. 2018"
              colSpan="col-span-1"
            />
          </div>
        );
      }}
    />
  );
}
