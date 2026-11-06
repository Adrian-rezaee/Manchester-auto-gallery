import React, { useState } from 'react';
import { Vehicle, CurrencyCode, HIDDEN, formatPrice } from '../../data/vehicles';
import {
  X,
  Shield,
  ArrowUpRight,
  Gauge,
  Zap,
  Flame,
  Wind,
  CheckCircle2,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from '../ui/Icon';

interface VehicleModalProps {
  vehicle: Vehicle | null;
  currency: CurrencyCode;
  onClose: () => void;
  onRequestViewing: (vehicleId: string) => void;
  onNavigateVehicle?: (direction: 'next' | 'prev') => void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  vehicle,
  currency,
  onClose,
  onRequestViewing,
  onNavigateVehicle,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNavigateVehicle) onNavigateVehicle('next');
      if (e.key === 'ArrowLeft' && onNavigateVehicle) onNavigateVehicle('prev');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigateVehicle]);

  React.useEffect(() => {
    setActiveImageIndex(0);
  }, [vehicle?.id]);

  if (!vehicle) return null;

  const playEngineSound = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const now = ctx.currentTime;
      const startFreq = 58;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(startFreq * 3.8, now + 1.2);
      osc.frequency.exponentialRampToValueAtTime(startFreq * 2.2, now + 1.7);
      osc.frequency.exponentialRampToValueAtTime(startFreq * 4.2, now + 2.5);
      osc.frequency.exponentialRampToValueAtTime(startFreq * 1.1, now + 3.2);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
      gain.gain.linearRampToValueAtTime(0.14, now + 2.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.4);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.linearRampToValueAtTime(2400, now + 1.5);
      filter.frequency.linearRampToValueAtTime(600, now + 3.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 3.5);

      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 3500);
    } catch {
      // audio unavailable
    }
  };

  return (
    <div
      data-veltrix-modal="vehicle"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 md:bg-black/60 md:backdrop-blur-xl overflow-y-auto"
    >
      <div
        className="relative w-full max-w-5xl bg-paper border-2 border-[#D4AF37]/40 rounded-3xl shadow-[0_25px_80px_rgba(212,175,55,0.25)] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controls */}
        <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
          {onNavigateVehicle && (
            <>
              <button
                onClick={() => onNavigateVehicle('prev')}
                title="Previous motorcar"
                className="w-10 h-10 rounded-full bg-paper/90 border border-[#D4AF37]/40 text-ink hover:text-gold-mid hover:border-[#D4AF37] shadow-sm transition-all flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigateVehicle('next')}
                title="Next motorcar"
                className="w-10 h-10 rounded-full bg-paper/90 border border-[#D4AF37]/40 text-ink hover:text-gold-mid hover:border-[#D4AF37] shadow-sm transition-all flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            title="Close dossier"
            className="w-10 h-10 rounded-full bg-paper/90 border border-[#D4AF37]/40 text-ink hover:text-gold-mid hover:border-[#D4AF37] shadow-sm transition-all flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Visual showcase */}
          <div className="lg:col-span-7 bg-warm p-6 md:p-8 flex flex-col justify-between border-r border-[#D4AF37]/20">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-gradient-to-r from-[#D4AF37] to-[#B38E22] text-white font-bold shadow-xs">
                  {vehicle.status}
                </span>
                <span className="text-[11px] font-mono text-gold-deep font-semibold">
                  Ref: {vehicle.chassisNumber}
                </span>
              </div>

              <div className="relative aspect-16/10 rounded-2xl overflow-hidden border border-[#D4AF37]/30 bg-paper shadow-md">
                <img decoding="async"
                  src={vehicle.gallery[activeImageIndex] || vehicle.heroImage}
                  alt={`${vehicle.manufacturer} ${vehicle.model}`}
                  className="w-full h-full object-cover transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                <button
                  onClick={playEngineSound}
                  className="absolute bottom-4 left-4 z-10 px-3.5 py-1.5 rounded-xl bg-paper/95 border border-[#D4AF37]/40 text-[11px] font-mono font-bold text-ink hover:border-[#D4AF37] flex items-center gap-2 shadow-lg transition-all"
                >
                  <Volume2 className={`w-3.5 h-3.5 text-gold-mid ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                  <span>{isPlayingAudio ? 'Playing…' : 'Play engine note'}</span>
                </button>
              </div>

              {vehicle.gallery.length > 1 && (
                <div className="flex items-center gap-3 mt-4">
                  {vehicle.gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImageIndex === i
                          ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/40 shadow-sm'
                          : 'border-line opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img decoding="async" src={img} alt="Gallery view" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-paper border border-[#D4AF37]/30 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-gold-deep font-bold">
                <Shield className="w-3.5 h-3.5 text-gold-mid" />
                <span>{HIDDEN}</span>
              </div>
              <p className="text-xs text-body leading-relaxed">{vehicle.provenance}</p>
            </div>
          </div>

          {/* Specifications */}
          <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between space-y-6 bg-paper">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono tracking-[0.25em] text-gold-deep uppercase block font-bold">
                  {vehicle.year} • {vehicle.manufacturer}
                </span>
                <h2 className="font-display font-black text-2xl md:text-3xl text-ink mt-1">
                  {vehicle.model}
                </h2>
              </div>

              <div className="p-4 rounded-2xl bg-warm border border-[#D4AF37]/30 flex items-baseline justify-between shadow-xs">
                <span className="text-xs font-mono text-gold-deep uppercase font-bold">
                  Acquisition Value
                </span>
                <span className="font-display font-black text-xl text-ink">{formatPrice(vehicle.priceAed, currency)}</span>
              </div>

              <p className="text-xs text-body leading-relaxed">{vehicle.description}</p>

              <div className="space-y-2.5 pt-2">
                <span className="text-[10px] font-mono tracking-[0.25em] text-gold-deep uppercase block font-bold">
                  Engineering Telemetry
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-warm border border-[#D4AF37]/20 space-y-0.5">
                    <span className="text-[10px] font-mono text-gold-deep flex items-center gap-1 font-semibold">
                      <Zap className="w-3 h-3 text-[#D4AF37]" /> Power
                    </span>
                    <span className="font-display font-black text-ink block">{vehicle.powerHp}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-warm border border-[#D4AF37]/20 space-y-0.5">
                    <span className="text-[10px] font-mono text-gold-deep flex items-center gap-1 font-semibold">
                      <Gauge className="w-3 h-3 text-gold-mid" /> 0-100 km/h
                    </span>
                    <span className="font-display font-black text-ink block">{vehicle.acceleration}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-warm border border-[#D4AF37]/20 space-y-0.5">
                    <span className="text-[10px] font-mono text-gold-deep flex items-center gap-1 font-semibold">
                      <Wind className="w-3 h-3 text-[#D4AF37]" /> Top Speed
                    </span>
                    <span className="font-display font-black text-ink block">{vehicle.topSpeed}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-warm border border-[#D4AF37]/20 space-y-0.5">
                    <span className="text-[10px] font-mono text-gold-deep flex items-center gap-1 font-semibold">
                      <Flame className="w-3 h-3 text-gold-mid" /> Torque
                    </span>
                    <span className="font-display font-black text-ink block">{vehicle.torqueNm}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 text-[11px] font-mono">
                  {[
                    ['Powertrain', vehicle.engine],
                    ['Transmission', vehicle.transmission],
                    ['Drivetrain', vehicle.drivetrain],
                    ['Exterior Finish', vehicle.exteriorColor],
                    ['Interior', vehicle.interiorColor],
                    ['Odometer', vehicle.mileage],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between py-1 border-b border-[#D4AF37]/20 gap-4"
                    >
                      <span className="text-muted">{label}:</span>
                      <span className="text-ink font-semibold text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <button
                onClick={() => {
                  onClose();
                  onRequestViewing(vehicle.id);
                }}
                className="w-full py-4 rounded-sm border border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] via-[#FFF0A8] to-[#C29B28] text-[#0E1013] font-display text-xs font-bold uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl hover:scale-101 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#6B520E]" />
                <span>Inquire Private Allocation</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-gold-deep">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{HIDDEN}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
