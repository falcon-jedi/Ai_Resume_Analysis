'use client';

import { useFieldArray, UseFormReturn } from 'react-hook-form';
import type { UpdateResumeDTO } from '@/app/api/model/request/resume/resume';
import { FormArraySection } from './form-array-section';
import { FormInput } from './form-field';

interface ReferencesFormProps {
  form: UseFormReturn<UpdateResumeDTO>;
}

export function ReferencesForm({ form }: ReferencesFormProps) {
  const {
    control,
    register,
    formState: { errors },
    watch,
  } = form;
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'references',
  });

  const handleAdd = () => {
    append({
      name: '',
      designation: '',
      company: '',
      email: '',
      phone: '',
      order: fields.length,
    });
  };

  return (
    <FormArraySection
      title="References"
      addLabel="Add Reference"
      emptyIcon="group"
      emptyTitle="+ Add Reference"
      emptyDescription="Add professional references who can vouch for your work."
      fields={fields}
      onAdd={handleAdd}
      onRemove={remove}
      onMove={move}
      getItemTitle={(_, index) => watch(`references.${index}.name`) || 'Reference Name'}
      getItemSubtitle={(_, index) => {
        const desig = watch(`references.${index}.designation`) || 'Designation';
        const company = watch(`references.${index}.company`) || 'Company';
        return `${desig} · ${company}`;
      }}
      renderItemFields={(_, index) => {
        const errorObj = errors.references?.[index];

        return (
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Reference Name"
              registration={register(`references.${index}.name`)}
              error={errorObj?.name}
              placeholder="e.g. Dr. Jane Smith"
            />
            <FormInput
              label="Designation / Job Title"
              registration={register(`references.${index}.designation`)}
              placeholder="e.g. Director of Engineering"
            />
            <FormInput
              label="Company"
              registration={register(`references.${index}.company`)}
              placeholder="e.g. Google LLC"
            />
            <FormInput
              type="email"
              label="Email Address"
              registration={register(`references.${index}.email`)}
              error={errorObj?.email}
              placeholder="janesmith@company.com"
            />
            <FormInput
              label="Phone Number"
              registration={register(`references.${index}.phone`)}
              placeholder="+1 (555) 012-3456"
            />
          </div>
        );
      }}
    />
  );
}
