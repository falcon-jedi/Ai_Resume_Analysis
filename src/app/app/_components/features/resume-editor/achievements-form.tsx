'use client';

import { useFieldArray, UseFormReturn } from 'react-hook-form';
import type { UpdateResumeDTO } from '@/app/api/model/request/resume/resume';
import { FormArraySection } from './form-array-section';
import { FormInput, FormTextarea } from './form-field';

interface AchievementsFormProps {
  form: UseFormReturn<UpdateResumeDTO>;
}

export function AchievementsForm({ form }: AchievementsFormProps) {
  const {
    control,
    register,
    formState: { errors },
    watch,
  } = form;
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'achievements',
  });

  const handleAdd = () => {
    append({
      title: '',
      date: '',
      description: '',
      order: fields.length,
    });
  };

  return (
    <FormArraySection
      title="Achievements & Awards"
      addLabel="Add Achievement"
      emptyIcon="emoji_events"
      emptyTitle="+ Add Achievement"
      emptyDescription="Highlight honors, awards, or key professional milestones."
      fields={fields}
      onAdd={handleAdd}
      onRemove={remove}
      onMove={move}
      getItemTitle={(_, index) => watch(`achievements.${index}.title`) || 'Achievement Title'}
      getItemSubtitle={(_, index) => watch(`achievements.${index}.date`) || 'Date'}
      renderItemFields={(_, index) => {
        const errorObj = errors.achievements?.[index];

        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Achievement Title"
                registration={register(`achievements.${index}.title`)}
                error={errorObj?.title}
                placeholder="e.g. Hackathon First Place winner"
              />
              <FormInput
                label="Date / Year"
                registration={register(`achievements.${index}.date`)}
                placeholder="e.g. Oct 2024"
              />
            </div>
            <FormTextarea
              label="Description"
              registration={register(`achievements.${index}.description`)}
              placeholder="Describe the award or milestone..."
            />
          </>
        );
      }}
    />
  );
}
