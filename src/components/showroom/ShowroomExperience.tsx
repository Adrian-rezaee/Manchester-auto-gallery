import React, { useState, useEffect } from 'react';
import { HIDDEN } from '../../data/vehicles';
import { MapPin, Clock, Shield, Sparkles, ArrowUpRight } from '../ui/Icon';

interface ShowroomExperienceProps {
  onBookTour: () => void;
}

export const ShowroomExperience: React.FC<ShowroomExperienceProps> = ({ onBookTour }) => {
  const [dubaiTime, setDubaiTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Dubai',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setDubaiTime(new Intl.DateTimeFormat('en-US', options).format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const sanctuaryHighlights = [
    {
      title: 'The Calacatta Marble Pavilion',
      desc: HIDDEN,
    },
    {
      title: 'Sovereign Client Vault',
      desc: HIDDEN,
    },
    {
      title: 'Aurum Atelier Lounge',
      desc: HIDDEN,
    },
  ];

  return (
    <section id="showroom" className="cv-auto relative py-24 md:py-36 bg-warm text-ink overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Eyebrow & Title */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-paper border border-[#D4AF37]/35 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-xs font-mono tracking-[0.3em] text-gold-deep uppercase font-bold">
              THE DUBAI WHITE MARBLE SANCTUARY
            </span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-ink">
            AN ARCHITECTURAL <br />
            <span className="text-gradient-gold">PAVILION IN DIFC.</span>
          </h2>

          <p className="text-sm md:text-base text-body leading-relaxed">
            {HIDDEN}
          </p>
        </div>

        {/* Hero Architectural Visual Showcase */}
        <div className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/35 aspect-16/9 md:aspect-21/9 mb-12 shadow-[0_20px_60px_rgba(212,175,55,0.18)] group">
          <img decoding="async"
            src={`${import.meta.env.BASE_URL}images/white-showroom-gold.webp`}
            alt="Manchester Auto Gallery Dubai DIFC White & Gold Private Showroom"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-103"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Live Dubai Telemetry HUD Overlay */}
          <div className="absolute top-6 left-6 flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-paper/95 border border-[#D4AF37]/40 flex items-center gap-2 text-xs font-mono text-ink font-semibold shadow-md">
              <MapPin className="w-3.5 h-3.5 text-gold-mid" />
              <span>25.2048° N, 55.2708° E • DIFC Gate Precinct</span>
            </div>

            <div className="px-4 py-2 rounded-xl bg-paper/95 border border-[#D4AF37]/40 flex items-center gap-2 text-xs font-mono text-gold-deep font-semibold shadow-md">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Live Dubai GST: {dubaiTime || '10:45:00 AM'}</span>
            </div>
          </div>

          {/* Floating Schedule Tour CTA (24K Gold Shimmer) */}
          <div className="absolute bottom-6 right-6 z-10">
            <button
              onClick={onBookTour}
              className="px-7 py-3.5 rounded-sm border border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] via-[#FFF0A8] to-[#C29B28] text-[#0E1013] font-display font-bold text-xs uppercase tracking-[0.2em] shadow-2xl btn-shine press flex items-center gap-2"
            >
              <span>Schedule Private Tour</span>
              <ArrowUpRight className="w-4 h-4 text-ink" />
            </button>
          </div>
        </div>

        {/* Gallery Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sanctuaryHighlights.map((item, index) => (
            <div
              key={index}
              className="group card-lux p-8 rounded-3xl bg-paper border border-[#D4AF37]/25 space-y-4 shadow-[0_10px_30px_rgba(212,175,55,0.06)]"
            >
              <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
                <span className="text-xs font-mono text-gold-mid font-black tracking-wider">
                  PAVILION ZONE 0{index + 1}
                </span>
                <Sparkles className="w-4 h-4 text-[#D4AF37] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-90 group-hover:scale-125" />
              </div>
              <h3 className="font-display font-black text-lg text-ink">
                {item.title}
              </h3>
              <p className="text-xs md:text-sm text-body leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Confidentiality Notice */}
        <div className="mt-12 p-6 rounded-2xl bg-paper border border-[#D4AF37]/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gold-mid shrink-0" />
            <p className="text-xs text-body">
              <strong className="text-ink">By Appointment Only:</strong> {HIDDEN}
            </p>
          </div>
          <button
            onClick={onBookTour}
            className="text-xs font-mono uppercase tracking-wider group text-gold-mid hover:text-ink transition-colors whitespace-nowrap flex items-center gap-1 font-bold press"
          >
            <span>Request Protocol Access</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
