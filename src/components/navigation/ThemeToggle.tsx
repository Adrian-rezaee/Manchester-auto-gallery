import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

interface ThemeToggleProps {
  /** true while the header floats over the dark hero (transparent glass state) */
  overHero?: boolean;
}

/**
 * Light / dark switch with custom inline SVGs — a sun and a moon sit inside the track,
 * and the gold knob slides between them.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ overHero = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`relative shrink-0 w-[68px] h-9 rounded-full border transition-colors duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60 ${
        overHero
          ? 'bg-white/10 border-white/25 hover:border-[#D4AF37]/70'
          : 'bg-warm-2 border-[#D4AF37]/35 hover:border-[#D4AF37]'
      }`}
    >
      {/* Sun (left track icon) */}
      <svg
        viewBox="0 0 24 24"
        className={`absolute left-2 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-opacity duration-500 ${
          isDark ? 'opacity-70' : 'opacity-0'
        } ${overHero ? 'text-white' : 'text-ink'}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
      </svg>

      {/* Moon (right track icon) */}
      <svg
        viewBox="0 0 24 24"
        className={`absolute right-2 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-opacity duration-500 ${
          isDark ? 'opacity-0' : 'opacity-70'
        } ${overHero ? 'text-white' : 'text-ink'}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5a8.5 8.5 0 1 0 10.8 10.8Z" />
      </svg>

      {/* Knob */}
      <span
        className={`absolute top-1 left-1 w-7 h-7 rounded-full bg-gradient-to-br from-[#E8C858] to-[#B38E22] shadow-[0_2px_10px_rgba(212,175,55,0.5)] flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(.4,0,.2,1)] ${
          isDark ? 'translate-x-8' : 'translate-x-0'
        }`}
      >
        {isDark ? (
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#0E1013]" fill="currentColor" aria-hidden="true">
            <path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5a8.5 8.5 0 1 0 10.8 10.8Z" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 text-[#0E1013]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" fill="currentColor" />
            <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
          </svg>
        )}
      </span>
    </button>
  );
};
