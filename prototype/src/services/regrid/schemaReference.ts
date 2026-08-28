/**
 * Regrid parcel schema field reference.
 * @see https://support.regrid.com/docs/regrid-parcel-schemas
 */
export const REGRID_SCHEMA_CATEGORIES = {
  identification: 'Identification',
  geometry: 'Parcel geometry & area',
  geographies: 'Related geographies',
  landUse: 'Land use & zoning',
  assessment: 'Assessment & tax',
  environment: 'Environment & risk',
  ownership: 'Ownership',
} as const;

export const REGRID_FIELD_HINTS = {
  ll_uuid: 'Stable Regrid parcel ID for API lookups',
  parcelnumb: 'County assessor parcel number (APN)',
  ll_gisacre: 'Acres calculated from parcel boundary geometry',
  ll_gissqft: 'Square feet calculated from parcel geometry',
  scity: 'Parcel situs city',
  county: 'County name',
  state2: 'Two-letter state code',
  usedesc: 'County-provided land use description',
  lbcs_function_desc: 'Standardized LBCS economic function (nationwide comparable)',
  zoning_type: 'Standardized zoning category (Premium)',
  zoning_subtype: 'Standardized zoning detail (Premium)',
  zoning: 'Local jurisdiction zoning code',
  parval: 'Total assessed parcel value',
  landval: 'Assessed land value',
  improvval: 'Assessed improvement (building) value',
  taxamt: 'Annual property tax bill',
  taxyear: 'Tax year for assessment values',
  parvaltype: 'How the assessor values the parcel (e.g. Market, Assessed)',
  fema_flood_zone: 'FEMA flood zone from Flood Insurance Rate Map',
  fema_nri_risk_rating: 'FEMA National Risk Index rating',
  roughness_rating: 'Terrain roughness index (0 = level, 6 = extremely rugged)',
  owner: 'Parcel owner name',
} as const;
