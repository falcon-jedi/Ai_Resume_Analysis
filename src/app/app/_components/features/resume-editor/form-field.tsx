'use client';

import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  colSpan?: string;
}

export function FormInput({
  label,
  registration,
  error,
  colSpan = 'col-span-2 md:col-span-1',
  className = '',
  ...props
}: FormInputProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${colSpan}`}>
      <label className="text-[11px] font-bold text-[#564240] uppercase tracking-wider font-['Hanken_Grotesk']">
        {label}
      </label>
      <input
        {...registration}
        {...props}
        className={`w-full bg-white border border-[#ddc0bd] rounded-lg px-4 py-2.5 text-[#2b1611] text-[16px] sm:text-[15px] focus:outline-none focus:border-[#7a1f1f] focus:ring-4 focus:ring-[#7a1f1f]/5 transition-all font-['Hanken_Grotesk'] ${className}`}
      />
      {error && <span className="text-xs text-[#7a1f1f] mt-0.5">{error.message}</span>}
    </div>
  );
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  colSpan?: string;
}

export function FormTextarea({
  label,
  registration,
  error,
  colSpan = 'col-span-2',
  className = '',
  rows = 4,
  ...props
}: FormTextareaProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${colSpan}`}>
      <label className="text-[11px] font-bold text-[#564240] uppercase tracking-wider font-['Hanken_Grotesk']">
        {label}
      </label>
      <textarea
        rows={rows}
        {...registration}
        {...props}
        className={`w-full bg-white border border-[#ddc0bd] rounded-lg px-4 py-3 text-[#2b1611] text-[16px] sm:text-[14px] leading-relaxed focus:outline-none focus:border-[#7a1f1f] focus:ring-4 focus:ring-[#7a1f1f]/5 transition-all resize-none font-['Hanken_Grotesk'] ${className}`}
      />
      {error && <span className="text-xs text-[#7a1f1f] mt-0.5">{error.message}</span>}
    </div>
  );
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  options: { label: string; value: string }[] | string[];
  colSpan?: string;
}

export function FormSelect({
  label,
  registration,
  error,
  options,
  colSpan = 'col-span-2 md:col-span-1',
  className = '',
  ...props
}: FormSelectProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${colSpan}`}>
      <label className="text-[11px] font-bold text-[#564240] uppercase tracking-wider font-['Hanken_Grotesk']">
        {label}
      </label>
      <select
        {...registration}
        {...props}
        className={`w-full bg-white border border-[#ddc0bd] rounded-lg px-4 py-2.5 text-[#2b1611] text-[16px] sm:text-[15px] focus:outline-none focus:border-[#7a1f1f] focus:ring-4 focus:ring-[#7a1f1f]/5 transition-all font-['Hanken_Grotesk'] cursor-pointer ${className}`}
      >
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lbl = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error && <span className="text-xs text-[#7a1f1f] mt-0.5">{error.message}</span>}
    </div>
  );
}
