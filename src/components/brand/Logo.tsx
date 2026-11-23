import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

/**
 * TAK — logo (white / dark wordmark with the gold "A").
 * Transparent background. Two versions of the same artwork:
 *   images/logo.webp       white letters  -> for dark surfaces
 *   images/logo-dark.webp  dark letters   -> for light surfaces
 * The version follows the page theme automatically; pass `onDark` to force the white-letter
 * version where the logo always sits on a dark surface (e.g. the header over the hero).
 */

interface MarkProps {
  className?: string;
  /** always use the white-letter version (logo sits on a dark surface regardless of theme) */
  onDark?: boolean;
}

export const AutogalleryMark: React.FC<MarkProps> = ({ className, onDark = false }) => {
  const { theme } = useTheme();
  const whiteLetters = onDark || theme === 'dark';
  return (
    <img
      src={`${import.meta.env.BASE_URL}images/${whiteLetters ? 'logo' : 'logo-dark'}.webp`}
      alt="TAK"
      width={1352}
      height={407}
      decoding="async"
      draggable={false}
      className={className}
    />
  );
};

/** Display name of the brand, for text contexts */
export const BRAND_NAME = 'Manchester Auto Gallery';
