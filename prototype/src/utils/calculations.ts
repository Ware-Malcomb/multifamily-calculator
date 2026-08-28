import type {
  BlendedCompRead,
  CalculatorState,
  CompProperty,
  FeasibilitySummary,
  ParkingAssumptions,
  ParkingRatioBasis,
  ProgramMetrics,
  UnitType,
} from '../types';

export function computeBlendedComps(
  comps: CompProperty[],
  selectedIds: string[],
): BlendedCompRead {
  const selected = comps.filter((c) => selectedIds.includes(c.id));
  if (selected.length === 0) {
    return { avgRentPerSf: 0, avgLeaseUpPct: 0, selectedCount: 0 };
  }

  const avgRentPerSf =
    selected.reduce((sum, c) => sum + c.avgRent / c.avgSqFt, 0) / selected.length;
  const avgLeaseUpPct =
    selected.reduce((sum, c) => sum + c.leaseUpPct, 0) / selected.length;

  return {
    avgRentPerSf: Math.round(avgRentPerSf * 100) / 100,
    avgLeaseUpPct: Math.round(avgLeaseUpPct * 10) / 10,
    selectedCount: selected.length,
  };
}

export function defaultRentFromComps(sqFt: number, avgRentPerSf: number): number {
  if (avgRentPerSf <= 0 || sqFt <= 0) return 0;
  return Math.round(sqFt * avgRentPerSf);
}

export function applyCompRentDefaults(
  unitTypes: UnitType[],
  avgRentPerSf: number,
  options?: { force?: boolean },
): UnitType[] {
  if (avgRentPerSf <= 0) return unitTypes;
  const force = options?.force ?? false;
  return unitTypes.map((u) => {
    if (!force && u.rentOverridden) return u;
    const rentPerUnit = defaultRentFromComps(u.sqFt, avgRentPerSf);
    if (!force && rentPerUnit === u.rentPerUnit) return u;
    return { ...u, rentPerUnit, rentOverridden: false };
  });
}

export function computeProgramMetrics(
  unitTypes: UnitType[],
  acreage: number,
): ProgramMetrics {
  const totalUnits = unitTypes.reduce((sum, u) => sum + u.count, 0);
  const totalSqFt = unitTypes.reduce((sum, u) => sum + u.count * u.sqFt, 0);
  const avgUnitSize = totalUnits > 0 ? Math.round(totalSqFt / totalUnits) : 0;
  const densityUnitsPerAcre =
    acreage > 0 ? Math.round((totalUnits / acreage) * 10) / 10 : 0;

  return { totalUnits, totalSqFt, avgUnitSize, densityUnitsPerAcre };
}

export const DEFAULT_PARKING_RATIO = 1.5;
export const DEFAULT_PARKING_RATIO_BASIS: ParkingRatioBasis = 'unit';
export const DEFAULT_PARKING_SHARES = {
  tuckedUnder: 20,
  covered: 30,
  surface: 50,
} as const;

export const DEFAULT_PARKING_RENTS = {
  tuckedUnder: 125,
  covered: 100,
  surface: 50,
} as const;

export function parkingRatioSuffix(basis: ParkingRatioBasis): string {
  if (basis === 'unit') return ' / unit';
  if (basis === 'bedroom') return ' / bedroom';
  return ' / 1,000 SF';
}

export function computeParkingRequirement(
  unitTypes: UnitType[],
  basis: ParkingRatioBasis,
  ratio: number,
): number {
  const totalUnits = unitTypes.reduce((sum, u) => sum + u.count, 0);
  const totalBedrooms = unitTypes.reduce((sum, u) => sum + u.count * u.beds, 0);
  const totalSqFt = unitTypes.reduce((sum, u) => sum + u.count * u.sqFt, 0);
  let raw = 0;
  if (basis === 'unit') raw = totalUnits * ratio;
  else if (basis === 'bedroom') raw = totalBedrooms * ratio;
  else raw = (totalSqFt / 1000) * ratio;
  return Math.round(raw);
}

export function parkingSpacesFromShare(required: number, sharePct: number): number {
  return Math.round(required * (sharePct / 100));
}

export function applyParkingSpaceDefaults(
  parking: ParkingAssumptions,
  required: number,
): ParkingAssumptions {
  const tuckedUnder = parking.tuckedUnderOverridden
    ? parking.tuckedUnder
    : parkingSpacesFromShare(required, parking.tuckedShare);
  const covered = parking.coveredOverridden
    ? parking.covered
    : parkingSpacesFromShare(required, parking.coveredShare);
  const surface = parking.surfaceOverridden
    ? parking.surface
    : parkingSpacesFromShare(required, parking.surfaceShare);

  if (
    tuckedUnder === parking.tuckedUnder &&
    covered === parking.covered &&
    surface === parking.surface
  ) {
    return parking;
  }

  return { ...parking, tuckedUnder, covered, surface };
}

const LABEL_PREFIX_BEDS: Record<string, number> = {
  S: 0,
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
};

/** A1/A4 → 1 bed, B1 → 2 beds, Studio → 0. Null if the label has no series prefix. */
export function inferBedsFromLabel(label: string): number | null {
  const trimmed = label.trim();
  if (!trimmed) return null;
  if (/^studio/i.test(trimmed)) return 0;
  const match = trimmed.match(/^([A-Za-z])/);
  if (!match) return null;
  const beds = LABEL_PREFIX_BEDS[match[1].toUpperCase()];
  return beds === undefined ? null : beds;
}

/** Bedroom-count key used for "% of type" (label series A/B/C… or the beds field). */
export function unitTypeGroupKey(unit: UnitType): number {
  return inferBedsFromLabel(unit.label) ?? unit.beds;
}

export function unitTypeGroupCounts(unitTypes: UnitType[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const unit of unitTypes) {
    const key = unitTypeGroupKey(unit);
    counts.set(key, (counts.get(key) ?? 0) + unit.count);
  }
  return counts;
}

function groupUnitsByType(unitTypes: UnitType[]): Map<number, UnitType[]> {
  const byGroup = new Map<number, UnitType[]>();
  for (const unit of unitTypes) {
    const key = unitTypeGroupKey(unit);
    const list = byGroup.get(key) ?? [];
    list.push(unit);
    byGroup.set(key, list);
  }
  return byGroup;
}

function flattenGroupedUnits(byGroup: Map<number, UnitType[]>): UnitType[] {
  return [...byGroup.keys()]
    .sort((a, b) => a - b)
    .flatMap((key) => byGroup.get(key) ?? []);
}

export function reorderUnitTypes(
  unitTypes: UnitType[],
  fromId: string,
  toId: string,
  place: 'before' | 'after',
): UnitType[] {
  const from = unitTypes.find((u) => u.id === fromId);
  const to = unitTypes.find((u) => u.id === toId);
  if (!from || !to) return unitTypes;

  const groupKey = unitTypeGroupKey(from);
  if (unitTypeGroupKey(to) !== groupKey) return unitTypes;

  if (fromId === toId) return unitTypes;

  const byGroup = groupUnitsByType(unitTypes);
  const group = [...(byGroup.get(groupKey) ?? [])];
  const fromIndex = group.findIndex((u) => u.id === fromId);
  if (fromIndex < 0) return unitTypes;
  const [moved] = group.splice(fromIndex, 1);

  let insertAt = group.findIndex((u) => u.id === toId);
  if (insertAt < 0) return unitTypes;
  if (place === 'after') insertAt += 1;
  group.splice(insertAt, 0, moved);

  byGroup.set(groupKey, group);
  return flattenGroupedUnits(byGroup);
}

export function moveUnitTypeToGroupEnd(unitTypes: UnitType[], fromId: string): UnitType[] {
  const from = unitTypes.find((u) => u.id === fromId);
  if (!from) return unitTypes;
  const groupKey = unitTypeGroupKey(from);
  const group = groupUnitsByType(unitTypes).get(groupKey) ?? [];
  const last = group[group.length - 1];
  if (!last || last.id === fromId) return unitTypes;
  return reorderUnitTypes(unitTypes, fromId, last.id, 'after');
}

export function nextUnitTypeLabel(unitTypes: UnitType[]): { label: string; beds: number } {
  const used = new Set(unitTypes.map((u) => u.label.trim().toUpperCase()));
  let n = 1;
  while (used.has(`A${n}`)) n += 1;
  return { label: `A${n}`, beds: 1 };
}

export interface CostBreakdownSegment {
  label: string;
  value: number;
  color: string;
}

export function computeCostBreakdown(state: CalculatorState): CostBreakdownSegment[] | null {
  if (!state.site) return null;

  const program = computeProgramMetrics(state.unitTypes, state.site.acreage);
  if (program.totalUnits === 0) return null;

  const { costs } = state;
  const hardCostTotal = program.totalSqFt * costs.hardCostPerSf;
  const softCostTotal =
    hardCostTotal * ((costs.aePercent + costs.leaseUpMarketingPercent) / 100);
  const taxesAndFees = costs.propertyTaxAnnual + costs.impactFees;

  return [
    { label: 'Land', value: costs.landPrice, color: '#256eff' },
    { label: 'Hard costs', value: hardCostTotal, color: '#a891de' },
    { label: 'Soft costs', value: softCostTotal, color: '#ff8c42' },
    { label: 'Taxes & fees', value: taxesAndFees, color: '#748c0b' },
  ].filter((s) => s.value > 0);
}

export function computeFeasibility(state: CalculatorState): FeasibilitySummary | null {
  if (!state.site) return null;

  const program = computeProgramMetrics(state.unitTypes, state.site.acreage);
  if (program.totalUnits === 0) return null;

  const blended = computeBlendedComps(state.allComps, state.selectedCompIds);
  const { costs } = state;

  const hardCostTotal = program.totalSqFt * costs.hardCostPerSf;
  const softCostTotal =
    hardCostTotal * ((costs.aePercent + costs.leaseUpMarketingPercent) / 100);
  const totalProjectCost =
    costs.landPrice +
    hardCostTotal +
    softCostTotal +
    costs.propertyTaxAnnual +
    costs.impactFees;

  const monthlyGrossRevenue = state.unitTypes.reduce(
    (sum, u) => sum + u.count * u.rentPerUnit,
    0,
  );
  const avgRentToday =
    program.totalUnits > 0 ? Math.round(monthlyGrossRevenue / program.totalUnits) : 0;

  const projectDurationMonths = Math.ceil(
    program.totalUnits / Math.max(costs.leaseUpPaceUnitsPerMonth, 1),
  );

  return {
    totalProjectCost: Math.round(totalProjectCost),
    costPerUnit: Math.round(totalProjectCost / program.totalUnits),
    avgRentToday,
    annualGrossRevenue: Math.round(monthlyGrossRevenue * 12),
    stabilizedRentPerSf: blended.avgRentPerSf,
    densityUnitsPerAcre: program.densityUnitsPerAcre,
    avgUnitSize: program.avgUnitSize,
    projectDurationMonths,
    landPrice: costs.landPrice,
    totalUnits: program.totalUnits,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
