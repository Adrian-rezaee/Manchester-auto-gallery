export type PaintColorKey =
  | 'desertPearl'
  | 'pearlWhite'
  | 'imperialGold'
  | 'champagne'
  | 'liquidPlatinum'
  | 'roseGold';

export interface PaintColorOption {
  key: PaintColorKey;
  name: string;
  hex: string;
  accentHex: string;
  metalness: number;
  roughness: number;
}

export const PAINT_COLORS: Record<PaintColorKey, PaintColorOption> = {
  desertPearl: {
    key: 'desertPearl',
    name: 'Desert Pearl Cream',
    hex: '#EDE4D1',
    accentHex: '#D4AF37',
    metalness: 0.35,
    roughness: 0.22,
  },
  pearlWhite: {
    key: 'pearlWhite',
    name: 'Blanc Nacré & Or 24K',
    hex: '#FBFBF9',
    accentHex: '#D4AF37',
    metalness: 0.3,
    roughness: 0.18,
  },
  imperialGold: {
    key: 'imperialGold',
    name: 'Sovereign 24K Gold',
    hex: '#D4AF37',
    accentHex: '#FFF0A8',
    metalness: 1.0,
    roughness: 0.14,
  },
  champagne: {
    key: 'champagne',
    name: 'Champagne Aurum',
    hex: '#E6D3A3',
    accentHex: '#B38E22',
    metalness: 0.85,
    roughness: 0.16,
  },
  liquidPlatinum: {
    key: 'liquidPlatinum',
    name: 'Gleaming Platinum',
    hex: '#DDE1E6',
    accentHex: '#D4AF37',
    metalness: 1.0,
    roughness: 0.1,
  },
  roseGold: {
    key: 'roseGold',
    name: 'Dubai Rosé Gold',
    hex: '#E7BFA9',
    accentHex: '#C58F72',
    metalness: 0.95,
    roughness: 0.14,
  },
};

export const PAINT_ORDER: PaintColorKey[] = [
  'desertPearl',
  'pearlWhite',
  'imperialGold',
  'champagne',
  'liquidPlatinum',
  'roseGold',
];
