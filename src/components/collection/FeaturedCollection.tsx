import React, { useState } from 'react';
import { VEHICLES, Vehicle, CurrencyCode, HIDDEN, formatPrice } from '../../data/vehicles';
import { ArrowUpRight, Gauge, Zap, Flame, Sparkles } from 'lucide-react';

interface FeaturedCollectionProps {
  currency: CurrencyCode;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({ currency, onSelectVehicle }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Hypercar', 'Track Icon', 'Grand Tourer'];

  const filteredVehicles =
    selectedCategory === 'All'
      ? VEHICLES
      : VEHICLES.filter((v) => v.category === selectedCategory);

  return (
    <section id="collection" className="relative py-28 md:py-36 bg-warm text-ink overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#D4AF37]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-[#F3E5AB]/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-paper border border-[#D4AF37]/35 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-xs font-mono tracking-[0.3em] text-gold-deep uppercase font-bold">
                CURATED INVENTORY
              </span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-ink">
              FEATURED <span className="text-gradient-gold">COLLECTION.</span>
            </h2>
            <p className="text-sm md:text-base text-body max-w-xl">
              {HIDDEN}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 border border-[#D4AF37]/30 p-1.5 rounded-2xl bg-paper shadow-sm self-start md:self-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-display uppercase tracking-wider transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38E22] text-white font-bold shadow-md shadow-[#D4AF37]/30'
                    : 'text-muted hover:text-ink hover:bg-warm-2'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVehicles.map((car) => (
            <div
              key={car.id}
              onClick={() => onSelectVehicle(car)}
              className="group cursor-pointer relative bg-paper border border-[#D4AF37]/25 rounded-3xl overflow-hidden hover:border-[#D4AF37] transition-all duration-500 shadow-[0_15px_40px_rgba(212,175,55,0.08)] hover:shadow-[0_25px_60px_rgba(212,175,55,0.22)] hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div className="relative aspect-16/10 overflow-hidden bg-[#F7F6F3]">
                <img decoding="async"
                  src={car.heroImage}
                  alt={`${car.manufacturer} ${car.model}`}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-106 group-hover:brightness-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-paper via-transparent to-black/10 pointer-events-none" />

                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-paper/90 backdrop-blur-md text-gold-deep font-bold border border-[#D4AF37]/30 shadow-sm">
                    {car.status}
                  </span>
                </div>

                <div className="absolute top-4 right-4 z-10">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#B38E22] text-white font-bold shadow-sm">
                    {car.year}
                  </span>
                </div>

                <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#FFF0A8] to-[#C29B28] text-[#0E1013] text-[11px] font-display font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xl">
                    <span>View Dossier</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              <div className="p-7 space-y-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono tracking-[0.25em] text-gold-deep uppercase block font-bold">
                    {car.manufacturer}
                  </span>
                  <h3 className="font-display font-black text-xl md:text-2xl text-ink group-hover:text-gold-mid transition-colors mt-0.5">
                    {car.model}
                  </h3>

                  <div className="mt-3.5 flex items-baseline justify-between border-b border-[#D4AF37]/20 pb-3.5">
                    <span className="text-[11px] font-mono text-muted uppercase">
                      Acquisition Value
                    </span>
                    <span className="font-display font-black text-lg md:text-xl text-ink">
                      {formatPrice(car.priceAed, currency)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-warm border border-[#D4AF37]/20">
                    <span className="text-[9px] font-mono text-gold-deep flex items-center gap-1 font-semibold">
                      <Zap className="w-2.5 h-2.5 text-[#D4AF37]" /> POWER
                    </span>
                    <p className="font-display font-black text-xs text-ink mt-0.5">{car.powerHp}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-warm border border-[#D4AF37]/20">
                    <span className="text-[9px] font-mono text-gold-deep flex items-center gap-1 font-semibold">
                      <Gauge className="w-2.5 h-2.5 text-gold-mid" /> 0-100
                    </span>
                    <p className="font-display font-black text-xs text-ink mt-0.5">{car.acceleration}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-warm border border-[#D4AF37]/20">
                    <span className="text-[9px] font-mono text-gold-deep flex items-center gap-1 font-semibold">
                      <Flame className="w-2.5 h-2.5 text-[#D4AF37]" /> TOP SPEED
                    </span>
                    <p className="font-display font-black text-xs text-ink mt-0.5 truncate">{car.topSpeed}</p>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-muted space-y-1 pt-1">
                  <p className="truncate">
                    <span className="text-gold-deep font-semibold">Powertrain:</span> {car.engine}
                  </p>
                  <p className="truncate">
                    <span className="text-gold-deep font-semibold">Transmission:</span> {car.transmission}
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-between text-xs font-display font-bold uppercase tracking-wider text-ink group-hover:text-gold-mid transition-colors border-t border-[#D4AF37]/20">
                  <span>View Technical Details</span>
                  <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 group-hover:border-[#D4AF37] group-hover:bg-gradient-to-r group-hover:from-[#D4AF37] group-hover:to-[#B38E22] flex items-center justify-center transition-all duration-300 shadow-xs">
                    <ArrowUpRight className="w-4 h-4 text-gold-deep group-hover:text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
