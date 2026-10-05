'use client';

import { useFieldArray, UseFormReturn } from 'react-hook-form';
import type { UpdateResumeDTO } from '@/app/api/model/request/resume/resume';
import { LanguageProficiency } from '@/app/api/model/enums/resume';
import { FormArraySection } from './form-array-section';
import { FormInput, FormSelect } from './form-field';

interface LanguagesFormProps {
  form: UseFormReturn<UpdateResumeDTO>;
}

export function LanguagesForm({ form }: LanguagesFormProps) {
  const {
    control,
    register,
    formState: { errors },
    watch,
  } = form;
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'languages',
  });

  const handleAdd = () => {
    append({
      name: '',
      proficiency: LanguageProficiency.FLUENT as LanguageProficiency,
      order: fields.length,
    });
  };

  return (
    <FormArraySection
      title="Languages"
      addLabel="Add Language"
      emptyIcon="translate"
      emptyTitle="+ Add Language"
      emptyDescription="List languages you speak and your proficiency level."
      fields={fields}
      onAdd={handleAdd}
      onRemove={remove}
      onMove={move}
      getItemTitle={(_, index) => watch(`languages.${index}.name`) || 'Language Name'}
      getItemSubtitle={(_, index) =>
        watch(`languages.${index}.proficiency`) || 'Select Proficiency'
      }
      renderItemFields={(_, index) => {
        const errorObj = errors.languages?.[index];

        return (
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Language Name"
              registration={register(`languages.${index}.name`)}
              error={errorObj?.name}
              placeholder="e.g. English, Spanish, German"
            />
            <FormSelect
              label="Proficiency Level"
              registration={register(`languages.${index}.proficiency`)}
              options={Object.values(LanguageProficiency)}
            />
          </div>
        );
      }}
    />
  );
}
