import React from 'react';
import { HIDDEN } from '../../data/vehicles';
import { Plane, ShieldAlert, Award, FileCheck2, ArrowUpRight, ArrowRight } from '../ui/Icon';

interface ConciergeServicesProps {
  onInquire: () => void;
}

// Description text is still the HIDDEN placeholder: it is simply not rendered until real copy is set.
const hasCopy = (s: string) => s !== HIDDEN;

const SERVICES: { Icon: React.FC<React.SVGProps<SVGSVGElement>>; title: string; desc: string }[] = [
  { Icon: Plane, title: 'Global Air Freight Logistics', desc: HIDDEN },
  { Icon: ShieldAlert, title: 'Off-Market Confidential Brokerage', desc: HIDDEN },
  { Icon: FileCheck2, title: 'DIFC Free Zone & Tax Exemption', desc: HIDDEN },
  { Icon: Award, title: 'Trackside Engineering Support', desc: HIDDEN },
];

const INTRO: string = HIDDEN;

/**
 * Services — an editorial index instead of four identical cards.
 * Desktop: sticky intro on the left, numbered rows on the right.
 * Phone: a single column of full-width rows (no cards, no shadows, nothing heavy to paint).
 * Spacing sits on a strict 8px rhythm: 24 / 32 / 48 / 64 / 96.
 */
export const ConciergeServices: React.FC<ConciergeServicesProps> = ({ onInquire }) => {
  return (
    <section id="services" className="cv-auto relative bg-paper text-ink py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Intro */}
        <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
          <p className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.32em] text-gold-deep">
            <span className="h-px w-10 bg-gold-mid" aria-hidden="true" />
            Private Client Concierge
          </p>

          <h2 className="mt-6 font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.02] tracking-tight text-ink">
            SOVEREIGN
            <br />
            <span className="text-gradient-gold">SERVICES.</span>
          </h2>

          {hasCopy(INTRO) && (
            <p className="mt-6 max-w-md text-base leading-relaxed text-body">{INTRO}</p>
          )}

          <button
            type="button"
            onClick={onInquire}
            className="btn-shine press group mt-10 inline-flex items-center gap-3 rounded-full border border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] via-[#F3DC82] to-[#C29B28] px-7 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#0E1013]"
          >
            <span>Consult Client Officer</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        {/* Index */}
        <ol className="lg:col-span-7 border-t border-[#D4AF37]/35">
          {SERVICES.map(({ Icon, title, desc }, i) => (
            <li key={title} className="border-b border-[#D4AF37]/35">
              <button
                type="button"
                onClick={onInquire}
                className="group row-fill press grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-5 md:gap-x-8 px-0 py-8 md:px-6 md:py-10 text-left"
                aria-label={`${title} — enquire`}
              >
                {/* Index number + icon */}
                <span className="flex items-center gap-4 md:gap-6">
                  <span className="w-7 font-display text-sm font-bold tabular-nums tracking-[0.18em] text-gold-deep">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="icon-tile flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/45 bg-warm text-gold-mid group-hover:border-transparent group-hover:text-[#0E1013]">
                    <Icon className="h-6 w-6" />
                  </span>
                </span>

                {/* Title (+ description once real copy replaces the placeholder) */}
                <span className="min-w-0">
                  <span className="block font-display text-xl font-bold leading-snug text-ink transition-colors duration-300 group-hover:text-gold-mid md:text-2xl lg:text-[1.7rem]">
                    {title}
                  </span>
                  {hasCopy(desc) && (
                    <span className="mt-2 block text-sm leading-relaxed text-body md:text-base">{desc}</span>
                  )}
                </span>

                {/* Arrow */}
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/45 text-gold-deep transition-[transform,background-color,color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-45 group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#0E1013]">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
