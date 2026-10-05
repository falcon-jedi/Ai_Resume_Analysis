'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { SECTION_REGISTRY } from '@/app/app/_components/features/resume-editor/section-registry';

import {
  useResume,
  useUpdateResume,
  useDownloadPdf,
  useResumePreview,
} from '@/app/app/_hooks/use-resumes';
import { useTemplate } from '@/app/app/_hooks/use-templates';
import { SectionStepper } from '@/app/app/_components/features/resume-editor/section-stepper';
import { PersonalInfoForm } from '@/app/app/_components/features/resume-editor/personal-info-form';
import { SummaryForm } from '@/app/app/_components/features/resume-editor/summary-form';
import { ExperienceForm } from '@/app/app/_components/features/resume-editor/experience-form';
import { EducationForm } from '@/app/app/_components/features/resume-editor/education-form';
import { ProjectsForm } from '@/app/app/_components/features/resume-editor/projects-form';
import { SkillsForm } from '@/app/app/_components/features/resume-editor/skills-form';
import { CertificationsForm } from '@/app/app/_components/features/resume-editor/certifications-form';
import { AchievementsForm } from '@/app/app/_components/features/resume-editor/achievements-form';
import { LanguagesForm } from '@/app/app/_components/features/resume-editor/languages-form';
import { ReferencesForm } from '@/app/app/_components/features/resume-editor/references-form';
import { PreviewSelectionToolbar } from '@/app/app/_components/features/resume-editor/preview-selection-toolbar';

import { SkillCategory, LanguageProficiency } from '@/app/api/model/enums/resume';
import type { UpdateResumeDTO } from '@/app/api/model/request/resume/resume';
import { Skeleton } from '@/app/app/_components/common/skeleton';
import { useRouter } from 'next/navigation';
import { LeaveEditorDialog } from './components/LeaveEditorDialog';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  useDefaultLayout,
} from '@/app/app/_components/ui/resizable';

interface ResumeEditorClientProps {
  resumeId: string;
}

// Derived dynamically from SECTION_REGISTRY — no section names hardcoded here.
// Maps template metadata.json key (e.g. "personal") → editor form key (e.g. "personalInfo").
const TEMPLATE_KEY_TO_EDITOR = Object.fromEntries(
  SECTION_REGISTRY.map((s) => [s.templateKey, s.key]),
);

const DOC_WIDTH = 794;

export default function ResumeEditorClient({ resumeId }: ResumeEditorClientProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('personalInfo');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'failed'>('saved');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [zoom, setZoom] = useState(100);
  // Measured from iframe after paged.js layout
  const [docHeight, setDocHeight] = useState(1171);
  const [pageCount, setPageCount] = useState(1);
  const [showAiWorkspace, setShowAiWorkspace] = useState(true);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isLeaveSaving, setIsLeaveSaving] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for pagination events from the preview iframe running paged.js
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'PAGED_DONE') {
        if (typeof e.data.count === 'number' && e.data.count > 0) {
          setPageCount(e.data.count);
        }
        if (typeof e.data.height === 'number' && e.data.height > 0) {
          setDocHeight(e.data.height);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;

    const updateSize = () => {
      if (el.clientWidth > 0) {
        setContainerWidth(el.clientWidth);
      }
    };

    updateSize();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [showMobilePreview]);

  const layoutProps = useDefaultLayout({
    id: 'jobpatra-resume-editor-layout',
    panelIds: ['form-panel', 'preview-panel'],
  });

  // Fetch resume data and live preview html via TanStack Query
  const { data: resume, isLoading, isError } = useResume(resumeId);
  const { data: previewHtml, isLoading: isPreviewLoading } = useResumePreview(resumeId);
  const { data: templateData } = useTemplate(resume?.templateId ?? '');
  const updateMutation = useUpdateResume(resumeId);
  const downloadPdfMutation = useDownloadPdf();

  const form = useForm<UpdateResumeDTO>({
    defaultValues: {
      title: '',
      personalInfo: {
        fullName: '',
        photoUrl: '',
        jobTitle: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: '',
        summary: '',
      },
      experiences: [],
      education: [],
      projects: [],
      skills: [],
      certifications: [],
      achievements: [],
      languages: [],
      references: [],
    },
  });

  const {
    reset,
    watch,
    formState: { isDirty },
  } = form;

  // ── Derive visible sections directly from template metadata ─────────────
  // Order and presence come 100% from the `sections` array in metadata.json.
  // No hardcoded list lives here — TEMPLATE_KEY_TO_EDITOR is just a translator.
  const templateRawSections = (templateData as { sections?: string[] } | null)?.sections ?? [];
  const templateSupportsPhoto = Boolean((templateData as { hasPhoto?: boolean } | null)?.hasPhoto);
  const visibleSectionsKeys = templateRawSections
    .map((k) => TEMPLATE_KEY_TO_EDITOR[k])
    .filter(Boolean) as string[];

  // Auto-correct active section when template changes and active section is no longer visible
  useEffect(() => {
    if (visibleSectionsKeys.length > 0 && !visibleSectionsKeys.includes(activeSection)) {
      setActiveSection(visibleSectionsKeys[0]);
    }
  }, [visibleSectionsKeys, activeSection]);

  // Track initialization and last saved values to prevent form resets and redundant patches
  const isInitialized = useRef<string | null>(null); // stores the resumeId that was initialized
  const lastSavedValues = useRef<UpdateResumeDTO | null>(null);
  const isSampleDataRef = useRef(false);

  // Sync DB record to Form values only ONCE per resumeId
  useEffect(() => {
    if (resume && isInitialized.current !== resumeId) {
      isSampleDataRef.current = !!resume.isSampleData;

      const initialValues: UpdateResumeDTO = {
        title: resume.title ?? '',
        personalInfo: {
          fullName: resume.personalInfo?.fullName ?? '',
          photoUrl: resume.personalInfo?.photoUrl ?? '',
          jobTitle: resume.personalInfo?.jobTitle ?? '',
          email: resume.personalInfo?.email ?? '',
          phone: resume.personalInfo?.phone ?? '',
          location: resume.personalInfo?.location ?? '',
          website: resume.personalInfo?.website ?? '',
          linkedin: resume.personalInfo?.linkedin ?? '',
          github: resume.personalInfo?.github ?? '',
          summary: resume.personalInfo?.summary ?? '',
        },
        experiences:
          resume.experiences?.map((e) => ({
            company: e.company,
            position: e.position,
            location: e.location ?? '',
            startDate: e.startDate,
            endDate: e.endDate ?? '',
            currentlyWorking: e.currentlyWorking ?? false,
            description: e.description ?? '',
            highlights: e.highlights ?? [],
            order: e.order,
          })) ?? [],
        education:
          resume.education?.map((e) => ({
            institution: e.institution,
            degree: e.degree,
            fieldOfStudy: e.fieldOfStudy ?? '',
            startDate: e.startDate,
            endDate: e.endDate ?? '',
            result: e.result ?? '',
            order: e.order,
          })) ?? [],
        projects:
          resume.projects?.map((p) => ({
            title: p.title,
            field: p.field ?? '',
            startDate: p.startDate ?? '',
            endDate: p.endDate ?? '',
            description: p.description ?? '',
            technologies: p.technologies ?? [],
            link: p.link ?? '',
            order: p.order,
          })) ?? [],
        skills:
          resume.skills?.map((s) => ({
            name: s.name,
            category: s.category as SkillCategory,
            order: s.order,
          })) ?? [],
        certifications:
          resume.certifications?.map((c) => ({
            name: c.name,
            issuer: c.issuer ?? '',
            date: c.date ?? '',
            url: c.url ?? '',
            order: c.order,
          })) ?? [],
        achievements:
          resume.achievements?.map((a) => ({
            title: a.title,
            date: a.date ?? '',
            description: a.description ?? '',
            order: a.order,
          })) ?? [],
        languages:
          resume.languages?.map((l) => ({
            name: l.name,
            proficiency: l.proficiency as LanguageProficiency,
            order: l.order,
          })) ?? [],
        references:
          resume.references?.map((r) => ({
            name: r.name,
            designation: r.designation ?? '',
            company: r.company ?? '',
            email: r.email ?? '',
            phone: r.phone ?? '',
            order: r.order,
          })) ?? [],
      };

      reset(initialValues);
      lastSavedValues.current = initialValues;
      isInitialized.current = resumeId;
    }
  }, [resume, reset, resumeId]);

  // Manual save logic
  const onSubmit = async (values: UpdateResumeDTO) => {
    try {
      setSaveStatus('saving');
      let payload: UpdateResumeDTO;

      if (isSampleDataRef.current) {
        payload = values;
      } else {
        const patchPayload: UpdateResumeDTO = {};
        let hasChanges = false;

        const keys = Object.keys(values) as Array<keyof UpdateResumeDTO>;
        for (const key of keys) {
          const currentStr = JSON.stringify(values[key]);
          const lastStr = JSON.stringify(lastSavedValues.current?.[key]);

          if (currentStr !== lastStr) {
            patchPayload[key] = values[key] as any;
            hasChanges = true;
          }
        }

        if (!hasChanges) {
          setSaveStatus('saved');
          return;
        }
        payload = patchPayload;
      }

      await updateMutation.mutateAsync(payload);
      const updatedValues = { ...values };
      reset(updatedValues);
      lastSavedValues.current = updatedValues;
      isSampleDataRef.current = false;
      setSaveStatus('saved');
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('failed');
    }
  };

  const handleBackClick = () => {
    if (isDirty) {
      setIsLeaveDialogOpen(true);
    } else {
      router.push('/app/dashboard');
    }
  };

  const handleSaveAndLeave = async () => {
    try {
      setIsLeaveSaving(true);
      await onSubmit(form.getValues());
      setIsLeaveDialogOpen(false);
      router.push('/app/dashboard');
    } catch (err) {
      console.error('Save and leave failed:', err);
    } finally {
      setIsLeaveSaving(false);
    }
  };

  const handleDiscardAndLeave = () => {
    if (lastSavedValues.current) {
      reset(lastSavedValues.current);
    }
    setIsLeaveDialogOpen(false);
    router.push('/app/dashboard');
  };

  // Browser navigation / tab-close guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleTitleChange = (newTitle: string) => {
    form.setValue('title', newTitle, { shouldDirty: true });
  };

  const handleDownloadPdf = () => {
    downloadPdfMutation.mutate({
      id: resumeId,
      filename: `${resume?.title || 'resume'}.pdf`,
    });
  };

  // ── Compute preview HTML with paged.js pagination unconditionally before any early returns ──
  const displayHtml = useMemo(() => {
    if (!previewHtml) return '';
    const overrideStyle = `
      <style>
        @page {
          size: A4;
          margin: 10mm;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #525659 !important;
          width: 100% !important;
          overflow-x: hidden !important;
        }
        /* Hide unpaginated content until Paged.js lays it out to prevent flash */
        body:not(.pagedjs-ready) .container {
          opacity: 0;
        }
        .container {
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        .pagedjs_pages {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          padding: 24px 0;
          background: transparent;
        }
        .pagedjs_page {
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
          position: relative;
        }
        .pagedjs_margin-bottom, .pagedjs_margin-top, .pagedjs_margin-left, .pagedjs_margin-right {
          pointer-events: none;
        }
        .page-badge {
          position: absolute;
          top: 14px;
          right: 20px;
          font-size: 11px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.35);
          letter-spacing: 0.05em;
          pointer-events: none;
          z-index: 10;
        }
      </style>
      <script src="/paged.polyfill.min.js"></script>
      <script>
        (function() {
          class RenderHandler extends Paged.Handler {
            afterRendered(pages) {
              document.body.classList.add('pagedjs-ready');
              if (pages.length > 1) {
                pages.forEach(function(p, idx) {
                  var badge = document.createElement('div');
                  badge.className = 'page-badge';
                  badge.textContent = (idx + 1) + ' / ' + pages.length;
                  p.element.appendChild(badge);
                });
              }
              window.parent.postMessage({
                type: 'PAGED_DONE',
                count: pages.length,
                height: document.body.scrollHeight
              }, '*');
            }
          }
          Paged.registerHandlers(RenderHandler);
          setTimeout(function() {
            document.body.classList.add('pagedjs-ready');
            if (!document.querySelector('.pagedjs_page')) {
              var c = document.querySelector('.container');
              var h = c ? c.getBoundingClientRect().height : 1123;
              window.parent.postMessage({
                type: 'PAGED_DONE',
                count: Math.ceil(h / 1123),
                height: h
              }, '*');
            }
          }, 2500);
        })();
      </script>
    `;
    return previewHtml.includes('</head>')
      ? previewHtml.replace('</head>', `${overrideStyle}</head>`)
      : `${overrideStyle}${previewHtml}`;
  }, [previewHtml]);

  const isMobileView = containerWidth > 0 && containerWidth < 640;
  const paddingOffset = isMobileView ? 16 : 48;
  const availableWidth = containerWidth > 0 ? containerWidth - paddingOffset : 360;
  const fitScale = Math.min(1, Math.max(0.2, availableWidth / DOC_WIDTH));
  const effectiveScale = fitScale * (zoom / 100);

  const scaledWidth = Math.round(DOC_WIDTH * effectiveScale);
  const scaledHeight = Math.round(docHeight * effectiveScale);

  if (isLoading) {
    return (
      <div className="flex-1 p-8 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (isError || !resume) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#fff8f6]">
        <IconMapper name="error" className="text-5xl text-[#7a1f1f] mb-4" />
        <h3 className="text-xl font-bold text-[#2b1611] mb-2">Resume Not Found</h3>
        <p className="text-[#564240] mb-6">This resume may have been deleted.</p>
        <button
          onClick={() => router.push('/app/dashboard')}
          className="px-6 py-2.5 rounded-full bg-[#7a1f1f] text-white text-[14px] font-bold cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const currentIdx = visibleSectionsKeys.indexOf(activeSection);
  const prevSection = visibleSectionsKeys[currentIdx - 1];
  const nextSection = visibleSectionsKeys[currentIdx + 1];

  const renderFormContent = () => (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Stepper / Horizontal Section Navigation */}
      <SectionStepper
        active={activeSection}
        onChange={setActiveSection}
        form={form}
        templateSections={(templateData as { sections?: string[] } | null)?.sections}
      />

      {/* Form Canvas */}
      <div
        className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-12 pt-4 sm:pt-6 no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {activeSection === 'personalInfo' && (
            <PersonalInfoForm
              form={form}
              supportsPhoto={templateSupportsPhoto}
              resumeId={resumeId}
            />
          )}
          {activeSection === 'summary' && <SummaryForm form={form} />}
          {activeSection === 'experience' && <ExperienceForm form={form} />}
          {activeSection === 'education' && <EducationForm form={form} />}
          {activeSection === 'projects' && <ProjectsForm form={form} />}
          {activeSection === 'skills' && <SkillsForm form={form} />}
          {activeSection === 'certifications' && <CertificationsForm form={form} />}
          {activeSection === 'achievements' && <AchievementsForm form={form} />}
          {activeSection === 'languages' && <LanguagesForm form={form} />}
          {activeSection === 'references' && <ReferencesForm form={form} />}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-8 border-t border-[#ddc0bd]/30 mt-8">
            {prevSection ? (
              <button
                type="button"
                onClick={() => setActiveSection(prevSection)}
                className="text-[#564240] font-semibold text-[13px] tracking-wider uppercase flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#fff0ed] transition-all cursor-pointer"
              >
                <IconMapper name="west" className="text-base" />
                Previous
              </button>
            ) : (
              <div />
            )}
            {nextSection && (
              <button
                type="button"
                onClick={() => setActiveSection(nextSection)}
                className="bg-[#7a1f1f] text-white px-5 py-2 rounded-lg font-bold text-[13px] tracking-wider uppercase shadow-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
              >
                Next Section
                <IconMapper name="east" className="text-base" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );

  const renderPreviewContent = () => {
    if (!isMobile) {
      /* ── Original Desktop Preview (Centered 560px Paper with 1/1.414 aspect ratio) ── */
      return (
        <>
          {/* Desktop Floating Preview Toolbar */}
          <div className="w-full h-12 border-b border-[#ddc0bd]/30 px-6 flex items-center justify-between bg-white/50 backdrop-blur-sm z-20 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#564240]/60">
              Live Preview
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom((prev) => Math.max(50, prev - 10))}
                className="p-1.5 hover:bg-[#fff0ed] rounded-lg transition-colors text-[#564240] hover:text-[#7a1f1f] cursor-pointer"
                title="Zoom Out"
              >
                <IconMapper name="remove" className="text-base" />
              </button>
              <span className="text-[12px] font-semibold text-[#2b1611] px-1 font-['Hanken_Grotesk']">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom((prev) => Math.min(200, prev + 10))}
                className="p-1.5 hover:bg-[#fff0ed] rounded-lg transition-colors text-[#564240] hover:text-[#7a1f1f] cursor-pointer"
                title="Zoom In"
              >
                <IconMapper name="add" className="text-base" />
              </button>
              <span className="text-[10px] font-semibold text-[#564240]/50 px-1 font-['Hanken_Grotesk'] tabular-nums">
                {pageCount}pg
              </span>
              <div className="w-px h-4 bg-[#ddc0bd] mx-1"></div>
              <button
                onClick={handleDownloadPdf}
                className="p-1.5 hover:bg-[#fff0ed] rounded-lg transition-colors text-[#564240] hover:text-[#7a1f1f] cursor-pointer"
                title="Download PDF"
              >
                <IconMapper name="download" className="text-base" />
              </button>
            </div>
          </div>

          {/* Desktop Fit-to-Width Scaled Sheet */}
          <div
            ref={previewContainerRef}
            className="flex-1 w-full flex flex-col items-center p-6 overflow-y-auto no-scrollbar bg-[#525659]"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div
              style={{
                width: `${scaledWidth}px`,
                height: `${scaledHeight}px`,
              }}
              className="relative shrink-0 my-4 transition-all duration-200"
            >
              {/* Scaled document — z-index 1 so overlay divs render above */}
              <div
                style={{
                  width: `${DOC_WIDTH}px`,
                  height: `${docHeight}px`,
                  transform: `scale(${effectiveScale})`,
                  transformOrigin: 'top left',
                  zIndex: 1,
                }}
                className="absolute top-0 left-0 bg-white flex flex-col overflow-hidden"
              >
                {isPreviewLoading && (
                  <div className="absolute inset-0 bg-[#fff8f6]/40 backdrop-blur-[1px] z-50 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#7a1f1f]/20 border-t-[#7a1f1f] rounded-full animate-spin" />
                  </div>
                )}

                {/* Resume Preview Document Iframe */}
                {displayHtml ? (
                  <iframe
                    id="resume-preview-iframe"
                    ref={iframeRef}
                    srcDoc={displayHtml}
                    className="w-full h-full border-none bg-transparent"
                    title="Resume Preview"
                    onLoad={() => {
                      try {
                        const doc = iframeRef.current?.contentDocument;
                        if (!doc) return;
                        const pages = doc.querySelectorAll('.pagedjs_page');
                        if (pages.length > 0) {
                          setPageCount(pages.length);
                          setDocHeight(
                            doc.body.scrollHeight || Math.max(1123, pages.length * 1147),
                          );
                        }
                      } catch {}
                    }}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-[#564240] p-8 text-center bg-[#fff8f6]">
                    <IconMapper name="find_in_page" className="text-4xl block mb-2" />
                    <p className="text-[14px]">Loading live preview...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Floating AI improve toolbar on text selection in live preview */}
          <PreviewSelectionToolbar iframeRef={iframeRef} zoom={zoom} form={form} />

          {/* Mini Toggle for Collapsed State */}
          {!showAiWorkspace && (
            <button
              onClick={() => setShowAiWorkspace(true)}
              className="absolute right-4 top-16 bg-white shadow-md w-8 h-8 rounded-full border border-[#ddc0bd] flex items-center justify-center text-[#7a1f1f] hover:bg-[#fff0ed] transition-colors cursor-pointer z-30"
              title="Open AI Suggestions"
            >
              <IconMapper name="sparkles" className="text-lg" />
            </button>
          )}
        </>
      );
    }

    /* ── Mobile Preview (Fit-to-Width like viewing a PDF on a smartphone) ── */
    return (
      <>
        {/* Mobile Floating Preview Toolbar */}
        <div className="w-full h-11 border-b border-[#ddc0bd]/30 px-3 flex items-center justify-between bg-white/80 backdrop-blur-sm z-20 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#564240]/70">
            Live Preview
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((prev) => Math.max(50, prev - 10))}
              className="p-1 hover:bg-[#fff0ed] rounded-lg transition-colors text-[#564240] hover:text-[#7a1f1f] cursor-pointer"
              title="Zoom Out"
            >
              <IconMapper name="remove" className="text-base" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="text-[11px] font-semibold text-[#2b1611] px-1.5 py-0.5 rounded hover:bg-[#fff0ed] font-['Hanken_Grotesk'] cursor-pointer"
              title="Reset Zoom to Fit"
            >
              {zoom}%
            </button>
            <button
              onClick={() => setZoom((prev) => Math.min(200, prev + 10))}
              className="p-1 hover:bg-[#fff0ed] rounded-lg transition-colors text-[#564240] hover:text-[#7a1f1f] cursor-pointer"
              title="Zoom In"
            >
              <IconMapper name="add" className="text-base" />
            </button>
            <div className="w-px h-4 bg-[#ddc0bd] mx-0.5"></div>
            <button
              onClick={handleDownloadPdf}
              className="p-1 hover:bg-[#fff0ed] rounded-lg transition-colors text-[#564240] hover:text-[#7a1f1f] cursor-pointer"
              title="Download PDF"
            >
              <IconMapper name="download" className="text-base" />
            </button>
          </div>
        </div>

        {/* Mobile Fit-to-Width Scaled Sheet */}
        <div
          ref={previewContainerRef}
          className="flex-1 w-full flex flex-col items-center p-2 overflow-y-auto overflow-x-auto no-scrollbar bg-[#525659]"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div
            style={{
              width: `${scaledWidth}px`,
              height: `${scaledHeight}px`,
            }}
            className="relative shrink-0 my-4 transition-all duration-200"
          >
            {/* Scaled document */}
            <div
              style={{
                width: `${DOC_WIDTH}px`,
                height: `${docHeight}px`,
                transform: `scale(${effectiveScale})`,
                transformOrigin: 'top left',
                zIndex: 1,
              }}
              className="absolute top-0 left-0 bg-white flex flex-col overflow-hidden"
            >
              {isPreviewLoading && (
                <div className="absolute inset-0 bg-[#fff8f6]/40 backdrop-blur-[1px] z-50 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-[#7a1f1f]/20 border-t-[#7a1f1f] rounded-full animate-spin" />
                </div>
              )}

              {displayHtml ? (
                <iframe
                  id="resume-preview-iframe"
                  ref={iframeRef}
                  srcDoc={displayHtml}
                  className="w-full h-full border-none bg-transparent"
                  title="Resume Preview"
                  onLoad={() => {
                    try {
                      const doc = iframeRef.current?.contentDocument;
                      if (!doc) return;
                      const pages = doc.querySelectorAll('.pagedjs_page');
                      if (pages.length > 0) {
                        setPageCount(pages.length);
                        setDocHeight(doc.body.scrollHeight || Math.max(1123, pages.length * 1147));
                      }
                    } catch {}
                  }}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-[#564240] p-8 text-center bg-[#fff8f6]">
                  <IconMapper name="find_in_page" className="text-4xl block mb-2" />
                  <p className="text-[14px]">Loading live preview...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <PreviewSelectionToolbar
          iframeRef={iframeRef}
          zoom={Math.round(effectiveScale * 100)}
          form={form}
        />
      </>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-white">
      {/* Editor Header / Top Application Bar */}
      <header className="h-14 sm:h-16 border-b border-[#ddc0bd] bg-white flex items-center justify-between px-3 sm:px-6 z-20 shrink-0 gap-1.5 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={handleBackClick}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#ddc0bd] shadow-xs hover:bg-[#fff0ed] hover:border-[#7a1f1f]/40 flex items-center justify-center text-[#370003] transition-all cursor-pointer shrink-0"
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
          >
            <IconMapper name="arrow_back" className="text-[16px] sm:text-[18px]" />
          </button>
          <div className="flex items-center gap-1.5 min-w-0 max-w-[120px] xs:max-w-[160px] sm:max-w-[240px]">
            <IconMapper
              name="description"
              className="text-[#7a1f1f] text-[18px] hidden xs:block shrink-0"
            />
            <input
              id="editor-resume-title"
              type="text"
              // eslint-disable-next-line react-hooks/incompatible-library
              value={watch('title') || ''}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="bg-transparent border-none focus:ring-1 focus:ring-[#7a1f1f]/20 text-[#2b1611] font-['Hanken_Grotesk'] text-[13px] sm:text-[15px] font-bold p-1 w-full hover:bg-[#fff0ed] rounded transition-colors truncate focus:outline-none"
            />
          </div>

          <div className="h-4 w-px bg-[#ddc0bd] hidden md:block"></div>

          <div className="hidden md:flex items-center gap-2 text-[#564240]">
            <IconMapper name="auto_stories" className="text-sm" />
            <span className="text-[12px] font-semibold">
              Template:{' '}
              <span className="font-bold text-[#2b1611]">{resume.templateId || 'Default'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-[#564240] text-[11px] sm:text-[12px] font-semibold bg-[#fff0ed] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-[#ddc0bd]/60 shrink-0">
            {saveStatus === 'saving' ? (
              <>
                <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 border-[#7a1f1f]/20 border-t-[#7a1f1f] rounded-full animate-spin shrink-0" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : saveStatus === 'failed' ? (
              <>
                <IconMapper
                  name="cloud_off"
                  className="text-[14px] sm:text-[16px] text-[#7a1f1f] shrink-0"
                />
                <span className="text-[#7a1f1f] hidden sm:inline">Save failed</span>
              </>
            ) : isDirty ? (
              <>
                <IconMapper
                  name="pending"
                  className="text-[14px] sm:text-[16px] text-[#795900] shrink-0"
                />
                <span className="text-[#795900] hidden sm:inline">Unsaved</span>
              </>
            ) : (
              <>
                <IconMapper
                  name="cloud_done"
                  className="text-[14px] sm:text-[16px] text-emerald-600 shrink-0"
                />
                <span className="text-emerald-600 hidden sm:inline">Saved</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Preview toggle */}
          <button
            onClick={() => setShowMobilePreview((prev) => !prev)}
            className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-[#fff0ed] border border-[#ddc0bd] text-[#564240] text-xs font-semibold shrink-0 cursor-pointer"
            aria-label="Toggle preview"
            title={showMobilePreview ? 'Switch to Editor' : 'Switch to Live Preview'}
          >
            <IconMapper name={showMobilePreview ? 'edit' : 'visibility'} className="text-[16px]" />
            <span className="hidden xs:inline text-[11px]">
              {showMobilePreview ? 'Edit' : 'Preview'}
            </span>
          </button>

          <button
            onClick={form.handleSubmit(onSubmit)}
            disabled={updateMutation.isPending}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-[#7a1f1f] font-bold text-[13px] sm:text-[14px] hover:bg-[#fff0ed] rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloadPdfMutation.isPending}
            className="bg-[#7a1f1f] text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg font-bold text-[12px] sm:text-[14px] shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            {downloadPdfMutation.isPending ? (
              <>
                <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <IconMapper name="download" className="text-[16px] sm:hidden" />
                <span>
                  <span className="hidden sm:inline">Finish & </span>Download
                </span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Editor Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {isMobile ? (
          /* Mobile View (single active view: Form OR Preview) */
          <div className="flex-1 flex flex-col overflow-hidden">
            {showMobilePreview ? (
              <section className="flex-1 bg-[#fcf9f5] relative overflow-hidden flex flex-col items-center justify-between">
                {renderPreviewContent()}
              </section>
            ) : (
              <section className="flex-1 flex flex-col bg-white overflow-hidden">
                {renderFormContent()}
              </section>
            )}
          </div>
        ) : (
          /* Desktop View (Draggable Resizable Split-Pane with localStorage persistence) */
          <div className="flex-1 flex overflow-hidden">
            <ResizablePanelGroup
              orientation="horizontal"
              {...layoutProps}
              className="h-full w-full"
            >
              {/* Left Form Panel */}
              <ResizablePanel
                id="form-panel"
                defaultSize="45%"
                minSize="30%"
                maxSize="70%"
                className="flex flex-col bg-white relative z-10 overflow-hidden"
              >
                {renderFormContent()}
              </ResizablePanel>

              {/* Draggable Divider Handle */}
              <ResizableHandle withHandle />

              {/* Right Preview Panel */}
              <ResizablePanel
                id="preview-panel"
                defaultSize="55%"
                minSize="30%"
                maxSize="70%"
                className="bg-[#fcf9f5] relative overflow-hidden flex flex-col items-center justify-between"
              >
                {renderPreviewContent()}
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        )}
      </div>

      {/* Unsaved Changes Confirmation Dialog */}
      <LeaveEditorDialog
        isOpen={isLeaveDialogOpen}
        isSaving={isLeaveSaving}
        onSaveAndLeave={handleSaveAndLeave}
        onDiscardAndLeave={handleDiscardAndLeave}
        onClose={() => setIsLeaveDialogOpen(false)}
      />
    </div>
  );
}
