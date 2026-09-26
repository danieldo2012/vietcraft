import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Material } from '@vietcraft/shared';

interface MaterialGridProps {
  materials: Material[];
}

export const MaterialGrid: React.FC<MaterialGridProps> = ({ materials }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {materials.map((mat) => (
        <Link
          key={mat.slug}
          to={`/discover/${mat.slug}`}
          className="group relative flex flex-col bg-white rounded-3xl border border-lotus-sand/40 overflow-hidden hover:border-lotus-clay/50 hover:shadow-xl transition-all duration-500"
        >
          {/* Cover Image */}
          <div className="relative aspect-[16/11] overflow-hidden bg-lotus-sand/20">
            <img
              src={mat.coverImage}
              alt={mat.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-lotus-forest/80 via-lotus-forest/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

            {/* Bottom Title Overlay */}
            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between text-white">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-lotus-sand">
                  Material Heritage
                </span>
                <h3 className="font-serif text-2xl font-bold text-white tracking-wide">
                  {mat.name}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-lotus-clay group-hover:text-white transition-all transform group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
            <p className="text-sm text-lotus-charcoal/80 leading-relaxed font-light">
              {mat.shortDescription}
            </p>

            {/* Techniques */}
            {mat.craftingTechniques && mat.craftingTechniques.length > 0 && (
              <div className="pt-2 border-t border-lotus-sand/20">
                <div className="flex flex-wrap gap-1.5">
                  {mat.craftingTechniques.slice(0, 3).map((tech, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-lotus-sand/20 text-[11px] font-medium text-lotus-forest"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};
