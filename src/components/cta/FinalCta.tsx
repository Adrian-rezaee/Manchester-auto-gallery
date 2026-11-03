import React from 'react';
import { HIDDEN } from '../../data/vehicles';
import { ArrowUpRight, PhoneCall, Sparkles } from 'lucide-react';

interface FinalCtaProps {
  onExploreCollection: () => void;
  onContactTeam: () => void;
}

export const FinalCta: React.FC<FinalCtaProps> = ({
  onExploreCollection,
  onContactTeam,
}) => {
  return (
    <section className="relative py-32 md:py-48 bg-warm text-ink overflow-hidden">
      {/* Background Radiant Golden Lighting */}
      <div className="absolute inset-0 bg-radial from-warm via-warm to-warm-2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#D4AF37]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-10 text-center space-y-8">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-paper border border-[#D4AF37]/40 shadow-sm">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-[11px] font-mono tracking-[0.28em] text-gold-deep uppercase font-bold">
            PRIVATE CLIENT INVITATION
          </span>
        </div>

        {/* Required Headline: "YOUR NEXT ICON IS WAITING." */}
        <h2 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-ink leading-[0.95]">
          YOUR NEXT ICON <br />
          <span className="text-gradient-gold">IS WAITING.</span>
        </h2>

        {/* Supporting Copy */}
        <p className="text-sm md:text-base lg:text-lg text-body max-w-xl mx-auto leading-relaxed">
          {HIDDEN}
        </p>

        {/* Action Buttons in Gleaming Gold & White */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onExploreCollection}
            className="px-8 py-4 rounded-sm border border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] via-[#FFF0A8] to-[#C29B28] text-[#0E1013] font-display font-bold text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-xl shadow-[#D4AF37]/30 hover:shadow-2xl hover:shadow-[#D4AF37]/50 hover:scale-105 flex items-center gap-2"
          >
            <span>Explore Collection</span>
            <ArrowUpRight className="w-4 h-4 text-ink" />
          </button>

          <button
            onClick={onContactTeam}
            className="px-8 py-4 rounded-sm bg-paper hover:bg-warm border border-[#D4AF37]/40 hover:border-[#D4AF37] text-ink font-display font-bold text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-md shadow-[#D4AF37]/10 flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4 text-gold-mid" />
            <span>Contact Our Team</span>
          </button>
        </div>

        {/* Footnote */}
        <p className="text-[11px] font-mono text-gold-deep tracking-wider uppercase pt-4 font-semibold">
          {HIDDEN}
        </p>
      </div>
    </section>
  );
};
