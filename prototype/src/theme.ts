import { createTheme, type MantineColorsTuple } from '@mantine/core';
import { paletteShades } from './theme/palette';

const toTuple = (shades: readonly string[]): MantineColorsTuple =>
  shades as unknown as MantineColorsTuple;

export const theme = createTheme({
  primaryColor: 'digitalBlue',
  fontFamily: 'Inter, system-ui, sans-serif',
  headings: {
    fontFamily: '"Stack Sans Headline", system-ui, sans-serif',
    fontWeight: '600',
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
  },
  other: {
    appBackground: '#ffffff',
  },
});
