'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import { useFieldArray, UseFormReturn } from 'react-hook-form';
import type { UpdateResumeDTO } from '@/app/api/model/request/resume/resume';
import { SkillCategory } from '@/app/api/model/enums/resume';
import { useState } from 'react';

interface SkillsFormProps {
  form: UseFormReturn<UpdateResumeDTO>;
}

export function SkillsForm({ form }: SkillsFormProps) {
  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skills',
  });

  const [newSkill, setNewSkill] = useState('');
  const [newCategory, setNewCategory] = useState<SkillCategory>(SkillCategory.TECHNICAL);

  const handleAdd = () => {
    if (!newSkill.trim()) return;
    append({
      name: newSkill.trim(),
      category: newCategory,
      order: fields.length,
    });
    setNewSkill('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-[20px] font-bold text-[#7a1f1f] font-['Playfair_Display'] mb-2">
          Skills
        </h3>
        <p className="text-[13px] text-[#564240]">
          Add skills and categorize them (e.g. Technical, Soft, Tools/Frameworks).
        </p>
      </div>

      {/* Add Skill Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[#fff8f6] p-4 rounded-xl border border-[#ddc0bd] shadow-sm">
        <div className="flex-1">
          <input
            id="skill-name-input"
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
            className="w-full bg-white border border-[#ddc0bd] rounded-lg px-4 py-2.5 text-[#2b1611] text-[16px] sm:text-[15px] focus:outline-none focus:border-[#7a1f1f] focus:ring-4 focus:ring-[#7a1f1f]/5 transition-all font-['Hanken_Grotesk']"
            placeholder="e.g. React.js, UI/UX Design, Leadership"
          />
        </div>
        <div className="sm:w-48">
          <select
            id="skill-category-select"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as SkillCategory)}
            className="w-full bg-white border border-[#ddc0bd] rounded-lg px-4 py-2.5 text-[#2b1611] text-[15px] focus:outline-none focus:border-[#7a1f1f] focus:ring-4 focus:ring-[#7a1f1f]/5 transition-all font-['Hanken_Grotesk'] cursor-pointer"
          >
            {Object.values(SkillCategory).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button
          id="add-skill-btn"
          type="button"
          onClick={handleAdd}
          className="px-6 py-2.5 rounded-lg bg-[#7a1f1f] hover:bg-[#5b060c] text-white font-bold text-[14px] transition-colors cursor-pointer"
        >
          Add
        </button>
      </div>

      {fields.length === 0 ? (
        <button
          type="button"
          onClick={() => {
            const input = document.getElementById('skill-name-input');
            input?.focus();
          }}
          className="w-full py-12 border-2 border-dashed border-[#ddc0bd] rounded-xl flex flex-col items-center justify-center text-[#564240] hover:border-[#7a1f1f]/50 hover:bg-[#fff8f6] transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-[#fff0ed] flex items-center justify-center mb-3 group-hover:bg-[#ffe2db] transition-colors">
            <IconMapper name="psychology" className="text-2xl text-[#7a1f1f]" />
          </div>
          <h4 className="font-['Playfair_Display'] text-[18px] leading-[24px] font-bold text-[#7a1f1f] mb-1">
            + Add Your Skills
          </h4>
          <p className="text-[12px] leading-[16px] text-[#564240]/60 font-['Hanken_Grotesk'] font-medium">
            Type a skill above and click Add or press Enter.
          </p>
        </button>
      ) : (
        <div className="space-y-6">
          {Object.values(SkillCategory).map((cat) => {
            const categorySkills = fields
              .map((f, i) => ({ ...f, index: i }))
              .filter((f) => f.category === cat);
            if (categorySkills.length === 0) return null;

            return (
              <div key={cat} className="space-y-2">
                <h4 className="text-[11px] tracking-wider font-bold text-[#7a1f1f] uppercase font-['Hanken_Grotesk']">
                  {cat}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((field) => (
                    <div
                      key={field.id}
                      className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full bg-[#fff0ed] border border-[#ddc0bd] text-[#2b1611] text-[13px] font-medium font-['Hanken_Grotesk']"
                    >
                      <span>{field.name}</span>
                      <button
                        type="button"
                        onClick={() => remove(field.index)}
                        className="w-5 h-5 rounded-full hover:bg-[#7a1f1f]/10 text-[#564240] hover:text-[#7a1f1f] flex items-center justify-center transition-all cursor-pointer"
                      >
                        <IconMapper name="close" className="text-[14px]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
