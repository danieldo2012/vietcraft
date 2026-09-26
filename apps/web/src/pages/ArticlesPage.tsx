import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Filter, ChevronLeft, ChevronRight, BookOpen, Clock, Tag } from 'lucide-react';
import { api } from '../services/api';
import { ArticleCard } from '../components/ArticleCard';
import { SEOHead } from '../components/SEOHead';
import { Post, Material } from '@vietcraft/shared';

export const ArticlesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const materialParam = searchParams.get('material') || '';
  const tagParam = searchParams.get('tag') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Fetch materials for filter tabs
  const { data: materialsData = [] } = useQuery<Material[]>({
    queryKey: ['materials-list'],
    queryFn: api.getMaterials
  });

  // Fetch articles from backend API
  const { data, isLoading } = useQuery({
    queryKey: ['articles', materialParam, tagParam, pageParam],
    queryFn: () =>
      api.getArticles({
        material: materialParam || undefined,
        tag: tagParam || undefined,
        page: pageParam,
        limit: 9
      })
  });

  const articles: Post[] = data?.articles || [];
  const meta = data?.meta || { page: 1, totalPages: 1, total: 0 };

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 space-y-10">
      <SEOHead
        title="Artisan Journal & Craft Lore | VietCraft"
        description="Essays and guides on ancient Vietnamese craft traditions, sustainable living, bamboo smoking, Red River pottery, and slow interiors."
        canonicalUrl="https://vietcraft.com/articles"
      />

      {/* Header section */}
      <header className="border-b border-lotus-sand/40 pb-8 text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lotus-sand/30 text-xs font-semibold uppercase tracking-widest text-lotus-forest">
          <BookOpen className="w-3.5 h-3.5 text-lotus-clay" />
          <span>The VietCraft Journal</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-lotus-forest leading-tight">
          Artisanal Heritage & Slow Living
        </h1>
        <p className="text-sm sm:text-base text-lotus-charcoal/75 font-light leading-relaxed">
          Stories, village histories, and design perspectives dedicated to Vietnamese craftsmanship, natural materials, and mindful homes.
        </p>
      </header>

      {/* Material Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <button
          type="button"
          onClick={() => updateParam('material', '')}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
            !materialParam
              ? 'bg-lotus-forest text-white shadow-sm'
              : 'bg-white border border-lotus-sand/60 text-lotus-charcoal hover:bg-lotus-ivory'
          }`}
        >
          All Stories
        </button>
        {materialsData.map((mat) => (
          <button
            key={mat.slug}
            type="button"
            onClick={() => updateParam('material', mat.slug)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              materialParam === mat.slug
                ? 'bg-lotus-forest text-white shadow-sm'
                : 'bg-white border border-lotus-sand/60 text-lotus-charcoal hover:bg-lotus-ivory'
            }`}
          >
            {mat.name}
          </button>
        ))}
      </div>

      {/* Active Filter Indicator */}
      {(materialParam || tagParam) && (
        <div className="flex items-center justify-center gap-2 text-xs text-lotus-charcoal/70">
          <span>Filtering by:</span>
          {materialParam && (
            <span className="font-semibold text-lotus-forest bg-lotus-sand/30 px-2.5 py-0.5 rounded-full">
              Material: {materialParam}
            </span>
          )}
          {tagParam && (
            <span className="font-semibold text-lotus-forest bg-lotus-sand/30 px-2.5 py-0.5 rounded-full">
              Tag: #{tagParam}
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-lotus-clay font-medium hover:underline ml-2"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Articles Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-lotus-charcoal/60 space-y-2">
          <div className="animate-spin w-8 h-8 border-2 border-lotus-forest border-t-transparent rounded-full mx-auto" />
          <p className="text-sm font-medium">Loading stories from the guild...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="py-20 text-center space-y-4 max-w-md mx-auto">
          <BookOpen className="w-12 h-12 text-lotus-sand mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-lotus-forest">No Articles Found</h3>
          <p className="text-sm text-lotus-charcoal/70">
            No essays match your current filter. Explore our other material categories or reset your selection.
          </p>
          <button
            onClick={clearFilters}
            className="px-5 py-2 rounded-xl bg-lotus-forest text-white text-xs font-semibold uppercase tracking-wider hover:bg-lotus-forest/90 transition-colors"
          >
            View All Articles
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-8 border-t border-lotus-sand/30">
          <button
            disabled={meta.page <= 1}
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.set('page', String(meta.page - 1));
              setSearchParams(next);
            }}
            className="p-2.5 rounded-xl border border-lotus-sand/60 bg-white text-lotus-forest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-lotus-ivory transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs text-lotus-charcoal/70 font-medium">
            Page {meta.page} of {meta.totalPages}
          </span>

          <button
            disabled={meta.page >= meta.totalPages}
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.set('page', String(meta.page + 1));
              setSearchParams(next);
            }}
            className="p-2.5 rounded-xl border border-lotus-sand/60 bg-white text-lotus-forest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-lotus-ivory transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
