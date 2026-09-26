import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, X, Loader2, ArrowRight, BookOpen, Package } from 'lucide-react';
import { api } from '../services/api';
import { Post, Product } from '@vietcraft/shared';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, placeholder }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setArticles([]);
      setProducts([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setArticles([]);
      setProducts([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { results } = await api.search({ q: query, limit: 4 });
        setArticles(results.articles || []);
        setProducts(results.products || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard shortcut listener for Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-lotus-forest/60 backdrop-blur-sm transition-opacity animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-lotus-ivory border border-lotus-sand rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="relative flex items-center border-b border-lotus-sand/60 px-4 py-3 bg-white">
          <Search className="w-5 h-5 text-lotus-forest/60 mr-3" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder || 'Search natural decor, materials (rattan, ceramics), articles...'}
            className="w-full bg-transparent text-lotus-charcoal placeholder-lotus-charcoal/40 text-base focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-lotus-clay animate-spin mr-2" />}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-1 rounded-full text-lotus-charcoal/50 hover:text-lotus-charcoal hover:bg-lotus-sand/30"
          >
            <X className="w-5 h-5" />
          </button>
        </form>

        {/* Quick Results Panel */}
        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-6">
          {!query.trim() ? (
            <div className="py-8 text-center text-lotus-charcoal/60">
              <p className="font-serif text-lg text-lotus-forest mb-2">Popular Searches</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {['Rattan Lighting', 'Bát Tràng Ceramics', 'Hạ Thái Lacquer', 'Storage Baskets', 'Teak Wood', 'Silk Throws'].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1 rounded-full bg-lotus-sand/20 text-xs font-medium text-lotus-forest hover:bg-lotus-sand/40 transition-colors"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Products preview */}
              {products.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs font-semibold uppercase tracking-wider text-lotus-forest/70">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      Curated Products ({products.length})
                    </span>
                    <Link
                      to={`/search?q=${encodeURIComponent(query)}&type=products`}
                      onClick={onClose}
                      className="text-lotus-clay hover:underline flex items-center"
                    >
                      View all <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {products.map((product) => (
                      <Link
                        key={product._id}
                        to={`/products/${product.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white border border-lotus-sand/40 hover:border-lotus-clay transition-all group"
                      >
                        <img
                          src={product.images[0]?.url}
                          alt={product.images[0]?.alt || product.title}
                          className="w-14 h-14 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-lotus-charcoal group-hover:text-lotus-clay truncate">
                            {product.title}
                          </p>
                          <p className="text-xs text-lotus-charcoal/60 mt-0.5">
                            ${product.price.toFixed(2)} USD
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Articles preview */}
              {articles.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs font-semibold uppercase tracking-wider text-lotus-forest/70">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      Journal Articles ({articles.length})
                    </span>
                    <Link
                      to={`/search?q=${encodeURIComponent(query)}&type=articles`}
                      onClick={onClose}
                      className="text-lotus-clay hover:underline flex items-center"
                    >
                      View all <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {articles.map((article) => (
                      <Link
                        key={article._id}
                        to={`/articles/${article.slug}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-3 rounded-lg bg-white border border-lotus-sand/40 hover:border-lotus-clay transition-all group"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-sm font-medium text-lotus-forest group-hover:text-lotus-clay truncate">
                            {article.title}
                          </p>
                          <p className="text-xs text-lotus-charcoal/60 line-clamp-1 mt-0.5">
                            {article.excerpt}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-lotus-charcoal/30 group-hover:text-lotus-clay flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {!loading && products.length === 0 && articles.length === 0 && (
                <div className="py-8 text-center text-lotus-charcoal/60">
                  <p className="text-base font-serif text-lotus-forest">No exact matches found for "{query}"</p>
                  <p className="text-xs mt-1 text-lotus-charcoal/50">
                    Try searching for materials like "bamboo", "lacquer", "ceramics", or view all products.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-lotus-sand/20 border-t border-lotus-sand/40 flex items-center justify-between text-xs text-lotus-charcoal/60">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-lotus-sand/60 font-mono text-[10px]">Enter</kbd> to view full results</span>
          <Link
            to={`/search?q=${encodeURIComponent(query)}`}
            onClick={onClose}
            className="text-lotus-forest font-medium hover:underline flex items-center"
          >
            See full results <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};
