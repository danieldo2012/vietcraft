import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Calendar, ArrowLeft, Share2, Sparkles, BookOpen, Package } from 'lucide-react';
import { api } from '../services/api';
import { SEOHead } from '../components/SEOHead';
import { ProductCard } from '../components/ProductCard';
import { ArticleCard } from '../components/ArticleCard';
import { AffiliateNotice } from '../components/AffiliateNotice';

export const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => api.getArticleBySlug(slug || ''),
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-lotus-charcoal/60">
        Loading article...
      </div>
    );
  }

  if (error || !data?.post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="font-serif text-3xl font-bold text-lotus-forest">Article Not Found</h1>
        <p className="text-sm text-lotus-charcoal/70">The journal article you requested could not be located.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lotus-forest text-white text-sm font-medium hover:bg-lotus-forest-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    );
  }

  const { post, relatedArticles } = data;
  const materialObj = typeof post.material === 'object' ? (post.material as any) : null;

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  return (
    <article className="pb-24 space-y-16">
      <SEOHead
        title={`${post.title} | VietCraft Journal`}
        description={post.excerpt}
        ogImage={post.featuredImage}
        canonicalUrl={`https://vietcraft.com/articles/${post.slug}`}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.excerpt,
          image: [post.featuredImage],
          datePublished: post.publishedAt,
          author: {
            '@type': 'Person',
            name: post.author?.name || 'VietCraft'
          }
        }}
      />

      {/* Article Header Container */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6 text-center">
        {/* Breadcrumb & Material Tag */}
        <div className="flex items-center justify-center gap-2">
          {materialObj ? (
            <Link
              to={`/discover/${materialObj.slug}`}
              className="px-3.5 py-1 rounded-full bg-lotus-sand/30 text-xs font-semibold text-lotus-forest hover:bg-lotus-sand/50 transition-colors uppercase tracking-wider"
            >
              {materialObj.name}
            </Link>
          ) : (
            <span className="px-3.5 py-1 rounded-full bg-lotus-sand/30 text-xs font-semibold text-lotus-forest uppercase tracking-wider">
              Artisan Journal
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-lotus-forest leading-tight">
          {post.title}
        </h1>

        {/* Excerpt Lead */}
        <p className="text-lg sm:text-xl text-lotus-charcoal/80 leading-relaxed font-light max-w-2xl mx-auto">
          {post.excerpt}
        </p>

        {/* Author Meta Line */}
        <div className="flex items-center justify-center gap-4 text-xs text-lotus-charcoal/60 pt-2">
          <div className="flex items-center gap-2">
            {post.author?.avatar && (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-7 h-7 rounded-full object-cover border border-lotus-sand"
              />
            )}
            <span className="font-medium text-lotus-forest">{post.author?.name || 'VietCraft Team'}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-lotus-clay" />
            <span>{formattedDate}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-lotus-clay" />
            <span>{post.readingTime || 5} min read</span>
          </div>
        </div>
      </header>

      {/* Featured Cover Image */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-xl border border-lotus-sand/50">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>

      {/* Article Body Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="prose prose-lg sm:prose-xl max-w-none text-lotus-charcoal/85 leading-relaxed font-light space-y-6
            prose-headings:font-serif prose-headings:text-lotus-forest prose-headings:font-bold
            prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4
            prose-blockquote:border-l-4 prose-blockquote:border-lotus-clay prose-blockquote:italic prose-blockquote:text-lotus-forest
            prose-blockquote:bg-lotus-sand/15 prose-blockquote:p-4 prose-blockquote:rounded-r-xl
            prose-a:text-lotus-clay prose-a:underline hover:prose-a:text-lotus-clay-dark"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Affiliate Disclosure in Post */}
        <div className="my-10">
          <AffiliateNotice compact />
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-8 border-t border-lotus-sand/30 flex flex-wrap gap-2">
            <span className="text-xs text-lotus-charcoal/50 mr-2 self-center">Filed under:</span>
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/search?q=${encodeURIComponent(tag)}&type=articles`}
                className="px-3 py-1 rounded-full bg-lotus-sand/20 text-xs font-medium text-lotus-forest hover:bg-lotus-sand/40 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Author Bio Card */}
        {post.author && (
          <div className="mt-12 p-6 rounded-2xl bg-white border border-lotus-sand/50 flex items-center gap-5 shadow-xs">
            {post.author.avatar && (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-lotus-sand/60 flex-shrink-0"
              />
            )}
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-lotus-clay">
                Written By
              </span>
              <h4 className="font-serif text-lg font-bold text-lotus-forest">{post.author.name}</h4>
              <p className="text-xs text-lotus-charcoal/70 mt-1 font-light leading-relaxed">
                {post.author.bio || 'Curator and writer exploring sustainable Vietnamese craft traditions.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Related Handcrafted Products */}
      {post.relatedProducts && post.relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex items-center gap-2 border-b border-lotus-sand/30 pb-4 mb-8">
            <Package className="w-5 h-5 text-lotus-clay" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-lotus-forest">
              Featured Decor in this Story
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {post.relatedProducts.map((prod: any) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* More Journal Articles */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-center gap-2 border-b border-lotus-sand/30 pb-4 mb-8">
            <BookOpen className="w-5 h-5 text-lotus-clay" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-lotus-forest">
              More Slow Living Reads
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((art: any) => (
              <ArticleCard key={art._id} article={art} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
