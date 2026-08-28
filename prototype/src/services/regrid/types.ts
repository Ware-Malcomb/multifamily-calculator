export interface RegridPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface RegridMultiPolygon {
  type: 'MultiPolygon';
  coordinates: number[][][][];
}

export type RegridGeometry = RegridPolygon | RegridMultiPolygon;

export interface RegridParcelProperties {
  ll_uuid: string;
  path?: string;
  address?: string;
  parcelnumb?: string;
  ll_gisacre?: number;
  ll_gissqft?: number;
  gisacre?: number;
  scity?: string;
  city?: string;
  county?: string;
  state2?: string;
  state?: string;
  usedesc?: string;
  lbcs_function_desc?: string;
  lbcs_activity_desc?: string;
  zoning?: string;
  zoning_description?: string;
  zoning_type?: string;
  zoning_subtype?: string;
  fema_flood_zone?: string;
  fema_flood_zone_subtype?: string;
  fema_flood_zone_data_date?: string;
  fema_nri_risk_rating?: string;
  roughness_rating?: number;
  parval?: number;
  landval?: number;
  improvval?: number;
  taxamt?: number;
  parvaltype?: string;
  taxyear?: string;
  owner?: string;
  lat?: string | number;
  lon?: string | number;
  [key: string]: unknown;
}

export interface RegridParcelFeature {
  type: 'Feature';
  properties: RegridParcelProperties;
  geometry?: RegridPolygon | RegridMultiPolygon | { type: 'Point'; coordinates: number[] } | null;
}

export interface RegridFeatureCollection {
  type: 'FeatureCollection';
  features: RegridParcelFeature[];
}

export interface RegridTypeaheadResponse {
  parcel_centroids: RegridFeatureCollection;
}

export interface TypeaheadResult {
  ll_uuid: string;
  address: string;
  context: string;
  path: string;
  score: number;
  lat?: number;
  lon?: number;
}