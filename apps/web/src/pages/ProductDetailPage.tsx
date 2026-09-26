import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ExternalLink,
  ArrowLeft,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  Info,
  Clock,
  Ruler
} from 'lucide-react';
import { api } from '../services/api';
import { SEOHead } from '../components/SEOHead';
import { ProductCard } from '../components/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [tracking, setTracking] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.getProductBySlug(slug || ''),
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-lotus-charcoal/60">
        Loading product details...
      </div>
    );
  }

  if (error || !data?.product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="font-serif text-3xl font-bold text-lotus-forest">Product Not Found</h1>
        <p className="text-sm text-lotus-charcoal/70">The product you are looking for might have been retired.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lotus-forest text-white text-sm font-medium hover:bg-lotus-forest-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  const { product, relatedProducts } = data;
  const materialObj = typeof product.material === 'object' ? (product.material as any) : null;
  const categoryObj = typeof product.category === 'object' ? (product.category as any) : null;

  const currentImage = product.images?.[selectedImageIdx]?.url || product.images?.[0]?.url;

  const handleAffiliateClick = async () => {
    try {
      setTracking(true);
      const res = await api.trackAffiliateClick(product._id);
      window.open(res.affiliateUrl || product.affiliateUrl, '_blank', 'noopener,noreferrer,sponsored');
    } catch {
      window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer,sponsored');
    } finally {
      setTracking(false);
    }
  };

  const lastCheckedDate = product.lastChecked
    ? new Date(product.lastChecked).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recent';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 space-y-16">
      <SEOHead
        title={`${product.title} | VietCraft`}
        description={product.shortDescription}
        ogImage={currentImage}
        canonicalUrl={`https://vietcraft.com/products/${product.slug}`}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.title,
          description: product.shortDescription,
          image: product.images.map((i) => i.url),
          sku: product.asin,
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: product.currency || 'USD',
            availability: 'https://schema.org/InStock',
            url: `https://vietcraft.com/products/${product.slug}`
          }
        }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-lotus-charcoal/60">
        <Link to="/" className="hover:underline">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:underline">Products</Link>
        <span>/</span>
        {materialObj && (
          <>
            <Link to={`/discover/${materialObj.slug}`} className="hover:underline">
              {materialObj.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-lotus-forest font-medium truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Gallery Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Display Image */}
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-lotus-sand/50 shadow-md">
            <img
              src={currentImage}
              alt={product.images?.[selectedImageIdx]?.alt || product.title}
              className="w-full h-full object-cover object-center"
            />
            {product.featured && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-lotus-clay text-white text-xs font-medium tracking-wider uppercase shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Curated Pick
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImageIdx === idx
                      ? 'border-lotus-clay shadow-md'
                      : 'border-lotus-sand/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {materialObj && (
                <Link
                  to={`/discover/${materialObj.slug}`}
                  className="px-3 py-1 rounded-full bg-lotus-sand/30 text-xs font-semibold text-lotus-forest hover:bg-lotus-sand/50 transition-colors"
                >
                  {materialObj.name}
                </Link>
              )}
              {categoryObj && (
                <Link
                  to={`/products?category=${categoryObj.slug}`}
                  className="px-3 py-1 rounded-full bg-lotus-ivory text-xs font-semibold text-lotus-charcoal/70 border border-lotus-sand/50 hover:bg-white"
                >
                  {categoryObj.name}
                </Link>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-lotus-forest leading-tight">
              {product.title}
            </h1>

            <p className="text-sm text-lotus-charcoal/70 font-light leading-relaxed">
              {product.shortDescription}
            </p>
          </div>

          {/* Pricing Box & Amazon Attribution */}
          <div className="p-6 rounded-2xl bg-white border border-lotus-sand/50 shadow-sm space-y-4">
            <div className="flex items-baseline justify-between border-b border-lotus-sand/30 pb-4">
              <div>
                <span className="text-xs text-lotus-charcoal/50 block font-light">Amazon Price</span>
                <span className="text-3xl font-bold text-lotus-forest">
                  ${product.price.toFixed(2)}{' '}
                  <span className="text-sm font-normal text-lotus-charcoal/60">USD</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-lotus-charcoal/50 block">Amazon ASIN</span>
                <span className="text-xs font-mono font-bold text-lotus-charcoal bg-lotus-sand/20 px-2 py-0.5 rounded">
                  {product.asin}
                </span>
              </div>
            </div>

            {/* Outbound Affiliate CTA */}
            <button
              type="button"
              onClick={handleAffiliateClick}
              disabled={tracking}
              className="w-full py-4 px-6 rounded-xl bg-lotus-clay hover:bg-lotus-clay-light text-white font-medium text-base transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
            >
              <span>{tracking ? 'Redirecting to Amazon...' : 'View & Buy on Amazon'}</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            {/* FTC Timestamp Disclaimer */}
            <div className="flex items-start gap-2 pt-1 text-[11px] text-lotus-charcoal/60 leading-tight">
              <Clock className="w-3.5 h-3.5 text-lotus-clay flex-shrink-0 mt-0.5" />
              <span>
                Price checked {lastCheckedDate}. Product prices and availability are accurate as of the date/time indicated
                and are subject to change. Any price and availability information displayed on Amazon.com at the time of purchase
                will govern the sale.
              </span>
            </div>
          </div>

          {/* Dimensions & Specifications */}
          {product.dimensions && (
            <div className="p-5 rounded-2xl bg-lotus-sand/15 border border-lotus-sand/40 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lotus-forest">
                <Ruler className="w-4 h-4 text-lotus-clay" />
                <span>Dimensions & Sizing</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {product.dimensions.height && (
                  <div className="bg-white p-2 rounded-lg border border-lotus-sand/40">
                    <span className="text-[10px] text-lotus-charcoal/50 block">Height</span>
                    <span className="font-semibold text-lotus-forest">
                      {product.dimensions.height} {product.dimensions.unit || 'in'}
                    </span>
                  </div>
                )}
                {product.dimensions.width && (
                  <div className="bg-white p-2 rounded-lg border border-lotus-sand/40">
                    <span className="text-[10px] text-lotus-charcoal/50 block">Width</span>
                    <span className="font-semibold text-lotus-forest">
                      {product.dimensions.width} {product.dimensions.unit || 'in'}
                    </span>
                  </div>
                )}
                {product.dimensions.depth && (
                  <div className="bg-white p-2 rounded-lg border border-lotus-sand/40">
                    <span className="text-[10px] text-lotus-charcoal/50 block">Depth</span>
                    <span className="font-semibold text-lotus-forest">
                      {product.dimensions.depth} {product.dimensions.unit || 'in'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="space-y-2 text-xs text-lotus-charcoal/70 pt-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-lotus-forest" />
              <span>Fulfilled securely and shipped directly via Amazon US</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-lotus-forest" />
              <span>Amazon Prime eligible shipping available on qualifying orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Description Section */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-lotus-sand/50 shadow-sm space-y-6">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-lotus-forest border-b border-lotus-sand/30 pb-4">
          Artisanal Craft & Design Story
        </h2>
        <div className="prose prose-lg max-w-none text-lotus-charcoal/80 leading-relaxed font-light space-y-4">
          <p>{product.description}</p>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="pt-4 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-md bg-lotus-ivory text-xs font-medium text-lotus-forest border border-lotus-sand/40"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="space-y-8">
          <div className="border-b border-lotus-sand/30 pb-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-lotus-forest">
              Complementary Handcrafted Decor
            </h2>
            <p className="text-xs sm:text-sm text-lotus-charcoal/60 mt-1">
              Curated objects sharing natural materials or design harmony.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
