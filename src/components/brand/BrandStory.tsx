import React from 'react';
import { HIDDEN } from '../../data/vehicles';
import { ShieldCheck, Compass, Sparkles, Layers, Award } from '../ui/Icon';

export const BrandStory: React.FC = () => {
  return (
    <section id="about" className="cv-auto relative py-24 md:py-36 bg-paper text-ink overflow-hidden">
      {/* Editorial Decorative Watermark in Soft Champagne */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.035] font-display font-black text-[20vw] leading-none tracking-tighter text-[#D4AF37]">
        AURUM
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-warm border border-[#D4AF37]/35 shadow-xs mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-xs font-mono tracking-[0.3em] text-gold-deep uppercase font-bold">
            BRAND PHILOSOPHY & PROVENANCE
          </span>
        </div>

        {/* Required Headline: "MORE THAN A CAR. A STATEMENT." */}
        <div className="mb-20">
          <h2 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-ink leading-[0.95] max-w-5xl">
            MORE THAN A CAR. <br />
            <span className="text-gradient-gold">A STATEMENT.</span>
          </h2>
        </div>

        {/* Asymmetrical Editorial Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Atmospheric Macro Craftsmanship Photography Diptych */}
          <div className="lg:col-span-6 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/30 aspect-4/5 group sheen shadow-[0_12px_32px_rgba(212,175,55,0.12)]">
                <img decoding="async"
                  src={`${import.meta.env.BASE_URL}images/white-cockpit-gold.webp`}
                  alt="Manchester Auto Gallery Bespoke Ivory & Gold Cockpit Craftsmanship"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-[#F3E5AB] uppercase block font-semibold">
                    IVORY ATELIER
                  </span>
                  <p className="font-display text-xs font-bold text-white mt-0.5">
                    {HIDDEN}
                  </p>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/30 aspect-4/5 group sheen shadow-[0_12px_32px_rgba(212,175,55,0.12)] sm:translate-y-8">
                <img decoding="async"
                  src={`${import.meta.env.BASE_URL}images/white-aero-gold.webp`}
                  alt="Manchester Auto Gallery Aerodynamic Sculpture in Pearl & Gold"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-[#F3E5AB] uppercase block font-semibold">
                    ACTIVE DIFFUSER
                  </span>
                  <p className="font-display text-xs font-bold text-white mt-0.5">
                    {HIDDEN}
                  </p>
                </div>
              </div>
            </div>

            {/* Editorial Quote Box */}
            <div className="border-l-3 border-[#D4AF37] pl-6 py-2 space-y-2 sm:pt-10">
              <p className="font-display text-lg md:text-xl text-ink font-light italic leading-snug">
                {HIDDEN}
              </p>
              <span className="text-xs font-mono text-gold-deep tracking-wider uppercase block font-bold">
                {HIDDEN}
              </span>
            </div>
          </div>

          {/* Right Column: Editorial Narrative & Pillars */}
          <div className="lg:col-span-6 space-y-10">
            <div className="space-y-6 text-body text-base md:text-lg leading-relaxed">
              <p className="first-letter:text-5xl first-letter:font-display first-letter:font-black first-letter:text-gold-mid first-letter:float-left first-letter:mr-3 first-letter:leading-none">
                {HIDDEN}
              </p>
              <p>
                {HIDDEN}
              </p>
            </div>

            {/* Core Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#D4AF37]/25">
              <div className="group card-lux p-5 rounded-2xl bg-warm border border-[#D4AF37]/25 space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B38E22] flex items-center justify-center text-white shadow-md shadow-[#D4AF37]/20 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-6 group-hover:scale-110">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-sm tracking-wide text-ink">
                  Exhaustive Forensics
                </h4>
                <p className="text-xs text-body leading-relaxed">
                  {HIDDEN}
                </p>
              </div>

              <div className="group card-lux p-5 rounded-2xl bg-warm border border-[#D4AF37]/25 space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B38E22] flex items-center justify-center text-white shadow-md shadow-[#D4AF37]/20 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-6 group-hover:scale-110">
                  <Compass className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-sm tracking-wide text-ink">
                  Discreet Air Freight
                </h4>
                <p className="text-xs text-body leading-relaxed">
                  {HIDDEN}
                </p>
              </div>

              <div className="group card-lux p-5 rounded-2xl bg-warm border border-[#D4AF37]/25 space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B38E22] flex items-center justify-center text-white shadow-md shadow-[#D4AF37]/20 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-6 group-hover:scale-110">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-sm tracking-wide text-ink">
                  Atelier Commissioning
                </h4>
                <p className="text-xs text-body leading-relaxed">
                  {HIDDEN}
                </p>
              </div>

              <div className="group card-lux p-5 rounded-2xl bg-warm border border-[#D4AF37]/25 space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B38E22] flex items-center justify-center text-white shadow-md shadow-[#D4AF37]/20 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-6 group-hover:scale-110">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-sm tracking-wide text-ink">
                  DIFC Tax-Free Vault
                </h4>
                <p className="text-xs text-body leading-relaxed">
                  {HIDDEN}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
