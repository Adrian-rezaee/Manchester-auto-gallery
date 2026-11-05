import React from 'react';
import { ArrowUpRight, MessageCircle, MapPin, Phone, Mail, Shield } from 'lucide-react';
import { HIDDEN } from '../../data/vehicles';
import { AutogalleryMark } from '../brand/Logo';

interface FooterProps {
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking }) => {
  return (
    <footer id="contact" className="relative bg-paper border-t border-[#D4AF37]/25 text-body pt-24 pb-12 overflow-hidden">
      {/* Golden Shimmer Watermark Accent */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[200px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

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
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-warm hover:bg-paper border-2 border-[#D4AF37]/40 hover:border-[#D4AF37] text-ink text-xs font-mono font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all duration-300"
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
                <a href="#collection" className="hover:text-gold-mid transition-colors">
                  Hypercar Collection
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-gold-mid transition-colors">
                  Atelier Provenance
                </a>
              </li>
              <li>
                <a href="#showroom" className="hover:text-gold-mid transition-colors">
                  DIFC White Pavilion
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-gold-mid transition-colors">
                  Air Freight Logistics
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenBooking}
                  className="hover:text-gold-mid transition-colors text-left uppercase"
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
                className="w-8 h-8 rounded-lg bg-warm border border-[#D4AF37]/35 text-gold-deep hover:text-ink hover:border-[#D4AF37] flex items-center justify-center shadow-xs transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="#contact"
                className="w-8 h-8 rounded-lg bg-warm border border-[#D4AF37]/35 text-gold-deep hover:text-ink hover:border-[#D4AF37] flex items-center justify-center shadow-xs transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a
                href="#contact"
                className="w-8 h-8 rounded-lg bg-warm border border-[#D4AF37]/35 text-gold-deep hover:text-ink hover:border-[#D4AF37] flex items-center justify-center shadow-xs transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
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
