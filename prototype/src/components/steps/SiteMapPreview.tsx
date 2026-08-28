import { Badge, Box, Group, Stack, Text } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import type { SiteData } from '../../types';
import type { RegridMultiPolygon, RegridPolygon } from '../../services/regrid/types';
import { palette, paletteShades, semanticColors } from '../../theme/palette';
import { SatelliteMapBackdrop } from './SatelliteMapBackdrop';

interface SiteMapPreviewProps {
  site: SiteData;
  /** Compact full-bleed map for the print/export report hero */
  variant?: 'default' | 'report';
}

type LonLat = [number, number];

function getExteriorRings(
  geometry: RegridPolygon | RegridMultiPolygon | undefined,
): LonLat[][] {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.length > 0 ? [geometry.coordinates[0] as LonLat[]] : [];
  }
  return geometry.coordinates.map((polygon) => polygon[0] as LonLat[]);
}

function fallbackParcelRing(lat?: number, lon?: number): LonLat[] {
  const baseLat = lat ?? 30.27;
  const baseLon = lon ?? -97.74;
  const dLat = 0.00045;
  const dLon = 0.00055;
  return [
    [baseLon - dLon, baseLat - dLat * 0.6],
    [baseLon + dLon * 0.85, baseLat - dLat],
    [baseLon + dLon, baseLat + dLat * 0.9],
    [baseLon + dLon * 0.15, baseLat + dLat],
    [baseLon - dLon * 0.75, baseLat + dLat * 0.45],
    [baseLon - dLon, baseLat - dLat * 0.6],
  ];
}

function getRingBounds(ring: LonLat[]) {
  const lons = ring.map(([lon]) => lon);
  const lats = ring.map(([, lat]) => lat);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  return {
    minLon,
    maxLon,
    minLat,
    maxLat,
    lonSpan: maxLon - minLon || 0.0001,
    latSpan: maxLat - minLat || 0.0001,
  };
}

function expandBounds(bounds: ReturnType<typeof getRingBounds>, zoomOutFactor = 2.2) {
  const lonPad = (bounds.lonSpan * (zoomOutFactor - 1)) / 2;
  const latPad = (bounds.latSpan * (zoomOutFactor - 1)) / 2;
  return {
    minLon: bounds.minLon - lonPad,
    maxLon: bounds.maxLon + lonPad,
    minLat: bounds.minLat - latPad,
    maxLat: bounds.maxLat + latPad,
    lonSpan: bounds.lonSpan + lonPad * 2,
    latSpan: bounds.latSpan + latPad * 2,
  };
}

function lonLatToSvg(
  lon: number,
  lat: number,
  bounds: ReturnType<typeof expandBounds>,
  padding = 10,
): [number, number] {
  const inner = 100 - padding * 2;
  const x = padding + ((lon - bounds.minLon) / bounds.lonSpan) * inner;
  const y = padding + (1 - (lat - bounds.minLat) / bounds.latSpan) * inner;
  return [x, y];
}

function ringToSvgPoints(ring: LonLat[], zoomOutFactor = 2.2, padding = 10): string {
  const bounds = expandBounds(getRingBounds(ring), zoomOutFactor);
  return ring
    .map(([lon, lat]) => lonLatToSvg(lon, lat, bounds, padding).join(','))
    .join(' ');
}

function ringCentroid(ring: LonLat[]): LonLat {
  const sum = ring.reduce(
    (acc, [lon, lat]) => [acc[0] + lon, acc[1] + lat] as LonLat,
    [0, 0] as LonLat,
  );
  return [sum[0] / ring.length, sum[1] / ring.length];
}

export function SiteMapPreview({ site, variant = 'default' }: SiteMapPreviewProps) {
  const isReport = variant === 'report';
  const rings = getExteriorRings(site.geometry);
  const primaryRing = rings[0] ?? fallbackParcelRing(site.lat, site.lon);
  const mapBounds = expandBounds(getRingBounds(primaryRing), isReport ? 2.8 : 2.2);
  const parcelPoints = ringToSvgPoints(primaryRing, isReport ? 2.8 : 2.2);
  const [centroidLon, centroidLat] = ringCentroid(primaryRing);
  const [centroidX, centroidY] = lonLatToSvg(centroidLon, centroidLat, mapBounds);
  return (
    <Box
      className={isReport ? 'site-map-preview site-map-preview--report' : 'site-map-preview'}
      pos="relative"
    >
      <svg
        className="site-map-preview__canvas"
        viewBox="0 0 100 100"
        preserveAspectRatio={isReport ? 'xMidYMid slice' : 'xMidYMid meet'}
        aria-hidden
      >
        <SatelliteMapBackdrop idPrefix={isReport ? 'site-map-report' : 'site-map'} />

        <polygon
          points={parcelPoints}
          fill={paletteShades.digitalBlue[1]}
          fillOpacity={0.42}
          stroke="#ffffff"
          strokeWidth="1.4"
        />
        <polygon
          points={parcelPoints}
          fill="none"
          stroke={palette.digitalBlue}
          strokeWidth="0.9"
        />

        <circle cx={centroidX} cy={centroidY} r="4.5" fill={palette.digitalBlue} fillOpacity={0.22} />
        <circle cx={centroidX} cy={centroidY} r="2.4" fill={palette.digitalBlue} stroke="#ffffff" strokeWidth="0.5" />
      </svg>

      {!isReport && (
        <>
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
            Prototype map
          </Badge>

          <Stack className="site-map-preview__footer" gap={2}>
            <Text size="sm" fw={600} lineClamp={1}>
              {site.address}
            </Text>
            <Text size="xs" c="dimmed">
              {site.acreage} ac
              {site.lat !== undefined && site.lon !== undefined
                ? ` · ${site.lat.toFixed(4)}, ${site.lon.toFixed(4)}`
                : ''}
            </Text>
          </Stack>
        </>
      )}
    </Box>
  );
}
