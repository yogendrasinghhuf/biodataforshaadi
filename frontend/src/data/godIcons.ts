export interface GodIcon {
  id: string;
  label: string;
  /** Inline SVG markup, viewBox 0 0 100 100 */
  svg: string;
}

export const godIcons: GodIcon[] = [
  {
    id: 'om',
    label: 'Om',
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='50' y='76' text-anchor='middle' font-size='60' fill='#F57C00' font-family='serif' font-weight='600'>ॐ</text></svg>"
  },
  {
    id: 'shree',
    label: 'Shree',
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='50' y='74' text-anchor='middle' font-size='62' fill='#C49B1F' font-family='serif' font-weight='600'>श्री</text></svg>"
  },
  {
    id: 'lotus',
    label: 'Lotus',
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><g fill='#E91E63'><ellipse cx='50' cy='42' rx='10' ry='22'/><ellipse cx='32' cy='50' rx='10' ry='20' transform='rotate(-30 32 50)'/><ellipse cx='68' cy='50' rx='10' ry='20' transform='rotate(30 68 50)'/><ellipse cx='22' cy='62' rx='9' ry='16' transform='rotate(-60 22 62)'/><ellipse cx='78' cy='62' rx='9' ry='16' transform='rotate(60 78 62)'/></g><circle cx='50' cy='58' r='5' fill='#FFC107'/></svg>"
  },
  {
    id: 'diya',
    label: 'Diya',
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path fill='#D97706' d='M22,58 Q50,80 78,58 L72,72 Q50,84 28,72 Z'/><path fill='#FFC107' d='M50,55 Q44,42 50,28 Q56,42 50,55 Z'/></svg>"
  },
  {
    id: 'khanda',
    label: 'Khanda',
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='22' fill='none' stroke='#1A3F6B' stroke-width='4'/><rect x='47' y='10' width='6' height='80' fill='#1A3F6B'/><path fill='none' stroke='#1A3F6B' stroke-width='3' d='M28,30 Q18,50 28,70'/><path fill='none' stroke='#1A3F6B' stroke-width='3' d='M72,30 Q82,50 72,70'/></svg>"
  },
  {
    id: 'ikonkar',
    label: 'Ik Onkar',
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='50' y='76' text-anchor='middle' font-size='60' fill='#1A3F6B' font-family='serif' font-weight='600'>ੴ</text></svg>"
  },
  {
    id: 'crescent',
    label: 'Crescent',
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path fill='#4CAF50' fill-rule='evenodd' d='M50,12 A38,38 0 1,1 50,88 A38,38 0 1,1 50,12 Z M60,22 A28,28 0 1,1 60,78 A28,28 0 1,1 60,22 Z'/><polygon fill='#4CAF50' points='70,38 73,46 81,46 75,52 77,60 70,55 63,60 65,52 59,46 67,46'/></svg>"
  },
  {
    id: 'cross',
    label: 'Cross',
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect x='42' y='10' width='16' height='80' fill='#E8634E'/><rect x='18' y='34' width='64' height='16' fill='#E8634E'/></svg>"
  },
  {
    id: 'star-of-david',
    label: 'Star of David',
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><g fill='none' stroke='#1976D2' stroke-width='5' stroke-linejoin='miter'><polygon points='50,12 86,75 14,75'/><polygon points='50,88 14,25 86,25'/></g></svg>"
  },
  {
    id: 'dharma',
    label: 'Dharma Wheel',
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='35' fill='none' stroke='#FBC02D' stroke-width='6'/><circle cx='50' cy='50' r='5' fill='#FBC02D'/><g stroke='#FBC02D' stroke-width='5'><line x1='50' y1='17' x2='50' y2='83'/><line x1='17' y1='50' x2='83' y2='50'/><line x1='26' y1='26' x2='74' y2='74'/><line x1='74' y1='26' x2='26' y2='74'/></g></svg>"
  }
];

const DEFAULT_ID = 'om';

/** Look up the SVG markup for a given icon id. Falls back to Om if the id is unknown or stale (e.g. from a pre-refactor saved state holding an emoji character). */
export const getIconSvg = (id: string | undefined | null): string => {
  const match = godIcons.find(g => g.id === id);
  return (match || godIcons.find(g => g.id === DEFAULT_ID) || godIcons[0]).svg;
};

/** Normalize a possibly-stale id (e.g. an emoji left over from the pre-refactor state) to a valid id. */
export const normalizeIconId = (id: string | undefined | null): string => {
  if (id && godIcons.some(g => g.id === id)) return id;
  return DEFAULT_ID;
};
