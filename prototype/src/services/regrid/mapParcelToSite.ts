import type { SiteData } from '../../types';
import type { RegridParcelFeature } from './types';
import { REGRID_FIELD_HINTS } from './schemaReference';

export const NOT_IN_REGRID = 'Not available from Regrid';

function formatSourceDate(properties: RegridParcelFeature['properties']): string {
  if (properties.taxyear) return properties.taxyear;
  if (properties.fema_flood_zone_data_date) {
    const d = new Date(properties.fema_flood_zone_data_date);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  }
  return new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function str(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim();
  return s.length > 0 ? s : undefined;
}

function formatZoning(properties: RegridParcelFeature['properties']): string {
  const code = str(properties.zoning);
  const desc = str(properties.zoning_description);
  if (code && desc) return `${code} (${desc})`;
  if (code) return code;
  return NOT_IN_REGRID;
}

function formatLandUse(properties: RegridParcelFeature['properties']): string {
  return (
    str(properties.lbcs_function_desc) ??
    str(properties.usedesc) ??
    str(properties.lbcs_activity_desc) ??
    NOT_IN_REGRID
  );
}

function formatFloodZone(properties: RegridParcelFeature['properties']): string {
  const zone = str(properties.fema_flood_zone);
  const subtype = str(properties.fema_flood_zone_subtype);
  if (zone && subtype) return `Zone ${zone} — ${subtype}`;
  if (zone) return `Zone ${zone}`;
  return NOT_IN_REGRID;
}

function formatRoughness(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = typeof value === 'number' ? value : parseInt(String(value), 10);
  if (!Number.isFinite(n)) return undefined;
  const labels = [
    'Level',
    'Nearly level',
    'Slightly rugged',
    'Intermediately rugged',
    'Moderately rugged',
    'Highly rugged',
    'Extremely rugged',
  ];
  return `${n} — ${labels[n] ?? 'Unknown'}`;
}

function parseCoord(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : undefined;
}

function parseNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : undefined;
}

export function mapParcelToSite(feature: RegridParcelFeature): SiteData {
  const { properties, geometry } = feature;
  const acreage = properties.ll_gisacre ?? properties.gisacre ?? 0;
  const taxValuation = properties.parval ?? properties.landval ?? 0;
  const parcelDisplay = str(properties.parcelnumb) || properties.ll_uuid;

  const polygonGeometry =
    geometry?.type === 'Polygon' || geometry?.type === 'MultiPolygon'
      ? geometry
      : undefined;

  return {
    address: str(properties.address) || 'Unknown address',
    source: { name: 'Regrid', date: formatSourceDate(properties) },
    regridId: properties.ll_uuid,
    regridPath: str(properties.path),
    lat: parseCoord(properties.lat),
    lon: parseCoord(properties.lon),
    geometry: polygonGeometry,

    parcelId: parcelDisplay,
    acreage: Math.round(acreage * 10) / 10,
    sqFt: parseNumber(properties.ll_gissqft),

    county: str(properties.county),
    city: str(properties.scity) ?? str(properties.city),
    state: str(properties.state2) ?? str(properties.state),

    landUse: formatLandUse(properties),
    zoningType: str(properties.zoning_type) ?? NOT_IN_REGRID,
    zoningSubtype: str(properties.zoning_subtype) ?? NOT_IN_REGRID,
    zoning: formatZoning(properties),

    taxValuation: Math.round(taxValuation),
    landValue: parseNumber(properties.landval),
    improvementValue: parseNumber(properties.improvval),
    annualTax: parseNumber(properties.taxamt),
    taxYear: str(properties.taxyear),
    valuationType: str(properties.parvaltype),

    floodZone: formatFloodZone(properties),
    floodRisk: str(properties.fema_nri_risk_rating),
    terrainRoughness: formatRoughness(properties.roughness_rating),

    owner: str(properties.owner),
    /** Prototype: Austin–Round Rock MSA 4-person AMI (HUD-style mock) */
    areaMedianIncome: 119_300,
  };
}

export { REGRID_FIELD_HINTS };
