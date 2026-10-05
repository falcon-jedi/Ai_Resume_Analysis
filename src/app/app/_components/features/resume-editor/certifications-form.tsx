'use client';

import { useFieldArray, UseFormReturn } from 'react-hook-form';
import type { UpdateResumeDTO } from '@/app/api/model/request/resume/resume';
import { FormArraySection } from './form-array-section';
import { FormInput } from './form-field';

interface CertificationsFormProps {
  form: UseFormReturn<UpdateResumeDTO>;
}

export function CertificationsForm({ form }: CertificationsFormProps) {
  const {
    control,
    register,
    formState: { errors },
    watch,
  } = form;
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'certifications',
  });

  const handleAdd = () => {
    append({
      name: '',
      issuer: '',
      date: '',
      url: '',
      order: fields.length,
    });
  };

  return (
    <FormArraySection
      title="Certifications"
      addLabel="Add Certification"
      emptyIcon="workspace_premium"
      emptyTitle="+ Add Certification"
      emptyDescription="Add industry credentials, licenses, or course certificates."
      fields={fields}
      onAdd={handleAdd}
      onRemove={remove}
      onMove={move}
      getItemTitle={(_, index) => watch(`certifications.${index}.name`) || 'Certification Name'}
      getItemSubtitle={(_, index) => {
        const issuer = watch(`certifications.${index}.issuer`) || 'Issuer';
        const date = watch(`certifications.${index}.date`) || 'Date';
        return `${issuer} · ${date}`;
      }}
      renderItemFields={(_, index) => {
        const errorObj = errors.certifications?.[index];

        return (
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Certification Name"
              registration={register(`certifications.${index}.name`)}
              error={errorObj?.name}
              placeholder="e.g. AWS Certified Solutions Architect"
            />
            <FormInput
              label="Issuer / Organization"
              registration={register(`certifications.${index}.issuer`)}
              placeholder="e.g. Amazon Web Services"
            />
            <FormInput
              label="Issue Date"
              registration={register(`certifications.${index}.date`)}
              placeholder="e.g. Nov 2023"
            />
            <FormInput
              label="Credential URL"
              registration={register(`certifications.${index}.url`)}
              error={errorObj?.url}
              placeholder="https://credly.com/..."
            />
          </div>
        );
      }}
    />
  );
}
