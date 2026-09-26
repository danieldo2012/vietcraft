import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { HeroSlide } from '@vietcraft/shared';

interface HeroCarouselProps {
  slides?: HeroSlide[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const fallbackSlides: HeroSlide[] = [
    {
      title: 'Naturally Thoughtful Living',
      subtitle: 'Timeless home decor handcrafted from Vietnamese rattan, ceramics, lacquer, and wild silk.',
      buttonText: 'Explore Collections',
      buttonUrl: '/discover',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80',
      displayOrder: 0
    },
    {
      title: 'Ancestral Craft, Mindful Spaces',
      subtitle: 'Curated natural materials connecting US homes with Vietnam’s master artisan guilds.',
      buttonText: 'Browse Curated Products',
      buttonUrl: '/products',
      image: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=1600&q=80',
      displayOrder: 1
    }
  ];

  const activeSlides = slides && slides.length > 0 ? slides : fallbackSlides;

  // Auto-play timer
  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, activeSlides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  return (
    <div
      className="relative w-full h-[520px] sm:h-[600px] lg:h-[680px] bg-lotus-forest overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Featured carousel"
    >
      {/* Background Images with smooth fade transition */}
      {activeSlides.map((slide, idx) => (
        <div
          key={slide.id || idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
          } transform transition-transform duration-1000`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle gradient overlay for editorial legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-lotus-forest/90 via-lotus-forest/60 to-transparent" />
        </div>
      ))}

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl text-lotus-ivory space-y-6 pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium tracking-wide text-lotus-sand">
            <span>Artisanal Craft Heritage</span>
            <span className="w-1.5 h-1.5 rounded-full bg-lotus-clay" />
            <span>Sustainable Living</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-white">
            {currentSlide.title}
          </h1>

          <p className="text-base sm:text-lg text-lotus-ivory/90 leading-relaxed max-w-xl font-light">
            {currentSlide.subtitle}
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              to={currentSlide.buttonUrl}
              className="px-7 py-3.5 rounded-xl bg-lotus-clay hover:bg-lotus-clay-light text-white font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 group"
            >
              <span>{currentSlide.buttonText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/about"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium text-sm border border-white/30 transition-colors"
            >
              Our Philosophy
            </Link>
          </div>
        </div>
      </div>

      {/* Controls: Prev / Next Buttons */}
      {activeSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/15 backdrop-blur-md text-white hover:bg-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/15 backdrop-blur-md text-white hover:bg-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2.5">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-8 bg-lotus-clay' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
