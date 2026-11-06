import React, { Suspense } from 'react';
import { HIDDEN } from '../../data/vehicles';
import { ChevronRight, Sparkles } from '../ui/Icon';

// three.js (the heavy part of the bundle) loads in its own chunk, after the page text is
// already on screen. The import starts immediately, so nothing is delayed.
const HeroCarScene = React.lazy(() =>
  import('../3d/HeroCarScene').then((m) => ({ default: m.HeroCarScene }))
);

interface HeroSectionProps {
  onExploreCollection: () => void;
  onDiscoverVeltrix: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreCollection,
  onDiscoverVeltrix,
}) => {
  return (
    <section className="relative w-full min-h-[100svh] lg:h-screen lg:min-h-[760px] bg-[#08090B] overflow-hidden flex flex-col lg:justify-between">
      {/* 3D studio slider — click left / right to walk the views.
          Mobile/tablet: sits BELOW the copy in normal flow so text never covers the car.
          Desktop (lg+): full-bleed background behind the copy. */}
      <div className="relative order-2 flex-1 min-h-[360px] sm:min-h-[420px] z-0 lg:absolute lg:inset-0 lg:order-none lg:min-h-0">
        <div className="absolute inset-0">
          <Suspense fallback={<div className="w-full h-full bg-[#08090B]" />}>
            <HeroCarScene />
          </Suspense>
        </div>
      </div>

      {/* Soft left-hand scrim so the headline stays readable over the bright glass facade */}
      <div className="hidden lg:block absolute inset-0 z-[1] pointer-events-none bg-gradient-to-r from-black/65 via-black/25 to-transparent" />

      {/* Editorial copy */}
      <div className="relative order-1 z-10 max-w-7xl mx-auto px-6 md:px-12 pt-24 sm:pt-28 md:pt-32 lg:pt-52 xl:pt-60 pb-2 lg:pb-0 pointer-events-none w-full lg:order-none">
        <div className="max-w-xl space-y-3 md:space-y-4">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-black/30 border border-[#D4AF37]/40 pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-[10px] font-mono tracking-[0.3em] text-[#E8C858] uppercase font-medium">
              EXCLUSIVE AUTOMOTIVE COLLECTION
            </span>
          </div>

          <h1 className="font-luxe font-semibold text-3xl sm:text-5xl lg:text-5xl xl:text-6xl tracking-[0.06em] text-white leading-[1.05]">
            BEYOND <br />
            <span className="text-gradient-gold">THE DRIVE.</span>
          </h1>

          <p className="hidden sm:block text-xs md:text-sm lg:text-[15px] text-white/65 max-w-md leading-relaxed font-light">
            {HIDDEN}
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-3 pointer-events-auto">
            <button
              onClick={onExploreCollection}
              className="btn-shine press group px-6 py-3 rounded-sm border border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] via-[#FFF0A8] to-[#C29B28] text-[#0E1013] font-sans font-semibold text-[11px] tracking-[0.22em] uppercase shadow-xl shadow-[#D4AF37]/25 flex items-center gap-3"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#6B520E]" />
              <span>EXPLORE COLLECTION</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#0E1013] group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onDiscoverVeltrix}
              className="group press px-6 py-3 rounded-sm bg-black/25 hover:bg-white/10 border border-white/25 hover:border-[#D4AF37] text-white font-sans font-medium text-[11px] tracking-[0.22em] uppercase transition-[background-color,border-color,transform] duration-300 flex items-center gap-2"
            >
              <span>DISCOVER THE GALLERY</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-8 w-full hidden lg:flex lg:order-none items-end justify-end gap-6 pointer-events-none">
        {/* Scroll cue */}
        <button
          onClick={onExploreCollection}
          className="pointer-events-auto hidden lg:flex flex-col items-center gap-2 text-white/55 hover:text-white transition-colors group focus:outline-none mb-1"
        >
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase group-hover:text-[#E8C858] transition-colors font-bold">
            SCROLL TO EXPLORE
          </span>
          <div className="w-7 h-11 rounded-full border border-white/25 group-hover:border-[#D4AF37] p-1 flex justify-center transition-colors">
            <div className="w-1.5 h-2.5 rounded-full bg-gradient-to-b from-[#D4AF37] to-[#E8C858] animate-bounce" />
          </div>
        </button>
      </div>
    </section>
  );
};
