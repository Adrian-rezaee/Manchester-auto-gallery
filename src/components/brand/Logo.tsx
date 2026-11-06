import React from 'react';

/**
 * MANCHESTER AUTO GALLERY — logo lockup (gold winged "M" crest + AUTOGALLERY wordmark).
 * Rendered from /images/logo-sm.webp (transparent background, works on dark and light).
 */

interface MarkProps {
  className?: string;
}

export const AutogalleryMark: React.FC<MarkProps> = ({ className }) => (
  <img
    src={`${import.meta.env.BASE_URL}images/logo.webp`}
    alt="Manchester Auto Gallery"
    width={480}
    height={203}
    decoding="async"
    draggable={false}
    className={className}
  />
);

/** Display name of the brand, for text contexts */
export const BRAND_NAME = 'Manchester Auto Gallery';
