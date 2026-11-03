import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, ChevronDown, Sparkles } from 'lucide-react';
import { CURRENCIES, CurrencyCode } from '../../data/vehicles';
import { AutogalleryMark } from '../brand/Logo';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  currentCurrency: CurrencyCode;
  onCurrencyChange: (curr: CurrencyCode) => void;
  onOpenBookingModal: (preselectedVehicle?: string) => void;
}

const NAV_LINKS = [
  { label: 'Collection', href: '#collection', id: 'collection' },
  { label: 'About', href: '#about', id: 'about' },
  { label: 'Showroom', href: '#showroom', id: 'showroom' },
  { label: 'Services', href: '#services', id: 'services' },
  { label: 'Contact', href: '#contact', id: 'contact' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentCurrency,
  onCurrencyChange,
  onOpenBookingModal,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Highlight the link of the section currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    NAV_LINKS.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) observer.observe(el);
    });
    const onTop = () => {
      if (window.scrollY < 200) setActiveId('');
    };
    window.addEventListener('scroll', onTop, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onTop);
    };
  }, []);

  // Lock page scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const linkClass = (id: string) => {
    const active = activeId === id;
    if (isScrolled) {
      return active
        ? 'bg-gradient-to-r from-[#D4AF37] to-[#C29B28] text-[#0E1013] shadow-md shadow-[#D4AF37]/30'
        : 'text-body hover:text-ink hover:bg-[#D4AF37]/15';
    }
    return active
      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C29B28] text-[#0E1013] shadow-md shadow-[#D4AF37]/30'
      : 'text-white/75 hover:text-white hover:bg-white/12';
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 px-3 sm:px-6 pt-3 sm:pt-4 pointer-events-none">
        <div
          className={`pointer-events-auto max-w-7xl mx-auto flex items-center justify-between gap-4 rounded-full border px-4 sm:px-6 transition-all duration-500 ${
            isScrolled
              ? 'py-2 bg-paper/85 backdrop-blur-2xl border-[#D4AF37]/35 shadow-[0_12px_40px_rgba(212,175,55,0.16)]'
              : 'py-3 bg-black/25 backdrop-blur-xl border-white/15'
          }`}
        >
          {/* Logo */}
          <a href="#" className="group flex items-center focus:outline-none rounded-full" aria-label="Manchester Auto Gallery">
            <AutogalleryMark
              className={`w-auto drop-shadow-[0_2px_10px_rgba(212,175,55,0.35)] group-hover:scale-105 transition-all duration-500 ${
                isScrolled ? 'h-9 sm:h-11' : 'h-11 sm:h-14'
              }`}
            />
          </a>

          {/* Links — pill group, each link gets a rounded hover background */}
          <nav
            className={`hidden lg:flex items-center gap-1 rounded-full p-1 border transition-colors duration-500 ${
              isScrolled ? 'bg-warm-2 border-[#D4AF37]/25' : 'bg-white/5 border-white/10'
            }`}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className={`rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.18em] font-display font-semibold transition-all duration-300 ${linkClass(
                  link.id
                )}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle overHero={!isScrolled} />
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-mono font-medium transition-all duration-300 ${
                  isScrolled
                    ? 'border-[#D4AF37]/35 bg-paper text-ink hover:bg-warm-2 hover:border-[#D4AF37]'
                    : 'border-white/25 bg-white/10 text-white hover:bg-white/20 hover:border-[#D4AF37]/70'
                }`}
              >
                <span className="text-[#D4AF37] font-bold">{currentCurrency}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 opacity-70 transition-transform duration-300 ${
                    currencyDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-3 w-40 bg-paper border border-[#D4AF37]/30 rounded-2xl shadow-2xl p-1.5 z-50">
                  {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                    <button
                      key={code}
                      onClick={() => {
                        onCurrencyChange(code);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-mono transition-colors flex items-center justify-between ${
                        currentCurrency === code
                          ? 'bg-warm-2 text-gold-mid font-bold'
                          : 'text-body hover:text-ink hover:bg-[#D4AF37]/10'
                      }`}
                    >
                      <span>{code}</span>
                      <span className="text-[11px] text-gold-deep font-semibold">
                        {CURRENCIES[code].symbol}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => onOpenBookingModal()}
              className="group px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3DC82] to-[#C29B28] text-[#0E1013] font-display font-bold text-[11px] uppercase tracking-[0.18em] shadow-lg shadow-[#D4AF37]/25 hover:shadow-xl hover:shadow-[#D4AF37]/45 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#6B520E] shrink-0" />
              <span>Book Viewing</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Dark / light switch (phones — on larger screens it lives in the actions group) */}
          <div className="sm:hidden ml-auto">
            <ThemeToggle overHero={!isScrolled} />
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
              isScrolled
                ? 'border-[#D4AF37]/35 text-ink hover:bg-warm-2'
                : 'border-white/25 text-white hover:bg-white/15'
            }`}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-paper/97 backdrop-blur-2xl flex flex-col justify-between p-6 pt-28 lg:hidden overflow-y-auto">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-2xl px-5 py-4 font-display text-lg font-bold tracking-wider border transition-all duration-300 ${
                    activeId === link.id
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C29B28] text-[#0E1013] border-transparent shadow-md shadow-[#D4AF37]/25'
                      : 'text-ink border-[#D4AF37]/20 hover:bg-warm-2 hover:border-[#D4AF37]'
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-60" />
                </a>
              ))}
            </div>

            <div className="pt-5 border-t border-[#D4AF37]/25">
              <span className="text-[10px] font-mono tracking-[0.3em] text-gold-deep uppercase block mb-3 font-bold">
                Currency
              </span>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                  <button
                    key={code}
                    onClick={() => onCurrencyChange(code)}
                    className={`py-2.5 text-center rounded-full border text-xs font-mono transition-colors ${
                      currentCurrency === code
                        ? 'border-[#D4AF37] bg-warm-2 text-gold-mid font-bold shadow-sm'
                        : 'border-line text-muted hover:border-[#D4AF37]/60'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBookingModal();
              }}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3DC82] to-[#C29B28] text-[#0E1013] font-display text-xs font-bold uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2"
            >
              <span>Book Viewing</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
