import { palette } from '../theme/palette';

export interface RatingSpec {
  /** 1-based severity level (higher = more concern). */
  level: number;
  maxLevel?: number;
  label: string;
  color?: string;
}

function levelColor(level: number, maxLevel: number): string {
  const ratio = maxLevel <= 1 ? 0 : (level - 1) / (maxLevel - 1);

  // High risk — brand red (top tiers and upper half of scale)
  if (level >= maxLevel - 1 || ratio >= 0.55) {
    return palette.lobsterPink;
  }
  if (ratio <= 0.2) return palette.lemonLimeContrast;
  if (ratio <= 0.4) return palette.digitalBlue;
  return palette.pumpkinSpice;
}

function withColor(spec: Omit<RatingSpec, 'color'>): RatingSpec {
  const max = spec.maxLevel ?? 5;
  return { ...spec, maxLevel: max, color: levelColor(spec.level, max) };
}

/** FEMA National Risk Index ratings from Regrid `fema_nri_risk_rating`. */
export function parseNriRiskRating(value: string | undefined | null): RatingSpec | null {
  const normalized = value?.trim().toLowerCase() ?? '';
  if (!normalized) return null;

  if (normalized.includes('very high')) {
    return withColor({ level: 5, label: 'Very high hazard exposure' });
  }
  if (normalized.includes('relatively high') || normalized === 'high') {
    return withColor({ level: 4, label: 'Elevated hazard exposure' });
  }
  if (normalized.includes('moderate')) {
    return withColor({ level: 3, label: 'Moderate hazard exposure' });
  }
  if (normalized.includes('relatively low') || normalized === 'low') {
    return withColor({ level: 2, label: 'Low hazard exposure' });
  }
  if (normalized.includes('very low')) {
    return withColor({ level: 1, label: 'Minimal hazard exposure' });
  }
  return null;
}

/** FEMA flood zone severity from formatted `floodZone` display string. */
export function parseFloodZoneRating(value: string | undefined | null): RatingSpec | null {
  if (!value) return null;
  const zoneMatch = value.match(/Zone\s+([A-Za-z0-9]+)/i);
  const zone = (zoneMatch?.[1] ?? value).toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (!zone || value.includes('Not available')) return null;

  if (zone === 'X' || zone.startsWith('X')) {
    return withColor({ level: 1, label: 'Minimal flood hazard' });
  }
  if (zone === 'B' || zone === 'C' || zone === 'X500') {
    return withColor({ level: 2, label: 'Moderate flood hazard' });
  }
  if (zone === 'D') {
    return withColor({ level: 3, label: 'Undetermined flood hazard' });
  }
  if (zone.startsWith('A') || zone === 'AO' || zone === 'AH') {
    return withColor({ level: 4, label: 'High flood hazard' });
  }
  if (zone.startsWith('V')) {
    return withColor({ level: 5, label: 'Coastal high hazard' });
  }
  return withColor({ level: 3, label: 'Review flood zone' });
}

/** Terrain roughness 0–6 from Regrid `roughness_rating`. */
export function parseRoughnessRating(value: string | undefined | null): RatingSpec | null {
  if (!value) return null;
  const match = value.match(/^(\d+)/);
  if (!match) return null;

  const n = parseInt(match[1], 10);
  if (!Number.isFinite(n) || n < 0 || n > 6) return null;

  const labels = [
    'Level terrain',
    'Nearly level',
    'Slightly rugged',
    'Moderately rugged',
    'Rugged terrain',
    'Highly rugged',
    'Extremely rugged',
  ];

  return withColor({
    level: n + 1,
    maxLevel: 7,
    label: labels[n] ?? 'Unknown terrain',
  });
}

export type RatingSeverity = 'low' | 'moderate' | 'high';

export function ratingSeverity(spec: RatingSpec): RatingSeverity {
  const max = spec.maxLevel ?? 5;
  if (spec.color === palette.lobsterPink || spec.level >= max - 1) return 'high';
  const ratio = max <= 1 ? 0 : (spec.level - 1) / (max - 1);
  if (ratio >= 0.55) return 'high';
  if (ratio <= 0.35) return 'low';
  return 'moderate';
}
