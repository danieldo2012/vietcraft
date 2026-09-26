import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { SEOHead } from '../components/SEOHead';
import { Page } from '@vietcraft/shared';
import { Loader2, FileQuestion } from 'lucide-react';
import { motion } from 'framer-motion';

interface GenericPageProps {
  forcedSlug?: string;
  defaultTitle?: string;
  children?: React.ReactNode;
}

export const GenericPage: React.FC<GenericPageProps> = ({ forcedSlug, defaultTitle, children }) => {
  const params = useParams<{ slug?: string }>();
  const location = useLocation();

  // Determine slug: prop forcedSlug or route param or current path without leading slash
  const slug = forcedSlug || params.slug || location.pathname.replace(/^\//, '');

  const { data: page, isLoading, isError } = useQuery<Page>({
    queryKey: ['cms-page', slug],
    queryFn: () => api.getPageBySlug(slug),
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-12 text-lotus-charcoal/60">
        <Loader2 className="w-8 h-8 animate-spin text-lotus-forest mb-3" />
        <span className="text-sm font-medium">Loading content...</span>
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <FileQuestion className="w-12 h-12 text-lotus-clay mx-auto" />
        <h1 className="font-serif text-3xl font-bold text-lotus-forest">Page Not Found</h1>
        <p className="text-lotus-charcoal/70 max-w-md mx-auto text-sm">
          The requested content page is currently unavailable or being drafted by our editorial team.
        </p>
      </div>
    );
  }

  // Basic markdown parser for headings, lists, bold, italics, quotes
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];

    const flushList = (key: number) => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`ul-${key}`} className="space-y-2 my-4 list-disc list-inside text-lotus-charcoal/80">
            {currentList.map((item, i) => (
              <li key={i} className="leading-relaxed">
                <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    const formatInline = (text: string) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-lotus-forest">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 bg-lotus-sand/30 rounded text-xs font-mono">$1</code>');
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        currentList.push(trimmed.substring(2));
        return;
      }

      flushList(index);

      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="font-serif text-xl sm:text-2xl font-bold text-lotus-forest mt-8 mb-3">
            {trimmed.substring(4)}
          </h3>
        );
      } else if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="font-serif text-2xl sm:text-3xl font-bold text-lotus-forest mt-10 mb-4 border-b border-lotus-sand/30 pb-2">
            {trimmed.substring(3)}
          </h2>
        );
      } else if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="font-serif text-3xl sm:text-4xl font-bold text-lotus-forest mt-6 mb-4">
            {trimmed.substring(2)}
          </h1>
        );
      } else if (trimmed.startsWith('> ')) {
        elements.push(
          <blockquote
            key={index}
            className="my-6 p-4 rounded-xl bg-lotus-sand/20 border-l-4 border-lotus-clay font-serif italic text-lotus-forest text-base leading-relaxed"
          >
            {trimmed.substring(2)}
          </blockquote>
        );
      } else if (trimmed.length > 0) {
        elements.push(
          <p
            key={index}
            className="text-base text-lotus-charcoal/85 leading-relaxed my-3 font-light"
            dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
          />
        );
      }
    });

    flushList(lines.length);
    return elements;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-8"
    >
      <SEOHead
        title={page.seoTitle || `${page.title} | VietCraft`}
        description={page.seoDescription || page.title}
        ogImage={page.ogImage || page.featuredImage}
      />

      <header className="space-y-4 border-b border-lotus-sand/40 pb-8 text-center max-w-2xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-widest text-lotus-clay">
          VietCraft Editorial
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-lotus-forest leading-tight">
          {page.title || defaultTitle}
        </h1>
        {page.publishedAt && (
          <p className="text-xs text-lotus-charcoal/50">
            Published on {new Date(page.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </header>

      {page.featuredImage && (
        <div className="rounded-2xl overflow-hidden shadow-lg border border-lotus-sand/50 max-h-96 aspect-[16/9]">
          <img
            src={page.featuredImage}
            alt={page.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="article-body">
        {renderFormattedContent(page.content)}
      </div>

      {children && (
        <div className="pt-8 border-t border-lotus-sand/30">
          {children}
        </div>
      )}
    </motion.div>
  );
};
