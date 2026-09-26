import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Package, BookOpen, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { ArticleCard } from '../components/ArticleCard';
import { SEOHead } from '../components/SEOHead';
import { MATERIALS } from '@vietcraft/shared';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const typeParam = (searchParams.get('type') || 'all') as 'all' | 'articles' | 'products';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [inputVal, setInputVal] = useState(queryParam);

  useEffect(() => {
    setInputVal(queryParam);
  }, [queryParam]);

  const { data, isLoading } = useQuery({
    queryKey: ['search', queryParam, typeParam, pageParam],
    queryFn: () =>
      api.search({
        q: queryParam,
        type: typeParam,
        page: pageParam,
        limit: 12
      })
  });

  const { data: materialsData = [] } = useQuery({
    queryKey: ['materials-list'],
    queryFn: api.getMaterials
  });

  const materials = materialsData && materialsData.length > 0 ? materialsData : (MATERIALS as any);

  const results = data?.results || { articles: [], products: [], totalArticles: 0, totalProducts: 0 };
  const meta = data?.meta || { page: 1, totalPages: 1, total: 0 };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (inputVal.trim()) {
      next.set('q', inputVal.trim());
    } else {
      next.delete('q');
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const setTypeTab = (type: 'all' | 'articles' | 'products') => {
    const next = new URLSearchParams(searchParams);
    next.set('type', type);
    next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 space-y-10">
      <SEOHead
        title={`Search Results for "${queryParam || 'Decor'}" | VietCraft`}
        description="Search Vietnamese handcrafted home decor, materials, and journal articles on VietCraft."
      />

      {/* Search Header Form */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-lotus-forest">
          {queryParam ? `Search Results for "${queryParam}"` : 'Search VietCraft'}
        </h1>

        <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-md rounded-2xl bg-white border border-lotus-sand/60 overflow-hidden">
          <Search className="w-5 h-5 text-lotus-charcoal/40 ml-4 flex-shrink-0" />
          <input
            type="search"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search products, materials (rattan, ceramics), articles..."
            className="w-full px-4 py-4 text-sm text-lotus-charcoal placeholder-lotus-charcoal/40 focus:outline-none"
          />
          {inputVal && (
            <button
              type="button"
              onClick={() => {
                setInputVal('');
                const next = new URLSearchParams(searchParams);
                next.delete('q');
                setSearchParams(next);
              }}
              className="p-2 text-lotus-charcoal/40 hover:text-lotus-charcoal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-4 bg-lotus-forest hover:bg-lotus-forest-dark text-white text-xs font-semibold uppercase tracking-wider transition-colors flex-shrink-0"
          >
            Search
          </button>
        </form>

        {/* Quick Material Keywords */}
        <div className="flex flex-wrap justify-center gap-2 pt-1 text-xs">
          <span className="text-lotus-charcoal/60 self-center">Popular tags:</span>
          {materials.map((m: any) => (
            <button
              key={m.slug}
              type="button"
              onClick={() => {
                setInputVal(m.name);
                const next = new URLSearchParams(searchParams);
                next.set('q', m.name);
                next.set('page', '1');
                setSearchParams(next);
              }}
              className="px-3 py-1 rounded-full bg-lotus-sand/20 hover:bg-lotus-sand/40 text-lotus-forest font-medium transition-colors"
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 border-b border-lotus-sand/40 pb-4">
        <button
          type="button"
          onClick={() => setTypeTab('all')}
          className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
            typeParam === 'all'
              ? 'bg-lotus-forest text-white shadow-sm'
              : 'bg-white text-lotus-charcoal/70 border border-lotus-sand/40 hover:bg-lotus-ivory'
          }`}
        >
          All Results ({results.totalArticles + results.totalProducts})
        </button>
        <button
          type="button"
          onClick={() => setTypeTab('products')}
          className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            typeParam === 'products'
              ? 'bg-lotus-forest text-white shadow-sm'
              : 'bg-white text-lotus-charcoal/70 border border-lotus-sand/40 hover:bg-lotus-ivory'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Products ({results.totalProducts})</span>
        </button>
        <button
          type="button"
          onClick={() => setTypeTab('articles')}
          className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            typeParam === 'articles'
              ? 'bg-lotus-forest text-white shadow-sm'
              : 'bg-white text-lotus-charcoal/70 border border-lotus-sand/40 hover:bg-lotus-ivory'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Articles ({results.totalArticles})</span>
        </button>
      </div>

      {/* Results Section */}
      {isLoading ? (
        <div className="py-24 text-center text-lotus-charcoal/60 bg-white rounded-3xl border border-lotus-sand/30">
          Searching handcrafted collections...
        </div>
      ) : meta.total === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-lotus-sand/40 p-8 max-w-lg mx-auto space-y-3">
          <p className="font-serif text-2xl font-bold text-lotus-forest">No Results Found</p>
          <p className="text-xs sm:text-sm text-lotus-charcoal/70 leading-relaxed font-light">
            We couldn't find any decor or articles matching "{queryParam}". Try checking for spelling or searching for broad terms like "bamboo", "vase", or "lamp".
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-block px-5 py-2.5 rounded-xl bg-lotus-clay text-white text-xs font-medium hover:bg-lotus-clay-light transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-14">
          {/* Products matching */}
          {(typeParam === 'all' || typeParam === 'products') && results.products.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-lotus-sand/30 pb-3">
                <h2 className="font-serif text-2xl font-bold text-lotus-forest flex items-center gap-2">
                  <Package className="w-5 h-5 text-lotus-clay" />
                  <span>Curated Products ({results.totalProducts})</span>
                </h2>
                {typeParam === 'all' && results.totalProducts > results.products.length && (
                  <button
                    onClick={() => setTypeTab('products')}
                    className="text-xs font-semibold text-lotus-clay hover:underline"
                  >
                    View all {results.totalProducts} products →
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {results.products.map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>
            </div>
          )}

          {/* Articles matching */}
          {(typeParam === 'all' || typeParam === 'articles') && results.articles.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-lotus-sand/30 pb-3">
                <h2 className="font-serif text-2xl font-bold text-lotus-forest flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-lotus-clay" />
                  <span>Journal Articles ({results.totalArticles})</span>
                </h2>
                {typeParam === 'all' && results.totalArticles > results.articles.length && (
                  <button
                    onClick={() => setTypeTab('articles')}
                    className="text-xs font-semibold text-lotus-clay hover:underline"
                  >
                    View all {results.totalArticles} articles →
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {results.articles.map((art) => (
                  <ArticleCard key={art._id} article={art} />
                ))}
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8 border-t border-lotus-sand/30">
              <button
                type="button"
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set('page', String(Math.max(1, pageParam - 1)));
                  setSearchParams(next);
                }}
                disabled={pageParam <= 1}
                className="p-2 rounded-xl border border-lotus-sand/50 bg-white text-lotus-charcoal disabled:opacity-40 hover:bg-lotus-sand/20"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-lotus-charcoal/70 px-3">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                type="button"
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set('page', String(Math.min(meta.totalPages, pageParam + 1)));
                  setSearchParams(next);
                }}
                disabled={pageParam >= meta.totalPages}
                className="p-2 rounded-xl border border-lotus-sand/50 bg-white text-lotus-charcoal disabled:opacity-40 hover:bg-lotus-sand/20"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
