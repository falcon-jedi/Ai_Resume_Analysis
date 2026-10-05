'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Hero } from '../../_components/template/hero';
import { SearchFilter } from '../../_components/template/search-filter';
import { TemplateGrid } from '../../_components/template/template-grid';
import { WhyChoose } from '../../_components/template/why-choose';
import { CtaSection } from '../../_components/template/cta-section';
import { PreviewModal } from '../../_components/template/preview-modal';
import type { TemplateData } from '../../_components/template/template-card';
import { getSessionClient } from '@/app/api/client/auth/auth-client';

export default function TemplatesClient() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canAccessPremium, setCanAccessPremium] = useState(false);

  useEffect(() => {
    async function init() {
      // Load templates from API (sourced from local metadata.json files)
      try {
        const res = await fetch('/api/template');
        const data = await res.json();
        if (data.success && data.data?.templates?.length > 0) {
          setTemplates(data.data.templates);
          if (data.data.categories?.length > 0) setCategories(data.data.categories);
        } else {
          setLoadError(true);
        }
      } catch {
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
      // Check subscription for template access
      try {
        const res = await fetch('/api/subscription/status');
        const data = await res.json();
        if (data.success) {
          const access = data.subscription?.templateAccess ?? 'FREE';
          setCanAccessPremium(access === 'ALL');
        }
      } catch {
        // Not logged in — free access only
      }
    }
    init();
  }, []);

  // Filter templates based on search & category selection
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      (selectedCategory === 'ATS Friendly' && t.atsFriendly) ||
      t.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = async (id: string) => {
    const tpl = templates.find((t) => t.id === id);
    // If premium and user doesn't have access, redirect to pricing
    if (tpl?.isPremium && !canAccessPremium) {
      router.push('/app/pricing');
      return;
    }
    const session = await getSessionClient();
    if (session?.user) {
      router.push(`/app/resume/new?template=${encodeURIComponent(id)}`);
    } else {
      router.push(
        `/app/login?redirect=${encodeURIComponent('/app/resume/new')}&template=${encodeURIComponent(id)}`,
      );
    }
  };

  const handlePreview = (id: string) => {
    const tpl = templates.find((t) => t.id === id) || null;
    setPreviewTemplate(tpl);
    setIsModalOpen(true);
  };

  const handleStartBuilding = async () => {
    const session = await getSessionClient();
    if (session?.user) {
      router.push('/app/resume/new');
    } else {
      router.push(`/app/login?redirect=${encodeURIComponent('/app/resume/new')}`);
    }
  };

  const handleBrowsePlans = () => {
    router.push('/app/pricing');
  };

  return (
    <div className="min-h-screen text-[#2b1611] bg-[#FFF8EE]">
      {/* Dynamic Keyframe Animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-scale-up {
          animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `,
        }}
      />

      {/* Main Content Sections */}
      <div className="pb-16 space-y-4">
        <Hero />

        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-[#d97b45] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : loadError ? (
          <div className="text-center py-24 text-[#9a6a4a]">
            <p className="text-lg font-medium">Could not load templates.</p>
            <p className="text-sm mt-1">Please refresh the page or try again later.</p>
          </div>
        ) : (
          <TemplateGrid
            templates={filteredTemplates}
            canAccessPremium={canAccessPremium}
            onUseTemplate={handleUseTemplate}
            onPreview={handlePreview}
          />
        )}

        <WhyChoose />

        <CtaSection onStartBuilding={handleStartBuilding} onBrowsePlans={handleBrowsePlans} />
      </div>

      {/* Template Preview Modal */}
      <PreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template={previewTemplate}
        canAccessPremium={canAccessPremium}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
}
