import React from 'react';

/**
 * MANCHESTER AUTO GALLERY — logo lockup (gold winged "M" crest + AUTOGALLERY wordmark).
 * Rendered from /images/logo.webp (transparent background, works on dark and light).
 */

interface MarkProps {
  className?: string;
}

export const AutogalleryMark: React.FC<MarkProps> = ({ className }) => (
  <img
    src="/images/logo.webp"
    alt="Manchester Auto Gallery"
    width={1046}
    height={443}
    decoding="async"
    draggable={false}
    className={className}
  />
);

/** Display name of the brand, for text contexts */
export const BRAND_NAME = 'Manchester Auto Gallery';
