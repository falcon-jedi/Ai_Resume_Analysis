/**
 * Single source of truth for all resume sections.
 *
 * - `key`         — editor/form key (matches UpdateResumeDTO fields)
 * - `templateKey` — key used in template metadata.json `sections` arrays
 * - `label`       — human-readable tab label shown in the stepper
 *
 * To add a new section: add one entry here. Everything else (stepper, editor,
 * prev/next navigation) derives from this list automatically.
 */
export const SECTION_REGISTRY = [
  { key: 'personalInfo', templateKey: 'personal', label: 'Personal' },
  { key: 'summary', templateKey: 'summary', label: 'Summary' },
  { key: 'experience', templateKey: 'experience', label: 'Experience' },
  { key: 'education', templateKey: 'education', label: 'Education' },
  { key: 'projects', templateKey: 'projects', label: 'Projects' },
  { key: 'skills', templateKey: 'skills', label: 'Skills' },
  { key: 'certifications', templateKey: 'certifications', label: 'Certifications' },
  { key: 'achievements', templateKey: 'achievements', label: 'Achievements' },
  { key: 'languages', templateKey: 'languages', label: 'Languages' },
  { key: 'references', templateKey: 'references', label: 'References' },
] as const;

export type SectionKey = (typeof SECTION_REGISTRY)[number]['key'];
export type TemplateKey = (typeof SECTION_REGISTRY)[number]['templateKey'];
