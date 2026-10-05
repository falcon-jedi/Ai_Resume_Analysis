'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';
import { PreviewModal } from '@/app/app/_components/template/preview-modal';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateResume } from '@/app/app/_hooks/use-resumes';
import { useTemplates } from '@/app/app/_hooks/use-templates';
import { useUserProfile } from '@/app/app/_hooks/use-user-profile';
import { useSubscriptionStatus } from '@/app/app/_hooks/use-subscription';
import { getResumeClient, type Template } from '@/app/api/client/resume/resume-client';
import { Skeleton } from '@/app/app/_components/common/skeleton';
import { Pagination } from '@/app/app/_components/ui/pagination';
import { cn } from '@/app/app/_util/cn';
import { SkillCategory, LanguageProficiency } from '@/app/api/model/enums/resume';

export default function NewResumeClient() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);
  const TEMPLATES_PER_PAGE = 8;
  const [showImportPrompt, setShowImportPrompt] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const nibRef = useRef<HTMLSpanElement>(null);
  const templateSectionRef = useRef<HTMLElement>(null);

  const { data: templatesData, isLoading } = useTemplates();
  const { data: userProfile } = useUserProfile();
  const { data: subData } = useSubscriptionStatus();
  const createMutation = useCreateResume();

  const categories: string[] = templatesData?.categories ?? ['All'];
  const hasProfile = !!userProfile?.profileResumeId;
  // ponytail: subscription may still be loading; default false until resolved
  const canAccessPremium = subData?.subscription?.templateAccess === 'ALL';

  // Dynamic search + category filter
  const filtered = useMemo(() => {
    const templates = templatesData?.templates ?? [];
    return templates.filter((t) => {
      const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
      const matchesSearch =
        !search.trim() ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [templatesData?.templates, activeCategory, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / TEMPLATES_PER_PAGE));
  const validPage = Math.min(Math.max(1, page), totalPages);

  const paginatedTemplates = useMemo(() => {
    return filtered.slice((validPage - 1) * TEMPLATES_PER_PAGE, validPage * TEMPLATES_PER_PAGE);
  }, [filtered, validPage]);

  // Reset to page 1 on filter or search change
  useEffect(() => {
    setPage(1);
  }, [search, activeCategory]);

  // Clamp page if out of bounds when list changes
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    templateSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Resumes are unlimited for all plans; but premium templates need a paid plan
  const selectedTemplateData = templatesData?.templates.find((t) => t.id === selectedTemplate);
  const selectedIsLocked = !!selectedTemplateData?.isPremium && !canAccessPremium;
  const canCreate = title.trim().length > 0 && !!selectedTemplate && !selectedIsLocked;

  /** Called when user clicks "Create Resume" in the sticky footer */
  const handleCreate = () => {
    if (!canCreate) return;
    // If the user has a saved profile, show the import prompt
    if (hasProfile) {
      setShowImportPrompt(true);
    } else {
      createBlank();
    }
  };

  /** Create resume without importing any profile data */
  const createBlank = async () => {
    setIsCreating(true);
    try {
      const resume = await createMutation.mutateAsync({
        title: title.trim(),
        templateId: selectedTemplate!,
      });
      router.push(`/app/resume/${resume.id}`);
    } catch (err) {
      console.error('Failed to create resume:', err);
      setIsCreating(false);
    }
  };

  /**
   * Create resume then SNAPSHOT-COPY all sections from the profile resume.
   * The two resumes are fully independent after this — editing one never
   * touches the other (each section row belongs to its own resumeId).
   */
  const createWithProfileImport = async () => {
    if (!userProfile?.profileResumeId) return createBlank();
    setIsCreating(true);
    try {
      // 1. Create blank resume
      const resume = await createMutation.mutateAsync({
        title: title.trim(),
        templateId: selectedTemplate!,
      });

      // 2. Fetch full profile resume (all sections)
      const profileData = await getResumeClient(userProfile.profileResumeId);

      // 3. Build a clean payload — strip DB fields, keep only DTO-compatible fields
      const importPayload = {
        personalInfo: profileData.personalInfo
          ? {
              fullName: profileData.personalInfo.fullName ?? '',
              jobTitle: profileData.personalInfo.jobTitle ?? '',
              email: profileData.personalInfo.email ?? '',
              phone: profileData.personalInfo.phone ?? '',
              location: profileData.personalInfo.location ?? '',
              website: profileData.personalInfo.website ?? '',
              linkedin: profileData.personalInfo.linkedin ?? '',
              github: profileData.personalInfo.github ?? '',
              summary: profileData.personalInfo.summary ?? '',
            }
          : undefined,
        experiences:
          profileData.experiences?.map((e, i) => ({
            company: e.company,
            position: e.position,
            location: e.location ?? '',
            startDate: e.startDate,
            endDate: e.endDate ?? '',
            currentlyWorking: e.currentlyWorking ?? false,
            description: e.description ?? '',
            highlights: e.highlights ?? [],
            order: i,
          })) ?? [],
        education:
          profileData.education?.map((e, i) => ({
            institution: e.institution,
            degree: e.degree,
            fieldOfStudy: e.fieldOfStudy ?? '',
            startDate: e.startDate,
            endDate: e.endDate ?? '',
            result: e.result ?? '',
            order: i,
          })) ?? [],
        projects:
          profileData.projects?.map((p, i) => ({
            title: p.title,
            field: p.field ?? '',
            startDate: p.startDate ?? '',
            endDate: p.endDate ?? '',
            description: p.description ?? '',
            technologies: p.technologies ?? [],
            link: p.link ?? '',
            order: i,
          })) ?? [],
        skills:
          profileData.skills?.map((s, i) => ({
            name: s.name,
            category: s.category as SkillCategory,
            order: i,
          })) ?? [],
        certifications:
          profileData.certifications?.map((c, i) => ({
            name: c.name,
            issuer: c.issuer ?? '',
            date: c.date ?? '',
            url: c.url ?? '',
            order: i,
          })) ?? [],
        achievements:
          profileData.achievements?.map((a, i) => ({
            title: a.title,
            date: a.date ?? '',
            description: a.description ?? '',
            order: i,
          })) ?? [],
        languages:
          profileData.languages?.map((l, i) => ({
            name: l.name,
            proficiency: l.proficiency as LanguageProficiency,
            order: i,
          })) ?? [],
        references:
          profileData.references?.map((r, i) => ({
            name: r.name,
            designation: r.designation ?? '',
            company: r.company ?? '',
            email: r.email ?? '',
            phone: r.phone ?? '',
            order: i,
          })) ?? [],
      };

      // 4. PATCH all sections into the new resume (existing transactional endpoint)
      const { updateResumeClient } = await import('@/app/api/client/resume/resume-client');
      await updateResumeClient(resume.id, importPayload);

      router.push(`/app/resume/${resume.id}`);
    } catch (err) {
      console.error('Failed to import profile data:', err);
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 relative z-10 max-w-7xl mx-auto w-full pb-44">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 lg:mb-10 gap-4">
        <div>
          <h1 className="font-['Playfair_Display'] text-[24px] sm:text-[32px] md:text-[40px] font-bold text-[#5b060c] leading-tight mb-1.5">
            Create Resume
          </h1>
          <p className="font-['Hanken_Grotesk'] text-[14px] sm:text-[16px] text-[#564240]">
            Choose a professional template and start building your resume.
          </p>
        </div>

        {/* Plan Badge Card
        <div
          className="flex items-center gap-3 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl border border-[#E5D9C8] shrink-0 self-start sm:self-auto"
          style={{
            background: '#FFF8EE',
            boxShadow: '0 10px 30px -10px rgba(78,52,46,0.08)',
          }}
        >
          {subData?.subscription?.plan === 'FREE' && (
            <button
              onClick={() => router.push('/app/pricing')}
              className="text-[#795900] text-[12px] font-semibold hover:underline cursor-pointer ml-1.5"
              style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
            >
              Upgrade
            </button>
          )}
        </div> */}
      </header>

      {/* ── Resume Title ─────────────────────────────────────────────────── */}
      <section className="mb-8 sm:mb-12">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <IconMapper
              name="edit_note"
              ref={nibRef}
              className="text-[#5b060c] transition-all duration-300 text-[18px] sm:text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            />
            <h2 className="font-['Hanken_Grotesk'] text-[12px] sm:text-[13px] uppercase tracking-widest font-semibold text-[#564240]">
              Resume Title
            </h2>
          </div>

          {/* Paper-style input shell */}
          <div
            className="p-1 rounded-lg"
            style={{
              background: '#FFF8EE',
              border: '1px solid #E5D9C8',
              boxShadow: '0 10px 30px -10px rgba(78,52,46,0.08)',
            }}
          >
            <input
              id="resume-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => {
                if (nibRef.current) {
                  nibRef.current.style.transform = 'scale(1.2)';
                  nibRef.current.style.color = '#795900';
                }
              }}
              onBlur={() => {
                if (nibRef.current) {
                  nibRef.current.style.transform = 'scale(1)';
                  nibRef.current.style.color = '#5b060c';
                }
              }}
              className="w-full bg-transparent border-none outline-none ring-0 px-4 sm:px-6 py-2.5 sm:py-3.5 font-['Playfair_Display'] text-[18px] sm:text-[22px] md:text-[24px] font-semibold text-[#5b060c] placeholder:text-[#8a716f]/60"
              placeholder="e.g. Senior Product Designer"
            />
          </div>
        </div>
      </section>

      {/* ── Template Section ─────────────────────────────────────────────── */}
      <section ref={templateSectionRef}>
        {/* Section header + search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="font-['Playfair_Display'] text-[20px] sm:text-[26px] md:text-[32px] font-bold text-[#5b060c] mb-1 leading-tight">
              Choose a Template
            </h2>
            <p className="font-['Hanken_Grotesk'] text-[13px] sm:text-[15px] text-[#564240]">
              Select a resume template to begin editing. You can change your template later.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80 shrink-0">
            <IconMapper
              name="search"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a716f]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-12 pr-4 py-2.5 sm:py-3 border border-[#ddc0bd] rounded-full transition-all outline-none focus:border-[#5b060c] focus:ring-1 focus:ring-[#5b060c]/20 bg-[#fff0ed] font-['Hanken_Grotesk'] text-[14px] leading-[20px] text-[#2b1611] placeholder:text-[#8a716f]/60 shadow-xs"
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="flex overflow-x-auto md:flex-wrap gap-2 mb-8 pb-1 md:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 sm:px-5 py-2 rounded-full text-[13px] sm:text-[14px] font-semibold whitespace-nowrap transition-colors cursor-pointer',
                activeCategory === cat
                  ? 'bg-[#5b060c] text-white'
                  : 'text-[#564240] hover:bg-[#ddc0bd]/30',
              )}
              style={{
                fontFamily: 'Hanken Grotesk, sans-serif',
                background: activeCategory === cat ? '#5b060c' : '#ffe2db',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-20 border border-dashed border-[#ddc0bd] rounded-xl">
            <IconMapper name="search_off" className="text-4xl text-[#564240]/40 block mb-2" />
            <p
              className="text-[#564240] text-sm"
              style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
            >
              No templates match your search.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {paginatedTemplates.map((t) => {
                const isSelected = selectedTemplate === t.id;
                return (
                  <div key={t.id} className="group relative">
                    {/* Card shell */}
                    <div
                      onClick={() => {
                        if (t.isPremium && !canAccessPremium) {
                          router.push('/app/subscription');
                          return;
                        }
                        setSelectedTemplate((prev) => (prev === t.id ? null : t.id));
                      }}
                      className={cn(
                        'aspect-[3/4] rounded-lg overflow-hidden relative transition-all duration-300',
                        t.isPremium && !canAccessPremium ? 'cursor-not-allowed' : 'cursor-pointer',
                        isSelected
                          ? 'border-[#5b060c]'
                          : 'border-[#E5D9C8] hover:border-[#5b060c]/40',
                      )}
                      style={{
                        background: '#FFF8EE',
                        border: isSelected ? '2px solid #5b060c' : '1px solid #E5D9C8',
                        boxShadow: isSelected
                          ? '0 0 0 4px rgba(91,6,12,0.05), 0 10px 30px -10px rgba(78,52,46,0.12)'
                          : '0 10px 30px -10px rgba(78,52,46,0.08)',
                      }}
                    >
                      {/* Lock overlay for premium templates on free plan */}
                      {t.isPremium && !canAccessPremium && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 pointer-events-none">
                          <IconMapper name="lock" className="text-2xl text-[#5b060c]" />
                        </div>
                      )}

                      {/* Selected primary overlay tint */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#5b060c]/5 pointer-events-none z-10" />
                      )}

                      {/* Template preview image */}
                      <div
                        className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{
                          backgroundImage: `url('${t.previewImage}')`,
                          backgroundSize: 'cover',
                        }}
                      />

                      {/* Fallback pattern if no image */}
                      {!t.previewImage && (
                        <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8EE] to-[#ffe2db] flex flex-col items-center justify-center p-4 text-center">
                          <IconMapper
                            name="description"
                            className="text-4xl text-[#564240]/40 mb-2"
                          />
                          <span
                            className="text-[10px] font-semibold text-[#564240]/60 uppercase tracking-widest"
                            style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
                          >
                            {t.category}
                          </span>
                        </div>
                      )}

                      {/* Selected checkmark */}
                      <div
                        className={cn(
                          'absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-20 w-7 h-7 sm:w-8 sm:h-8 bg-[#5b060c] rounded-full flex items-center justify-center shadow-lg transition-all duration-300',
                          isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-75',
                        )}
                      >
                        <IconMapper
                          name="check"
                          className="text-white text-xs sm:text-sm"
                          style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}
                        />
                      </div>

                      {/* ATS badge */}
                      {t.atsFriendly && (
                        <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-20">
                          <span
                            className="px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white"
                            style={{
                              background: '#2d6a4f',
                              fontFamily: 'Hanken Grotesk, sans-serif',
                            }}
                          >
                            ATS
                          </span>
                        </div>
                      )}

                      {/* Bottom-right: Preview eye icon & Premium badge */}
                      <div className="absolute bottom-2.5 sm:bottom-3 right-2.5 sm:right-3 z-40 flex items-center gap-1.5">
                        {/* Preview eye button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewTemplate(t);
                          }}
                          className="group/eye relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-white text-[#564240] hover:text-[#5b060c] shadow-md border border-[#E5D9C8] flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                          title="Preview"
                          aria-label={`Preview ${t.name} template`}
                        >
                          <IconMapper name="visibility" className="text-[16px] sm:text-[18px]" />
                          {/* Hover tooltip */}
                          <span className="pointer-events-none absolute -top-8 right-0 opacity-0 group-hover/eye:opacity-100 transition-opacity duration-150 bg-[#2b1611] text-[#FFF8EE] text-[10px] font-medium py-1 px-2 rounded shadow-lg whitespace-nowrap z-30">
                            Preview
                          </span>
                        </button>

                        {/* Premium badge */}
                        {t.isPremium && (
                          <span
                            className="px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter text-white shadow-sm"
                            style={{
                              background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                              fontFamily: 'Hanken Grotesk, sans-serif',
                            }}
                          >
                            PRO
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card info */}
                    <div className="mt-2.5 sm:mt-3">
                      <h3
                        className={cn(
                          'text-[13px] sm:text-[14px] font-semibold leading-[18px] sm:leading-[20px] tracking-[0.05em] transition-colors truncate',
                          isSelected ? 'text-[#5b060c]' : 'text-[#2b1611]',
                        )}
                        style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
                      >
                        {t.name}
                      </h3>
                      <p
                        className="text-[11px] sm:text-[12px] text-[#564240] mt-0.5 truncate"
                        style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
                      >
                        {t.category}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Pagination & Template Counter */}
            <div className="mt-8 pt-6 pb-6 border-t border-[#ddc0bd]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p
                className="text-[13px] text-[#564240] font-medium"
                style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
              >
                Showing{' '}
                <span className="font-semibold text-[#5b060c]">
                  {filtered.length === 0 ? 0 : (validPage - 1) * TEMPLATES_PER_PAGE + 1}–
                  {Math.min(validPage * TEMPLATES_PER_PAGE, filtered.length)}
                </span>{' '}
                of <span className="font-semibold text-[#5b060c]">{filtered.length}</span> templates
              </p>

              <Pagination
                currentPage={validPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                hideOnSinglePage={false}
              />
            </div>
          </>
        )}
      </section>

      {/* ── Sticky Footer Action Bar (only shown when a template is selected) ── */}
      {selectedTemplate && (
        <footer className="fixed bottom-0 left-0 md:left-20 lg:left-56 right-0 z-50 border-t border-[#ddc0bd] px-4 sm:px-8 lg:px-12 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/95 backdrop-blur-md shadow-2xl animate-fade-in">
          {/* Hint */}
          <div className="flex items-center gap-3">
            <IconMapper
              name="auto_fix"
              className="text-[#795900] text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            />
            <p
              className="text-[12px] text-[#564240]"
              style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
            >
              <span className="font-bold text-[#795900]">AI Assistant Ready:</span>{' '}
              {selectedTemplateData
                ? `Template "${selectedTemplateData.name}" selected.`
                : 'Selected template is ready to use.'}{' '}
              {hasProfile && 'Profile detected — you can auto-fill this resume.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSelectedTemplate(null)}
              className="px-6 py-2.5 rounded-lg border border-[#8a716f] text-[#564240] font-semibold text-[14px] hover:bg-[#fff0ed] transition-colors cursor-pointer"
              style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
            >
              Cancel
            </button>

            <button
              onClick={handleCreate}
              disabled={!canCreate || isCreating}
              className={cn(
                'flex items-center gap-2 px-8 py-2.5 rounded-lg font-semibold text-[14px] transition-all shadow-lg cursor-pointer',
                canCreate && !isCreating
                  ? 'bg-[#5b060c] text-white hover:opacity-95 active:scale-[0.98]'
                  : 'bg-[#5b060c]/40 text-white/60 cursor-not-allowed',
              )}
              style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
            >
              {isCreating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>Create Resume</span>
                  <IconMapper name="arrow_forward" className="text-[18px]" />
                </>
              )}
            </button>
          </div>
        </footer>
      )}

      {/* ── Import from Profile Modal ─────────────────────────────────────────── */}
      {showImportPrompt && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          style={{ background: 'rgba(43,22,17,0.55)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl"
            style={{ background: '#FFF8EE', border: '1px solid #E5D9C8' }}
          >
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#5b060c]/5 rounded-bl-full pointer-events-none" />

            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-[#fff0ed] border-2 border-[#ddc0bd] flex items-center justify-center mb-5">
              <IconMapper
                name="download_for_offline"
                className="text-[#5b060c] text-[28px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              />
            </div>

            <h2
              className="text-[22px] font-bold text-[#5b060c] mb-2"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Import from Profile?
            </h2>
            <p
              className="text-[14px] text-[#564240] mb-6 leading-relaxed"
              style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
            >
              Your saved career profile will be copied into this resume — all sections (experience,
              education, skills, etc.). You can edit them freely without affecting your profile.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowImportPrompt(false);
                  createWithProfileImport();
                }}
                disabled={isCreating}
                className="flex-1 flex items-center justify-center gap-2 bg-[#5b060c] text-white px-5 py-3 rounded-lg font-semibold text-[14px] hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
              >
                <IconMapper
                  name="download_for_offline"
                  className="text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                />
                Yes, Auto-fill
              </button>
              <button
                onClick={() => {
                  setShowImportPrompt(false);
                  createBlank();
                }}
                disabled={isCreating}
                className="flex-1 px-5 py-3 rounded-lg border border-[#8a716f] text-[#564240] font-semibold text-[14px] hover:bg-[#fff0ed] transition-all cursor-pointer disabled:opacity-50"
                style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
              >
                Start Blank
              </button>
            </div>

            <button
              onClick={() => setShowImportPrompt(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#ffe2db] transition-colors text-[#564240] cursor-pointer"
              aria-label="Close"
            >
              <IconMapper name="close" className="text-base" />
            </button>
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      <PreviewModal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        template={previewTemplate}
        canAccessPremium={canAccessPremium}
        onUseTemplate={(id) => {
          const tpl = templatesData?.templates.find((item) => item.id === id);
          if (tpl?.isPremium && !canAccessPremium) {
            router.push('/app/subscription');
            return;
          }
          setSelectedTemplate(id);
          setPreviewTemplate(null);
        }}
      />

      {/* Decorative paper clip */}
      <div className="fixed top-24 right-12 z-[3] pointer-events-none opacity-40">
        <IconMapper
          name="attach_file"
          className="text-[#8a716f]"
          style={{ fontSize: 48, transform: 'rotate(45deg)', display: 'block' }}
        />
      </div>
    </div>
  );
}
