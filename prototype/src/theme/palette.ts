export const palette = {
  pumpkinSpice: '#ff8c42',
  lobsterPink: '#e15554',
  lemonLime: '#c2e812',
  /** Readable lime for icons, text, and bars on white backgrounds */
  lemonLimeContrast: '#748c0b',
  digitalBlue: '#256eff',
  softPeriwinkle: '#a891de',
} as const;

export type PaletteColor = keyof typeof palette;

/** Mantine 10-shade tuples (index 6 = base hex) */
export const paletteShades = {
  digitalBlue: [
    '#e8f0ff',
    '#d0e0ff',
    '#a8c7ff',
    '#80aeff',
    '#5895ff',
    '#256eff',
    '#1e58d9',
    '#1843b3',
    '#122e8c',
    '#0c1966',
  ],
  lemonLime: [
    '#f7fce8',
    '#eef9d1',
    '#e0f3a3',
    '#c8de4a',
    '#b5d41f',
    '#c2e812',
    '#748c0b',
    '#5f7309',
    '#4d5e07',
    '#263004',
  ],
  softPeriwinkle: [
    '#f3f0fa',
    '#e7e1f5',
    '#cfc3eb',
    '#b7a5e1',
    '#9f87d7',
    '#a891de',
    '#8674b2',
    '#655786',
    '#433a59',
    '#221d2d',
  ],
  pumpkinSpice: [
    '#fff3eb',
    '#ffe7d7',
    '#ffcfaf',
    '#ffb787',
    '#ff9f5f',
    '#ff8c42',
    '#cc7035',
    '#995428',
    '#66381a',
    '#331c0d',
  ],
  lobsterPink: [
    '#fdeaea',
    '#fad5d5',
    '#f5abab',
    '#f08181',
    '#eb5757',
    '#e15554',
    '#b44443',
    '#873332',
    '#5a2222',
    '#2d1111',
  ],
} as const;

/** Semantic mapping for field tags and UI accents */
export const semanticColors = {
  pulled: 'digitalBlue',
  input: 'lemonLime',
  computed: 'softPeriwinkle',
  overridden: 'pumpkinSpice',
  success: 'lemonLime',
  error: 'lobsterPink',
  warning: 'pumpkinSpice',
} as const;
