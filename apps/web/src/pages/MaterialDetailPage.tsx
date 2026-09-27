import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Sparkles, Hammer, BookOpen, Package } from 'lucide-react';
import { api } from '../services/api';
import { SEOHead } from '../components/SEOHead';
import { ProductCard } from '../components/ProductCard';
import { ArticleCard } from '../components/ArticleCard';
import { AffiliateNotice } from '../components/AffiliateNotice';

export const MaterialDetailPage: React.FC = () => {
  const { materialSlug } = useParams<{ materialSlug: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['material', materialSlug],
    queryFn: () => api.getMaterialBySlug(materialSlug || ''),
    enabled: !!materialSlug
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-lotus-charcoal/60">
        Loading material craft story...
      </div>
    );
  }

  if (error || !data?.material) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="font-serif text-3xl font-bold text-lotus-forest">Material Not Found</h1>
        <p className="text-sm text-lotus-charcoal/70">We could not find the requested material category.</p>
        <Link
          to="/discover"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lotus-forest text-white text-sm font-medium hover:bg-lotus-forest-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover</span>
        </Link>
      </div>
    );
  }

  const { material, articles, products } = data;

  return (
    <div className="space-y-16 pb-24">
      <SEOHead
        title={`${material.name} - Craft Heritage & Curated Home Decor | VietCraft`}
        description={material.shortDescription}
        ogImage={material.coverImage}
        canonicalUrl={`${window.location.origin}/discover/${material.slug}`}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${material.name} Home Decor`,
          description: material.shortDescription,
          url: `${window.location.origin}/discover/${material.slug}`
        }}
      />

      {/* Hero Header with Background Cover */}
      <section className="relative bg-lotus-forest text-lotus-ivory py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img
            src={material.coverImage}
            alt={material.name}
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-lotus-forest via-lotus-forest/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-lotus-sand mb-6">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link to="/discover" className="hover:underline">Discover</Link>
            <span>/</span>
            <span className="text-white font-medium">{material.name}</span>
          </nav>

          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-widest text-lotus-sand">
              <Sparkles className="w-3.5 h-3.5 text-lotus-clay" />
              <span>Natural Craft Medium</span>
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {material.name}
            </h1>
            <p className="text-lg sm:text-xl text-lotus-ivory/90 leading-relaxed font-light">
              {material.shortDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Main Narrative & Craft Breakdown */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Detailed Narrative */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-lotus-forest border-b border-lotus-sand/30 pb-3">
              Cultural & Sustainable Legacy
            </h2>
            <div className="prose prose-lg text-lotus-charcoal/80 leading-relaxed font-light">
              <p>{material.description}</p>
            </div>

            {/* Origin Villages */}
            {material.originRegions && material.originRegions.length > 0 && (
              <div className="p-6 rounded-2xl bg-lotus-sand/20 border border-lotus-sand/40 space-y-3">
                <div className="flex items-center gap-2 font-serif text-base font-bold text-lotus-forest">
                  <MapPin className="w-4 h-4 text-lotus-clay" />
                  <span>Ancestral Craft Guilds & Centers</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {material.originRegions.map((region, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-lg bg-white border border-lotus-sand/60 text-xs font-medium text-lotus-forest shadow-xs"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Crafting Techniques Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-lotus-sand/50 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-serif text-lg font-bold text-lotus-forest">
                <Hammer className="w-4 h-4 text-lotus-clay" />
                <span>Artisanal Techniques</span>
              </div>
              <p className="text-xs text-lotus-charcoal/70 leading-relaxed">
                Methods practiced by hand across generations without industrial shortcuts:
              </p>
              <ul className="space-y-2">
                {(material.craftingTechniques || []).map((tech, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-lotus-charcoal/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-lotus-clay mt-1.5 flex-shrink-0" />
                    <span>{tech}</span>
                  </li>
                ))}
              </ul>
            </div>

            <AffiliateNotice />
          </div>
        </div>
      </section>

      {/* Curated Products for this Material */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-lotus-sand/30 pb-4 mb-8">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-lotus-clay" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-lotus-forest">
              Curated {material.name} Decor
            </h2>
          </div>
          <Link
            to={`/products?material=${material.slug}`}
            className="text-xs sm:text-sm font-semibold text-lotus-clay hover:underline"
          >
            View all {material.name} products →
          </Link>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-lotus-charcoal/60 bg-white rounded-2xl border border-lotus-sand/30">
            No products currently cataloged under this material. Check back soon!
          </div>
        )}
      </section>

      {/* Related Journal Articles for this Material */}
      {articles && articles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between border-b border-lotus-sand/30 pb-4 mb-8">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-lotus-clay" />
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-lotus-forest">
                Journal & Craft Stories
              </h2>
            </div>
            <Link to="/search?type=articles" className="text-xs sm:text-sm font-semibold text-lotus-clay hover:underline">
              Browse all articles →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((art) => (
              <ArticleCard key={art._id} article={art} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
