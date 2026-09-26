import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, SlidersHorizontal, X, ArrowUpDown, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { SEOHead } from '../components/SEOHead';
import { AffiliateNotice } from '../components/AffiliateNotice';
import { MATERIALS, CATEGORIES } from '@vietcraft/shared';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract query params from URL
  const materialParam = searchParams.get('material') || '';
  const categoryParam = searchParams.get('category') || '';
  const sortParam = searchParams.get('sort') || 'featured';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // TanStack Query for Dynamic Materials
  const { data: materialsData = [] } = useQuery({
    queryKey: ['materials-list'],
    queryFn: api.getMaterials
  });

  // TanStack Query for Dynamic Categories
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories-list'],
    queryFn: api.getCategories
  });

  const materials = materialsData && materialsData.length > 0 ? materialsData : (MATERIALS as any);
  const categories = categoriesData && categoriesData.length > 0 ? categoriesData : (CATEGORIES as any);

  // TanStack Query for Products
  const { data, isLoading } = useQuery({
    queryKey: ['products', materialParam, categoryParam, sortParam, minPriceParam, maxPriceParam, pageParam],
    queryFn: () =>
      api.getProducts({
        material: materialParam || undefined,
        category: categoryParam || undefined,
        sort: sortParam,
        minPrice: minPriceParam ? Number(minPriceParam) : undefined,
        maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
        page: pageParam,
        limit: 12
      })
  });

  const products = data?.products || [];
  const meta = data?.meta || { page: 1, totalPages: 1, total: 0 };

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // Reset to page 1 on filter changes
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = !!(materialParam || categoryParam || minPriceParam || maxPriceParam);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 space-y-8">
      <SEOHead
        title="Curated Natural Home Decor & Artisan Discoveries | VietCraft"
        description="Browse handcrafted Vietnamese home decor, lighting, ceramics, baskets, and furniture. Curated for US customers and discovered via Amazon."
        canonicalUrl="https://vietcraft.com/products"
      />

      {/* Header & Page Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-lotus-sand/40 pb-6 gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs text-lotus-charcoal/60 mb-2">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span className="text-lotus-forest font-semibold">Products</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-lotus-forest">
            Curated Natural Home Decor
          </h1>
          <p className="text-xs sm:text-sm text-lotus-charcoal/70 mt-1.5 font-light">
            Artisan-inspired pieces selected for organic warmth, sustainable materials, and mindful living.
          </p>
        </div>

        {/* Sort selector & Mobile filter toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden px-4 py-2.5 rounded-xl border border-lotus-sand/60 bg-white text-xs font-medium text-lotus-forest flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters {hasActiveFilters && '•'}</span>
          </button>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-lotus-sand/60 text-xs text-lotus-charcoal">
            <ArrowUpDown className="w-3.5 h-3.5 text-lotus-clay" />
            <label htmlFor="sort-select" className="sr-only">Sort products</label>
            <select
              id="sort-select"
              value={sortParam}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-transparent text-xs font-medium text-lotus-forest focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured Curations</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* FTC Disclaimer Notice */}
      <AffiliateNotice compact />

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-medium text-lotus-charcoal/60">Active Filters:</span>
          {materialParam && (
            <button
              onClick={() => updateParam('material', '')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lotus-sand/30 text-xs font-medium text-lotus-forest hover:bg-lotus-sand/50"
            >
              <span>Material: {materialParam}</span>
              <X className="w-3 h-3" />
            </button>
          )}
          {categoryParam && (
            <button
              onClick={() => updateParam('category', '')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lotus-sand/30 text-xs font-medium text-lotus-forest hover:bg-lotus-sand/50"
            >
              <span>Category: {categoryParam}</span>
              <X className="w-3 h-3" />
            </button>
          )}
          {(minPriceParam || maxPriceParam) && (
            <button
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete('minPrice');
                next.delete('maxPrice');
                setSearchParams(next);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lotus-sand/30 text-xs font-medium text-lotus-forest hover:bg-lotus-sand/50"
            >
              <span>Price: ${minPriceParam || 0} - ${maxPriceParam || 'Any'}</span>
              <X className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs font-semibold text-lotus-clay hover:underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Catalog Layout with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside
          className={`lg:col-span-3 bg-white p-6 rounded-2xl border border-lotus-sand/50 shadow-sm space-y-6 ${
            mobileFilterOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between border-b border-lotus-sand/30 pb-3">
            <span className="font-serif text-lg font-bold text-lotus-forest flex items-center gap-2">
              <Filter className="w-4 h-4 text-lotus-clay" /> Filter Collection
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-lotus-clay hover:underline font-medium"
              >
                Reset
              </button>
            )}
          </div>

          {/* Filter 1: Craft Materials */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-lotus-forest/80 mb-3">
              Craft Materials
            </h4>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => updateParam('material', '')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  !materialParam
                    ? 'bg-lotus-forest text-white font-medium'
                    : 'text-lotus-charcoal/80 hover:bg-lotus-ivory'
                }`}
              >
                <span>All Materials</span>
              </button>
              {materials.map((mat: any) => (
                <button
                  key={mat.slug}
                  type="button"
                  onClick={() => updateParam('material', mat.slug)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    materialParam === mat.slug
                      ? 'bg-lotus-forest text-white font-medium'
                      : 'text-lotus-charcoal/80 hover:bg-lotus-ivory'
                  }`}
                >
                  <span>{mat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter 2: Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-lotus-forest/80 mb-3">
              Room Categories
            </h4>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => updateParam('category', '')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  !categoryParam
                    ? 'bg-lotus-forest text-white font-medium'
                    : 'text-lotus-charcoal/80 hover:bg-lotus-ivory'
                }`}
              >
                <span>All Categories</span>
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => updateParam('category', cat.slug)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    categoryParam === cat.slug
                      ? 'bg-lotus-forest text-white font-medium'
                      : 'text-lotus-charcoal/80 hover:bg-lotus-ivory'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter 3: Price Ranges */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-lotus-forest/80 mb-3">
              Price Range
            </h4>
            <div className="space-y-1.5">
              {[
                { label: 'All Prices', min: '', max: '' },
                { label: 'Under $50', min: '0', max: '50' },
                { label: '$50 to $100', min: '50', max: '100' },
                { label: '$100 to $150', min: '100', max: '150' },
                { label: '$150 and above', min: '150', max: '' }
              ].map((tier, idx) => {
                const isSelected = minPriceParam === tier.min && maxPriceParam === tier.max;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      if (tier.min) next.set('minPrice', tier.min);
                      else next.delete('minPrice');
                      if (tier.max) next.set('maxPrice', tier.max);
                      else next.delete('maxPrice');
                      next.set('page', '1');
                      setSearchParams(next);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? 'bg-lotus-forest text-white font-medium'
                        : 'text-lotus-charcoal/80 hover:bg-lotus-ivory'
                    }`}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-9 space-y-8">
          {isLoading ? (
            <div className="py-24 text-center text-lotus-charcoal/60 bg-white rounded-2xl border border-lotus-sand/30">
              Loading curated home decor...
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t border-lotus-sand/30">
                  <button
                    type="button"
                    onClick={() => updateParam('page', String(Math.max(1, pageParam - 1)))}
                    disabled={pageParam <= 1}
                    className="p-2 rounded-xl border border-lotus-sand/50 bg-white text-lotus-charcoal disabled:opacity-40 hover:bg-lotus-sand/20"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-medium text-lotus-charcoal/70 px-3">
                    Page {meta.page} of {meta.totalPages} ({meta.total} products)
                  </span>
                  <button
                    type="button"
                    onClick={() => updateParam('page', String(Math.min(meta.totalPages, pageParam + 1)))}
                    disabled={pageParam >= meta.totalPages}
                    className="p-2 rounded-xl border border-lotus-sand/50 bg-white text-lotus-charcoal disabled:opacity-40 hover:bg-lotus-sand/20"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center bg-white rounded-2xl border border-lotus-sand/40 p-8 space-y-4">
              <h3 className="font-serif text-2xl font-bold text-lotus-forest">No Products Match Your Criteria</h3>
              <p className="text-sm text-lotus-charcoal/70 max-w-md mx-auto">
                Try widening your price range or clearing material filters to view all handcrafted home objects.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-6 py-2.5 rounded-xl bg-lotus-clay text-white text-xs font-medium hover:bg-lotus-clay-light transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
