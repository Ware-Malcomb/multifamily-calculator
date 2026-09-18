import { createTheme, type MantineColorsTuple } from '@mantine/core';
import { paletteShades } from './theme/palette';

const toTuple = (shades: readonly string[]): MantineColorsTuple =>
  shades as unknown as MantineColorsTuple;

export const theme = createTheme({
  primaryColor: 'digitalBlue',
  fontFamily: '"DM Sans", system-ui, sans-serif',
  headings: {
    fontFamily: '"Plus Jakarta Sans", "DM Sans", system-ui, sans-serif',
    fontWeight: '500',
  },
  defaultRadius: 'md',
  white: '#ffffff',
  black: '#1a1a1a',
  colors: {
    digitalBlue: toTuple(paletteShades.digitalBlue),
    lemonLime: toTuple(paletteShades.lemonLime),
    softPeriwinkle: toTuple(paletteShades.softPeriwinkle),
    pumpkinSpice: toTuple(paletteShades.pumpkinSpice),
    lobsterPink: toTuple(paletteShades.lobsterPink),
    orchidPink: toTuple(paletteShades.orchidPink),
    sunflower: toTuple(paletteShades.sunflower),
  },
  other: {
    appBackground: '#ffffff',
  },
});
