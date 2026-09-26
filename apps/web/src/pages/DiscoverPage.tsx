import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Hammer, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { SEOHead } from '../components/SEOHead';
import { MaterialGrid } from '../components/MaterialGrid';
import { MATERIALS } from '@vietcraft/shared';

export const DiscoverPage: React.FC = () => {
  const { data: materialsData } = useQuery({
    queryKey: ['materials'],
    queryFn: api.getMaterials
  });

  const materials = materialsData && materialsData.length > 0 ? materialsData : (MATERIALS as any);

  const craftVillages = [
    {
      name: 'Bát Tràng Pottery Village',
      location: 'Gia Lâm, Hanoi',
      material: 'Ceramics',
      description: 'Active since the 14th century, potters here transform Red River silt clay using ancestral wood firings and crackle celadon glazes.'
    },
    {
      name: 'Hạ Thái Lacquer Village',
      location: 'Thường Tín, Hanoi',
      material: 'Lacquer',
      description: 'Renowned for Sơn Ta natural resin application, shell inlay, and charcoal water-polishing that creates deep glass-like luster.'
    },
    {
      name: 'Phú Vinh Bamboo Guild',
      location: 'Chương Mỹ, Hanoi',
      material: 'Rattan & Bamboo',
      description: 'Over 400 years of hand-splitting bamboo and smoking culms over rice chaff to produce intricate radial lanterns and baskets.'
    },
    {
      name: 'Kim Sơn Weaving Marshes',
      location: 'Kim Sơn, Ninh Bình',
      material: 'Woven Fibers',
      description: 'Coastal wetlands where wild sedge and seagrass are harvested, sun-dried, and braided into durable floor rugs and storage hampers.'
    },
    {
      name: 'Mã Châu Silk Weaving Guild',
      location: 'Duy Xuyên, Quảng Nam',
      material: 'Silk',
      description: 'Operating since the Champa kingdom era along the Thu Bồn River, cultivating wild tussah silks with botanical plant dyes.'
    },
    {
      name: 'Đồng Kỵ & Kim Bồng Carving',
      location: 'Bắc Ninh & Hội An',
      material: 'Wood',
      description: 'Master joinery without nails, lathe-turned vessels, and hand-rubbed tung oil finishes that honor mature teak and acacia grain.'
    }
  ];

  return (
    <div className="space-y-20 py-12 pb-24">
      <SEOHead
        title="Discover Vietnamese Craft Heritage & Natural Materials | VietCraft"
        description="Explore the ancestral traditions behind Vietnamese rattan, ceramics, lacquer, wood, woven fibers, and silk. Meet the craft villages of Vietnam."
      />

      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lotus-sand/30 text-xs font-semibold uppercase tracking-widest text-lotus-forest mb-4">
          <Sparkles className="w-3.5 h-3.5 text-lotus-clay" />
          <span>Ancestral Origins</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-lotus-forest leading-tight">
          Materials Formed by Nature, Perfected by Hand
        </h1>
        <p className="text-base sm:text-lg text-lotus-charcoal/80 mt-4 leading-relaxed font-light">
          For centuries, Vietnamese craft communities have worked in harmony with river deltas, highland forests,
          and coastal marshes. Explore each natural medium and discover how thoughtful living begins with respect for raw fiber and clay.
        </p>
      </section>

      {/* 6 Materials Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-lotus-sand/30 pb-4 mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-lotus-forest">
            The Six Natural Mediums
          </h2>
          <p className="text-xs sm:text-sm text-lotus-charcoal/60 mt-1">
            Click on any material to read its cultural history, technique breakdown, and curated home objects.
          </p>
        </div>
        <MaterialGrid materials={materials} />
      </section>

      {/* Craft Village Geography */}
      <section className="bg-white py-16 border-y border-lotus-sand/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-lotus-clay">
              Living Heritage
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-lotus-forest mt-1">
              Vietnam’s Renowned Craft Villages
            </h2>
            <p className="text-sm text-lotus-charcoal/70 mt-2 font-light">
              In Vietnam, ancestral knowledge is held in whole villages (<em>làng nghề</em>) where collective generations
              perfect a single art form.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {craftVillages.map((village, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-lotus-ivory/50 border border-lotus-sand/40 hover:border-lotus-clay transition-all duration-300 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-lotus-sand/30 text-[11px] font-medium text-lotus-forest">
                    {village.material}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-lotus-charcoal/50">
                    <MapPin className="w-3.5 h-3.5 text-lotus-clay" />
                    <span>{village.location}</span>
                  </div>
                </div>

                <h3 className="font-serif text-xl font-bold text-lotus-forest">
                  {village.name}
                </h3>

                <p className="text-xs text-lotus-charcoal/75 leading-relaxed">
                  {village.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
