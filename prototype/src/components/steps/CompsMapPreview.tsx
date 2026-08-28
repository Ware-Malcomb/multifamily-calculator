import { Badge, Box, Group, Stack, Text } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import type { CompProperty, SiteData } from '../../types';
import { palette, paletteShades, semanticColors } from '../../theme/palette';
import { SatelliteMapBackdrop } from './SatelliteMapBackdrop';

interface CompsMapPreviewProps {
  site: SiteData;
  comps: CompProperty[];
  selectedCompIds: string[];
  radiusMi: number;
}

const SVG_PADDING = 8;
const SVG_INNER = 100 - SVG_PADDING * 2;
const SITE_X = 50;
const SITE_Y = 50;

function bearingFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 360;
  }
  return (hash / 360) * Math.PI * 2;
}

/** Miles → SVG units using equal X/Y scale so the radius stays a perfect circle. */
function milesToSvg(miles: number, maxMiles: number): number {
  return (miles / maxMiles) * (SVG_INNER / 2);
}

export function CompsMapPreview({
  site,
  comps,
  selectedCompIds,
  radiusMi,
}: CompsMapPreviewProps) {
  const maxMiles = Math.max(radiusMi, 0.5) * 1.15;
  const radiusSvg = milesToSvg(radiusMi, maxMiles);

  const markers = comps.map((comp) => {
    const bearing = bearingFromId(comp.id);
    const r = milesToSvg(comp.distanceMi, maxMiles);
    // SVG y grows downward; negate cos so north is up
    const x = SITE_X + r * Math.sin(bearing);
    const y = SITE_Y - r * Math.cos(bearing);
    return { ...comp, x, y, selected: selectedCompIds.includes(comp.id) };
  });

  return (
    <Box className="site-map-preview" pos="relative">
      <svg
        className="site-map-preview__canvas"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <SatelliteMapBackdrop idPrefix="comps-map" />

        <circle
          cx={SITE_X}
          cy={SITE_Y}
          r={radiusSvg}
          fill={paletteShades.digitalBlue[1]}
          fillOpacity={0.18}
          stroke="#ffffff"
          strokeWidth="0.7"
          strokeDasharray="1.5 1"
        />

        <circle cx={SITE_X} cy={SITE_Y} r="4.8" fill={palette.digitalBlue} fillOpacity={0.22} />
        <circle
          cx={SITE_X}
          cy={SITE_Y}
          r="2.4"
          fill={palette.digitalBlue}
          stroke="#ffffff"
          strokeWidth="0.5"
        />

        {markers.map((m) => (
          <g key={m.id}>
            <circle
              cx={m.x}
              cy={m.y}
              r={m.selected ? 2.6 : 2}
              fill={m.selected ? palette.softPeriwinkle : '#5a6b4f'}
              stroke="#ffffff"
              strokeWidth="0.6"
            />
            {m.selected && (
              <circle
                cx={m.x}
                cy={m.y}
                r="4.2"
                fill="none"
                stroke={palette.softPeriwinkle}
                strokeWidth="0.5"
                opacity={0.7}
              />
            )}
          </g>
        ))}
      </svg>

      <Group className="site-map-preview__controls" gap={4}>
        <Box className="site-map-preview__control-btn" aria-hidden>
          <IconPlus size={14} />
        </Box>
        <Box className="site-map-preview__control-btn" aria-hidden>
          <IconMinus size={14} />
        </Box>
      </Group>

      <Badge
        className="site-map-preview__badge"
        size="xs"
        variant="light"
        color={semanticColors.computed}
      >
        Prototype map · {radiusMi} mi
      </Badge>

      <Stack className="site-map-preview__footer" gap={2}>
        <Text size="sm" fw={600} lineClamp={1}>
          {site.address}
        </Text>
        <Text size="xs" c="dimmed">
          {comps.length} comps within {radiusMi} mi
          {selectedCompIds.length > 0 ? ` · ${selectedCompIds.length} selected` : ''}
        </Text>
      </Stack>
    </Box>
  );
}
