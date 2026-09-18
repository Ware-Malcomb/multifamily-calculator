import type { RegridMultiPolygon, RegridPolygon } from '../services/regrid/types';

export type StepId = 'site' | 'comps' | 'program' | 'costs';

export interface DataSource {
  name: string;
  date: string;
}

export interface SiteData {
  address: string;
  source: DataSource;
  regridId: string;
  regridPath?: string;
  lat?: number;
  lon?: number;
  geometry?: RegridPolygon | RegridMultiPolygon;

  /** County APN — Regrid `parcelnumb` */
  parcelId: string;
  /** Regrid `ll_gisacre` */
  acreage: number;
  /** Regrid `ll_gissqft` */
  sqFt?: number;

  county?: string;
  city?: string;
  state?: string;

  /** Regrid `usedesc` or `lbcs_function_desc` */
  landUse: string;
  /** Regrid `zoning_type` (standardized) */
  zoningType: string;
  /** Regrid `zoning_subtype` */
  zoningSubtype: string;
  /** Regrid `zoning` + `zoning_description` */
  zoning: string;

  /** Regrid `parval` */
  taxValuation: number;
  landValue?: number;
  improvementValue?: number;
  annualTax?: number;
  taxYear?: string;
  valuationType?: string;

  /** Regrid `fema_flood_zone` */
  floodZone: string;
  floodRisk?: string;
  terrainRoughness?: string;

  owner?: string;

  /** Area median income for the site's metro / region (annual, household) */
  areaMedianIncome?: number;
}

export interface CompUnitMix {
  /** e.g. "1bd / 1ba" */
  unitType: string;
  /** Share of total units, 0–100 */
  pctOfMix: number;
  sqFt: number;
}

export interface CompProperty {
  id: string;
  name: string;
  distanceMi: number;
  unitCount: number;
  unitMix: string;
  unitMixDetail: CompUnitMix[];
  avgSqFt: number;
  avgRent: number;
  leaseUpPct: number;
  /** Year the property was built / delivered */
  yearBuilt: number;
  source: DataSource;
}

export interface UnitType {
  id: string;
  label: string;
  beds: number;
  baths: number;
  count: number;
  sqFt: number;
  rentPerUnit: number;
  /** True when the user has manually edited rent away from the comp-blend default */
  rentOverridden: boolean;
}

export interface ParkingAssumptions {
  tuckedUnder: number;
  covered: number;
  surface: number;
  tuckedUnderRent: number;
  coveredRent: number;
  surfaceRent: number;
  /** How the jurisdiction applies the parking ratio */
  ratioBasis: ParkingRatioBasis;
  /** Spaces per unit, per bedroom, or per 1,000 SF */
  ratio: number;
  /** Share of required spaces allocated to this type (0–100) */
  tuckedShare: number;
  coveredShare: number;
  surfaceShare: number;
  tuckedUnderOverridden: boolean;
  coveredOverridden: boolean;
  surfaceOverridden: boolean;
}

export type ParkingRatioBasis = 'unit' | 'bedroom' | 'sqft';

export interface CostAssumptions {
  hardCostPerSf: number;
  hardCostSource: DataSource;
  hardCostOverridden: boolean;
  aePercent: number;
  aeSource: DataSource;
  aePercentOverridden: boolean;
  leaseUpMarketingPercent: number;
  leaseUpMarketingSource: DataSource;
  leaseUpMarketingOverridden: boolean;
  propertyTaxAnnual: number;
  propertyTaxSource: DataSource;
  impactFees: number;
  impactFeesSource: DataSource;
  landPrice: number;
  landPriceSource: DataSource;
  leaseUpPaceUnitsPerMonth: number;
}

export interface BlendedCompRead {
  avgRentPerSf: number;
  avgLeaseUpPct: number;
  selectedCount: number;
}

export interface ProgramMetrics {
  totalUnits: number;
  totalSqFt: number;
  avgUnitSize: number;
  densityUnitsPerAcre: number;
}

export interface FeasibilitySummary {
  totalProjectCost: number;
  costPerUnit: number;
  avgRentToday: number;
  /** Annual gross revenue from unit rents (monthly rent × 12) */
  annualGrossRevenue: number;
  stabilizedRentPerSf: number;
  densityUnitsPerAcre: number;
  avgUnitSize: number;
  projectDurationMonths: number;
  landPrice: number;
  totalUnits: number;
}

export interface CalculatorState {
  activeStep: StepId;
  /** Steps the user has advanced past via Next (timeline progress). */
  completedSteps: StepId[];
  site: SiteData | null;
  allComps: CompProperty[];
  selectedCompIds: string[];
  rentHurdlePerSf: number | null;
  productType: string;
  buildingType: string;
  buildingCount: number;
  unitTypes: UnitType[];
  parking: ParkingAssumptions;
  costs: CostAssumptions;
}
