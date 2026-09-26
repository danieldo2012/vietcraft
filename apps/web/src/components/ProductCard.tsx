import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Sparkles } from 'lucide-react';
import { Product } from '@vietcraft/shared';
import { api } from '../services/api';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tracking, setTracking] = useState(false);

  const materialName =
    typeof product.material === 'object' && product.material !== null
      ? (product.material as any).name
      : 'Natural Craft';

  const materialSlug =
    typeof product.material === 'object' && product.material !== null
      ? (product.material as any).slug
      : '';

  const primaryImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80';
  const secondaryImage = product.images?.[1]?.url || primaryImage;

  const handleAffiliateClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setTracking(true);
      const res = await api.trackAffiliateClick(product._id);
      window.open(res.affiliateUrl || product.affiliateUrl, '_blank', 'noopener,noreferrer,sponsored');
    } catch (err) {
      window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer,sponsored');
    } finally {
      setTracking(false);
    }
  };

  return (
    <div
      className="group bg-white rounded-2xl border border-lotus-sand/40 hover:border-lotus-sand overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        {/* Product Image Area */}
        <Link to={`/products/${product.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-lotus-sand/20">
          <img
            src={isHovered ? secondaryImage : primaryImage}
            alt={product.images?.[0]?.alt || product.title}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />

          {/* Material Badge */}
          {materialSlug ? (
            <Link
              to={`/discover/${materialSlug}`}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-lotus-ivory/90 backdrop-blur-sm border border-lotus-sand/60 text-[11px] font-medium text-lotus-forest hover:bg-lotus-forest hover:text-white transition-colors"
            >
              {materialName}
            </Link>
          ) : (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-lotus-ivory/90 backdrop-blur-sm border border-lotus-sand/60 text-[11px] font-medium text-lotus-forest">
              {materialName}
            </span>
          )}

          {/* Featured Ribbon */}
          {product.featured && (
            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-lotus-clay text-white text-[10px] font-medium tracking-wider uppercase flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}
        </Link>

        {/* Content Details */}
        <div className="p-5">
          <Link to={`/products/${product.slug}`}>
            <h3 className="font-serif text-lg font-bold text-lotus-charcoal group-hover:text-lotus-forest line-clamp-1 transition-colors">
              {product.title}
            </h3>
          </Link>

          <p className="text-xs text-lotus-charcoal/70 line-clamp-2 mt-1.5 leading-relaxed">
            {product.shortDescription}
          </p>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-lotus-charcoal/50 block font-light">Amazon Price</span>
              <span className="text-base font-semibold text-lotus-forest">
                ${product.price.toFixed(2)} <span className="text-xs font-normal text-lotus-charcoal/60">USD</span>
              </span>
            </div>
            <span className="text-[10px] text-lotus-charcoal/40 font-mono">
              ASIN: {product.asin}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer & Outbound Action */}
      <div className="px-5 pb-5 pt-1 border-t border-lotus-sand/20 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleAffiliateClick}
          disabled={tracking}
          className="w-full py-2.5 px-4 rounded-xl bg-lotus-forest hover:bg-lotus-forest-dark text-white text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-1.5 shadow-sm"
          title="View product on Amazon.com (affiliate link)"
        >
          <span>{tracking ? 'Connecting...' : 'View on Amazon'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        <p className="text-[10px] text-center text-lotus-charcoal/45 leading-tight">
          As an Amazon Associate, we earn from qualifying purchases. Price accurate as of display.
        </p>
      </div>
    </div>
  );
};
