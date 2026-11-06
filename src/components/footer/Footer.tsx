import React from 'react';
import { ArrowUpRight, MessageCircle, MapPin, Phone, Mail, Shield, Instagram, Youtube, Linkedin } from '../ui/Icon';
import { HIDDEN } from '../../data/vehicles';
import { AutogalleryMark } from '../brand/Logo';

interface FooterProps {
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking }) => {
  return (
    <footer id="contact" className="cv-auto relative bg-paper border-t border-[#D4AF37]/25 text-body pt-20 pb-12 overflow-hidden">
      {/* Golden Shimmer Watermark Accent */}
      <div className="absolute top-0 right-1/4 w-[min(480px,100vw)] h-[260px] orb-gold opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 pb-20 border-b border-[#D4AF37]/20">
          {/* Column 1: Brand & Manifesto */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center">
              <AutogalleryMark className="w-[230px] h-auto" />
            </div>

            <p className="text-sm text-body leading-relaxed max-w-sm">
              {HIDDEN}
            </p>

            {/* Direct WhatsApp Concierge Button in Gold / Green Accent */}
            <div className="pt-2">
              <a
                href="#contact"
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-warm hover:bg-paper border-2 border-[#D4AF37]/40 hover:border-[#D4AF37] text-ink text-xs font-mono font-bold uppercase tracking-wider btn-shine press"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Direct WhatsApp Concierge (-----)</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gold-mid" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="lg:col-span-3 space-y-4">
            <span className="text-xs font-mono tracking-[0.25em] text-gold-deep uppercase block font-bold">
              Curated Sanctuary
            </span>
            <ul className="space-y-2.5 text-xs font-display uppercase tracking-wider font-semibold text-ink">
              <li>
                <a href="#collection" className="link-u hover:text-gold-mid">
                  Hypercar Collection
                </a>
              </li>
              <li>
                <a href="#about" className="link-u hover:text-gold-mid">
                  Atelier Provenance
                </a>
              </li>
              <li>
                <a href="#showroom" className="link-u hover:text-gold-mid">
                  DIFC White Pavilion
                </a>
              </li>
              <li>
                <a href="#services" className="link-u hover:text-gold-mid">
                  Air Freight Logistics
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenBooking}
                  className="link-u hover:text-gold-mid text-left uppercase"
                >
                  Book Private Viewing
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Dubai Location & Operating Protocol */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-xs font-mono tracking-[0.25em] text-gold-deep uppercase block font-bold">
              Dubai Flagship Pavilion
            </span>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-mid shrink-0 mt-0.5" />
                <span className="text-ink font-medium leading-relaxed">
                  -----
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-deep shrink-0" />
                <span className="text-ink font-semibold">-----</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-deep shrink-0" />
                <span className="text-ink">-----</span>
              </div>

              <div className="flex items-center gap-2.5 pt-1 text-[11px] font-mono text-body">
                <Shield className="w-3.5 h-3.5 text-gold-mid" />
                <span>{HIDDEN}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href="#contact"
                className="press w-10 h-10 rounded-full bg-warm border border-[#D4AF37]/35 text-gold-deep hover:text-[#0E1013] hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:-translate-y-1 flex items-center justify-center transition-[color,background-color,border-color,transform] duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-[18px] h-[18px]" />
              </a>
              <a
                href="#contact"
                className="press w-10 h-10 rounded-full bg-warm border border-[#D4AF37]/35 text-gold-deep hover:text-[#0E1013] hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:-translate-y-1 flex items-center justify-center transition-[color,background-color,border-color,transform] duration-300"
                aria-label="YouTube"
              >
                <Youtube className="w-[18px] h-[18px]" />
              </a>
              <a
                href="#contact"
                className="press w-10 h-10 rounded-full bg-warm border border-[#D4AF37]/35 text-gold-deep hover:text-[#0E1013] hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:-translate-y-1 flex items-center justify-center transition-[color,background-color,border-color,transform] duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-[18px] h-[18px]" />
              </a>
            </div>
          </div>
        </div>

        {/* Sub-footer Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-gold-deep">
          <div>
            <p>© {new Date().getFullYear()} Manchester Auto Gallery Ltd. Dubai, United Arab Emirates. All rights reserved.</p>
            <p className="mt-1 normal-case tracking-normal opacity-60">
              3D model “Mercedes-Benz Maybach 2022” by Mpgs Studios, licensed CC BY 4.0 (modified: reduced polygon count).
            </p>
            <p className="mt-1 normal-case tracking-normal opacity-80">
              Website designed &amp; developed by{' '}
              <a
                href="https://taksquad.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-ink transition-colors"
              >
                TAK
              </a>
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a href="#about" className="hover:text-ink transition-colors">Privacy Protocol</a>
            <a href="#about" className="hover:text-ink transition-colors">Non-Disclosure Standards</a>
            <a href="#about" className="hover:text-ink transition-colors">DIFC Regulatory Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
