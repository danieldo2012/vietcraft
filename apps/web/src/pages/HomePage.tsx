import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Compass, ShieldCheck, Leaf, HeartHandshake } from 'lucide-react';
import { api } from '../services/api';
import { HeroCarousel } from '../components/HeroCarousel';
import { MaterialGrid } from '../components/MaterialGrid';
import { ProductCard } from '../components/ProductCard';
import { SEOHead } from '../components/SEOHead';
import { AffiliateNotice } from '../components/AffiliateNotice';
import { MATERIALS } from '@vietcraft/shared';

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 }
  }
};

export const HomePage: React.FC = () => {
  const { data: homepage } = useQuery({
    queryKey: ['homepage'],
    queryFn: api.getHomepage
  });

  const { data: materialsData } = useQuery({
    queryKey: ['materials'],
    queryFn: api.getMaterials
  });

  const materials = materialsData && materialsData.length > 0 ? materialsData : (MATERIALS as any);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-20 pb-16"
    >
      <SEOHead
        title="VietCraft | Natural Home Decor & Handcrafted Living"
        description="Discover natural beauty, thoughtful living, and timeless home decor inspired by Vietnamese craftsmanship. Rattan, ceramics, lacquer, wood, and wild silk."
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'VietCraft',
          url: 'https://vietcraft.com',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://vietcraft.com/search?q={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        }}
      />

      {/* Section 1: Hero Carousel (CMS Managed) */}
      <section>
        <HeroCarousel slides={homepage?.heroSlides} />
      </section>

      {/* Trust & Craft Value Pillars */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-md border border-lotus-sand/40">
          <div className="flex items-center gap-3.5 p-2">
            <div className="w-10 h-10 rounded-xl bg-lotus-sand/30 flex items-center justify-center text-lotus-forest flex-shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-lotus-forest">100% Natural Materials</h4>
              <p className="text-xs text-lotus-charcoal/60">Renewable rattan, clay & wood</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 p-2">
            <div className="w-10 h-10 rounded-xl bg-lotus-sand/30 flex items-center justify-center text-lotus-forest flex-shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-lotus-forest">Artisan Guild Heritage</h4>
              <p className="text-xs text-lotus-charcoal/60">Century-old craft communities</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 p-2">
            <div className="w-10 h-10 rounded-xl bg-lotus-sand/30 flex items-center justify-center text-lotus-forest flex-shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-lotus-forest">Curated Discovery</h4>
              <p className="text-xs text-lotus-charcoal/60">Verified Amazon affiliate finds</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 p-2">
            <div className="w-10 h-10 rounded-xl bg-lotus-sand/30 flex items-center justify-center text-lotus-forest flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-lotus-forest">FTC Transparent</h4>
              <p className="text-xs text-lotus-charcoal/60">Zero fake ratings or claims</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 2: Discover by Material (CMS Managed) */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-lotus-clay mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ancestral Materials</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-lotus-forest">
              {homepage?.materialSection?.headline || 'Discover by Material'}
            </h2>
            <p className="text-sm sm:text-base text-lotus-charcoal/70 mt-3 font-light leading-relaxed">
              {homepage?.materialSection?.subheadline ||
                'Each raw fiber and natural medium holds generations of sustainable cultural heritage.'}
            </p>
          </div>
          <Link
            to="/discover"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-medium text-lotus-clay hover:text-lotus-clay/80 group"
          >
            <span>Explore all materials & lore</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <MaterialGrid materials={materials} />
      </motion.section>

      {/* Section 3: Featured Products (CMS Managed) */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-lotus-clay mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Collection</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-lotus-forest">
              Featured Home Decor
            </h2>
            <p className="text-sm sm:text-base text-lotus-charcoal/70 mt-3 font-light leading-relaxed">
              Thoughtfully selected home accents available on Amazon, vetted for craftsmanship, organic materials,
              and aesthetic harmony.
            </p>
          </div>
          <Link
            to="/products"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-medium text-lotus-clay hover:text-lotus-clay/80 group"
          >
            <span>View all products ({homepage?.featuredProductIds?.length || 14}+)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Affiliate Disclosure Notice */}
        <div className="mb-8">
          <AffiliateNotice compact />
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {homepage?.featuredProductIds && homepage.featuredProductIds.length > 0 ? (
            homepage.featuredProductIds.slice(0, 8).map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <div className="col-span-4 py-12 text-center text-lotus-charcoal/60">
              Loading featured products...
            </div>
          )}
        </div>
      </motion.section>

      {/* Section 4: About VietCraft Story (CMS Managed) */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="bg-lotus-sand/20 py-20 border-y border-lotus-sand/40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Image Column */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] border border-lotus-sand/60">
                <img
                  src={
                    homepage?.aboutSection?.image ||
                    'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=1000&q=80'
                  }
                  alt="Vietnamese artisan sculpting natural decor"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 hidden sm:block bg-white p-5 rounded-2xl shadow-xl border border-lotus-sand/50 max-w-xs">
                <p className="font-serif italic text-sm text-lotus-forest leading-snug">
                  "{homepage?.aboutSection?.quote || 'True luxury is organic, patient, and deeply tied to the hands that shaped it.'}"
                </p>
                <p className="text-[11px] font-semibold text-lotus-clay mt-2 uppercase tracking-wider">
                  — {homepage?.aboutSection?.quoteAuthor || 'Mai Nguyen, Creative Director'}
                </p>
              </div>
            </div>

            {/* Text Story Column */}
            <div className="lg:col-span-7 space-y-6 lg:pl-8">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-lotus-clay">
                <span>Our Heritage</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-lotus-forest leading-tight">
                {homepage?.aboutSection?.title || 'Rooted in Vietnamese Craft Traditions'}
              </h2>
              <p className="text-base text-lotus-charcoal/80 leading-relaxed font-light whitespace-pre-line">
                {homepage?.aboutSection?.body ||
                  'VietCraft was founded to bridge ancestral craft communities of Vietnam with modern interior spaces across America. From bamboo weavers in Chương Mỹ to ceramics masters in Bát Tràng, we curate sustainable home decor that feels warm, grounded, and enduring.'}
              </p>
              <div className="pt-2">
                <Link
                  to={homepage?.aboutSection?.buttonUrl || '/about'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-lotus-forest hover:bg-lotus-forest/90 text-white text-sm font-medium transition-colors shadow-sm"
                >
                  <span>{homepage?.aboutSection?.buttonText || 'Discover Our Story'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
};
