/**
 * Manchester Auto Gallery — inventory records.
 *
 * Product titles are kept for identification, but every claim-based
 * specification, figure, price or statement is withheld and shown as
 * "---------" until verified by the client.
 */

const BASE = import.meta.env.BASE_URL;

export const HIDDEN = '------';

/** Default price (in AED) shown for every vehicle until real prices are set. */
export const DEFAULT_PRICE_AED = 1500000;

export type VehicleCategory = 'Hypercar' | 'Grand Tourer' | 'Track Icon' | 'Bespoke';

export interface Vehicle {
  id: string;
  manufacturer: string;
  model: string;
  year: number;
  category: VehicleCategory;
  heroImage: string;
  gallery: string[];
  /** price in AED — converted to the selected currency when displayed */
  priceAed: number;
  // claim-based data — withheld
  engine: string;
  powerHp: string;
  torqueNm: string;
  acceleration: string;
  topSpeed: string;
  transmission: string;
  drivetrain: string;
  exteriorColor: string;
  interiorColor: string;
  mileage: string;
  status: string;
  description: string;
  chassisNumber: string;
  provenance: string;
}

const hidden = {
  priceAed: DEFAULT_PRICE_AED,
  engine: HIDDEN,
  powerHp: HIDDEN,
  torqueNm: HIDDEN,
  acceleration: HIDDEN,
  topSpeed: HIDDEN,
  transmission: HIDDEN,
  drivetrain: HIDDEN,
  exteriorColor: HIDDEN,
  interiorColor: HIDDEN,
  mileage: HIDDEN,
  status: HIDDEN,
  description: HIDDEN,
  chassisNumber: HIDDEN,
  provenance: HIDDEN,
};

export const VEHICLES: Vehicle[] = [
  {
    id: 'autogallery-01',
    manufacturer: 'Bugatti',
    model: 'Chiron Pur Sport',
    year: 2024,
    category: 'Hypercar',
    heroImage: `${BASE}images/white-hypercar-marble.webp`,
    gallery: [
      `${BASE}images/white-hypercar-marble.webp`,
      `${BASE}images/white-cockpit-gold.webp`,
      `${BASE}images/white-aero-gold.webp`,
    ],
    ...hidden,
  },
  {
    id: 'autogallery-02',
    manufacturer: 'Koenigsegg',
    model: 'Jesko Attack',
    year: 2024,
    category: 'Hypercar',
    heroImage: `${BASE}images/white-aero-gold.webp`,
    gallery: [`${BASE}images/white-aero-gold.webp`, `${BASE}images/white-hypercar-marble.webp`],
    ...hidden,
  },
  {
    id: 'autogallery-03',
    manufacturer: 'Rolls-Royce',
    model: 'Phantom Extended',
    year: 2024,
    category: 'Grand Tourer',
    heroImage: `${BASE}images/white-showroom-gold.webp`,
    gallery: [`${BASE}images/white-showroom-gold.webp`, `${BASE}images/white-cockpit-gold.webp`],
    ...hidden,
  },
  {
    id: 'autogallery-04',
    manufacturer: 'Pagani',
    model: 'Utopia',
    year: 2024,
    category: 'Hypercar',
    heroImage: `${BASE}images/white-hypercar-marble.webp`,
    gallery: [`${BASE}images/white-hypercar-marble.webp`, `${BASE}images/white-cockpit-gold.webp`],
    ...hidden,
  },
  {
    id: 'autogallery-05',
    manufacturer: 'Ferrari',
    model: 'Daytona SP3',
    year: 2023,
    category: 'Track Icon',
    heroImage: `${BASE}images/white-aero-gold.webp`,
    gallery: [`${BASE}images/white-aero-gold.webp`, `${BASE}images/white-showroom-gold.webp`],
    ...hidden,
  },
  {
    id: 'autogallery-06',
    manufacturer: 'Porsche',
    model: '911 GT3 RS',
    year: 2024,
    category: 'Track Icon',
    heroImage: `${BASE}images/white-hypercar-marble.webp`,
    gallery: [`${BASE}images/white-hypercar-marble.webp`, `${BASE}images/white-cockpit-gold.webp`],
    ...hidden,
  },
];

export const CURRENCIES = {
  AED: { symbol: 'AED', rate: 1.0, label: 'Dirham (AED)' },
  USD: { symbol: '$', rate: 0.2722, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.2515, label: 'Euro (€)' },
  GBP: { symbol: '£', rate: 0.2155, label: 'Pound (£)' },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export const formatPrice = (aed: number, code: CurrencyCode): string => {
  const { symbol, rate } = CURRENCIES[code];
  const value = Math.round(aed * rate).toLocaleString('en-US');
  return code === 'AED' ? `AED ${value}` : `${symbol}${value}`;
};
