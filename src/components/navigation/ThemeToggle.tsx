import React, { useEffect, useId, useRef, useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';

interface ThemeToggleProps {
  /** true while the header floats over the dark hero (transparent glass state) */
  overHero?: boolean;
}

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
// symmetric ease-in-out: the knob accelerates and settles smoothly, no overshoot
const GLIDE = 'cubic-bezier(0.65, 0, 0.35, 1)';
const RAYS =
  'M12 2.6v2.4M12 19v2.4M2.6 12H5M19 12h2.4M5.35 5.35l1.7 1.7M16.95 16.95l1.7 1.7M18.65 5.35l-1.7 1.7M7.05 16.95l-1.7 1.7';

/**
 * Light / dark switch.
 *  - One SVG morphs between sun and crescent moon: the core grows while a mask disc slides in
 *    and cuts the crescent, and the rays spin in and shrink away.
 *  - The track cross-fades between a warm day sky and a night sky with stars.
 *  - Only transform + opacity are animated, so it stays smooth on phones.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ overHero = false }) => {
  const { theme, toggleTheme } = useTheme();
  const themeIsDark = theme === 'dark';
  // The toggle animates first; the page-wide theme swap is applied a moment later so the
  // heavy repaint never competes with the knob's animation.
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const isDark = optimistic ?? themeIsDark;

  useEffect(() => {
    setOptimistic(null);
  }, [themeIsDark]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleClick = () => {
    if (optimistic !== null) return;
    setOptimistic(!themeIsDark);
    timer.current = window.setTimeout(toggleTheme, 120);
  };
  const maskId = 'moon-cut-' + useId().replace(/:/g, '');

  const t = (prop: string, ms = 560) => `${prop} ${ms}ms ${GLIDE}`;

  return (
    <button
      type="button"
      onClick={handleClick}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`theme-toggle group relative shrink-0 w-[68px] h-9 rounded-full border transition-colors duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60 ${
        overHero
          ? 'bg-white/10 border-white/25 hover:border-[#D4AF37]/70'
          : 'bg-warm-2 border-[#D4AF37]/35 hover:border-[#D4AF37]'
      }`}
    >
      {/* Track scenery (clipped to the pill) */}
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full" aria-hidden="true">
        {/* night sky */}
        <span
          className="absolute inset-0 bg-gradient-to-br from-[#1b1e27] via-[#12141a] to-[#0a0b0e] motion-reduce:transition-none"
          style={{ opacity: isDark ? 1 : 0, transition: 'opacity 600ms ease' }}
        />
        {/* stars (left side, revealed as the knob moves right) */}
        <svg viewBox="0 0 66 34" className="absolute inset-0 h-full w-full" fill="#F3E5AB">
          {[
            [13, 11, 1.2],
            [22, 23, 0.8],
            [28, 10, 0.7],
            [9, 24, 0.7],
            [19, 15, 0.6],
          ].map(([cx, cy, r], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              style={{
                opacity: isDark ? 0.95 : 0,
                transform: isDark ? 'scale(1)' : 'scale(0.2)',
                transformBox: 'fill-box',
                transformOrigin: 'center',
                transition: `opacity 500ms ease ${isDark ? 150 + i * 70 : 0}ms, transform 500ms ${EASE} ${isDark ? 150 + i * 70 : 0}ms`,
              }}
            />
          ))}
        </svg>
        {/* day glints (right side) */}
        <svg viewBox="0 0 66 34" className="absolute inset-0 h-full w-full" fill="#D4AF37">
          {[
            [48, 12, 1.1],
            [57, 22, 0.8],
            [54, 10, 0.6],
          ].map(([cx, cy, r], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              style={{
                opacity: isDark ? 0 : overHero ? 0.7 : 0.55,
                transition: 'opacity 500ms ease',
              }}
            />
          ))}
        </svg>
      </span>

      {/* Knob */}
      <span
        className="absolute left-[3px] top-[3px] flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#F3DC82] via-[#E1BC47] to-[#B38E22] shadow-[0_2px_10px_rgba(212,175,55,0.55)] will-change-[translate] motion-reduce:!transition-none group-hover:scale-105 group-active:scale-90"
        style={{
          translate: isDark ? '32px 0' : '0 0',
          transition: `translate 520ms ${GLIDE}, scale 250ms ${EASE}`,
        }}
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-[#1a1304]" aria-hidden="true" focusable="false">
          <defs>
            <mask id={maskId}>
              <rect width="24" height="24" fill="#fff" />
              <circle
                cx="17"
                cy="7.5"
                r="7.5"
                fill="#000"
                style={{
                  transform: isDark ? 'translate(0,0)' : 'translate(14px,-12px)',
                  transition: t('transform'),
                }}
              />
            </mask>
          </defs>
          {/* sun core / moon body */}
          <g mask={`url(#${maskId})`}>
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="currentColor"
              style={{
                transform: isDark ? 'scale(0.98)' : 'scale(0.56)',
                transformBox: 'fill-box',
                transformOrigin: 'center',
                transition: t('transform'),
              }}
            />
          </g>
          {/* rays */}
          <path
            d={RAYS}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            style={{
              opacity: isDark ? 0 : 1,
              transform: isDark ? 'rotate(70deg) scale(0.4)' : 'rotate(0deg) scale(1)',
              transformOrigin: '12px 12px',
              transition: `transform 600ms ${EASE}, opacity 350ms ease`,
            }}
          />
        </svg>
      </span>
    </button>
  );
};
