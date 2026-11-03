import React from 'react';
import { HIDDEN } from '../../data/vehicles';
import { Plane, ShieldAlert, Award, FileCheck2, ArrowUpRight, Sparkles } from 'lucide-react';

interface ConciergeServicesProps {
  onInquire: () => void;
}

export const ConciergeServices: React.FC<ConciergeServicesProps> = ({ onInquire }) => {
  const services = [
    {
      icon: <Plane className="w-6 h-6 text-gold-mid" />,
      title: 'Global Air Freight Logistics',
      desc: HIDDEN,
    },
    {
      icon: <ShieldAlert className="w-6 h-6 text-gold-mid" />,
      title: 'Off-Market Confidential Brokerage',
      desc: HIDDEN,
    },
    {
      icon: <FileCheck2 className="w-6 h-6 text-gold-mid" />,
      title: 'DIFC Free Zone & Tax Exemption',
      desc: HIDDEN,
    },
    {
      icon: <Award className="w-6 h-6 text-gold-mid" />,
      title: 'Trackside Engineering Support',
      desc: HIDDEN,
    },
  ];

  return (
    <section id="services" className="relative py-28 md:py-36 bg-paper text-ink overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-warm border border-[#D4AF37]/35 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-xs font-mono tracking-[0.3em] text-gold-deep uppercase font-bold">
                PRIVATE CLIENT CONCIERGE
              </span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-ink">
              SOVEREIGN <span className="text-gradient-gold">SERVICES.</span>
            </h2>
            <p className="text-sm md:text-base text-body max-w-xl">
              {HIDDEN}
            </p>
          </div>

          <button
            onClick={onInquire}
            className="px-6 py-3.5 rounded-sm border border-[#D4AF37]/50 hover:border-[#D4AF37] bg-paper text-xs font-display font-bold uppercase tracking-[0.2em] text-ink hover:text-gold-mid shadow-sm hover:shadow-md transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <span>Consult Client Officer</span>
            <ArrowUpRight className="w-4 h-4 text-gold-mid" />
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((srv, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl bg-warm border border-[#D4AF37]/25 space-y-4 hover:border-[#D4AF37] hover:bg-paper shadow-[0_10px_30px_rgba(212,175,55,0.06)] hover:shadow-[0_20px_45px_rgba(212,175,55,0.16)] transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-paper border border-[#D4AF37]/30 shadow-xs w-fit">
                  {srv.icon}
                </div>
                <h3 className="font-display font-black text-base md:text-lg text-ink">
                  {srv.title}
                </h3>
                <p className="text-xs text-body leading-relaxed">
                  {srv.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#D4AF37]/20 flex items-center justify-between text-[11px] font-mono text-muted">
                <span>Concierge Protocol</span>
                <span className="text-gold-mid font-bold">{HIDDEN}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
