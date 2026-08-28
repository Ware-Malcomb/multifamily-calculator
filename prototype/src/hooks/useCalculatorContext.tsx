import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_COSTS, DEFAULT_UNIT_TYPES, MOCK_COMPS } from '../data/mockData';
import { costService, MOCK_COST_BENCHMARKS } from '../services/costs';
import { siteService } from '../services/regrid';
import type { TypeaheadResult } from '../services/regrid/types';
import type { CalculatorState, CompProperty, CostAssumptions, SiteData, StepId, UnitType } from '../types';
import {
  applyCompRentDefaults,
  applyParkingSpaceDefaults,
  computeBlendedComps,
  computeFeasibility,
  computeParkingRequirement,
  defaultRentFromComps,
  DEFAULT_PARKING_RENTS,
  DEFAULT_PARKING_SHARES,
  moveUnitTypeToGroupEnd,
  nextUnitTypeLabel,
  parkingSpacesFromShare,
  reorderUnitTypes as reorderUnitTypeList,
} from '../utils/calculations';

type ResettableCostKey = 'hardCostPerSf' | 'aePercent' | 'leaseUpMarketingPercent';

interface CalculatorContextValue {
  state: CalculatorState;
  blended: ReturnType<typeof computeBlendedComps>;
  feasibility: ReturnType<typeof computeFeasibility>;
  siteLoading: boolean;
  siteError: string | null;
  setActiveStep: (step: StepId) => void;
  searchSites: (query: string) => Promise<TypeaheadResult[]>;
  selectSiteByRegridId: (ll_uuid: string) => Promise<void>;
  clearSite: () => void;
  updateSiteField: <K extends keyof SiteData>(key: K, value: SiteData[K]) => void;
  toggleComp: (compId: string) => void;
  retainSelectedComps: (allowedIds: string[]) => void;
  setRentHurdle: (value: number | null) => void;
  setProductType: (value: string) => void;
  setBuildingType: (value: string) => void;
  setBuildingCount: (value: number) => void;
  updateUnitType: (id: string, patch: Partial<UnitType>) => void;
  addUnitType: () => string;
  removeUnitType: (id: string) => void;
  reorderUnitTypes: (fromId: string, toId: string, place?: 'before' | 'after') => void;
  moveUnitTypeToEnd: (fromId: string) => void;
  updateParking: <K extends keyof CalculatorState['parking']>(
    key: K,
    value: CalculatorState['parking'][K],
  ) => void;
  resetParkingType: (type: 'tuckedUnder' | 'covered' | 'surface') => void;
  updateCosts: <K extends keyof CostAssumptions>(key: K, value: CostAssumptions[K]) => void;
  resetCostToDefault: (key: ResettableCostKey) => void;
  resetRentsToDefault: () => void;
  resetUnitRentToDefault: (id: string) => void;
  loadCalculatorState: (next: CalculatorState) => void;
}

const CalculatorContext = createContext<CalculatorContextValue | null>(null);

const initialState: CalculatorState = {
  activeStep: 'site',
  site: null,
  allComps: MOCK_COMPS,
  selectedCompIds: ['comp-1', 'comp-2', 'comp-3'],
  rentHurdlePerSf: null,
  productType: 'Garden',
  buildingType: 'Wood frame',
  buildingCount: 4,
  unitTypes: applyCompRentDefaults(
    DEFAULT_UNIT_TYPES,
    computeBlendedComps(MOCK_COMPS, ['comp-1', 'comp-2', 'comp-3']).avgRentPerSf,
  ),
  parking: {
    tuckedUnder: 29,
    covered: 43,
    surface: 72,
    tuckedUnderRent: DEFAULT_PARKING_RENTS.tuckedUnder,
    coveredRent: DEFAULT_PARKING_RENTS.covered,
    surfaceRent: DEFAULT_PARKING_RENTS.surface,
    ratioBasis: 'unit',
    ratio: 1.5,
    tuckedShare: DEFAULT_PARKING_SHARES.tuckedUnder,
    coveredShare: DEFAULT_PARKING_SHARES.covered,
    surfaceShare: DEFAULT_PARKING_SHARES.surface,
    tuckedUnderOverridden: false,
    coveredOverridden: false,
    surfaceOverridden: false,
  },
  costs: DEFAULT_COSTS,
};

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CalculatorState>(initialState);
  const [siteLoading, setSiteLoading] = useState(false);
  const [siteError, setSiteError] = useState<string | null>(null);

  const blended = useMemo(
    () => computeBlendedComps(state.allComps, state.selectedCompIds),
    [state.allComps, state.selectedCompIds],
  );

  const feasibility = useMemo(() => computeFeasibility(state), [state]);

  // Keep non-overridden unit rents aligned with the selected-comp blend
  useEffect(() => {
    setState((s) => {
      const blend = computeBlendedComps(s.allComps, s.selectedCompIds);
      const next = applyCompRentDefaults(s.unitTypes, blend.avgRentPerSf);
      if (next.every((u, i) => u === s.unitTypes[i])) return s;
      return { ...s, unitTypes: next };
    });
  }, [state.allComps, state.selectedCompIds]);

  useEffect(() => {
    setState((s) => {
      const required = computeParkingRequirement(s.unitTypes, s.parking.ratioBasis, s.parking.ratio);
      const next = applyParkingSpaceDefaults(s.parking, required);
      if (next === s.parking) return s;
      return { ...s, parking: next };
    });
  }, [
    state.unitTypes,
    state.parking.ratio,
    state.parking.ratioBasis,
    state.parking.tuckedShare,
    state.parking.coveredShare,
    state.parking.surfaceShare,
    state.parking.tuckedUnderOverridden,
    state.parking.coveredOverridden,
    state.parking.surfaceOverridden,
  ]);

  // Pull hard / soft cost benchmarks (mock FRED) for non-overridden fields
  useEffect(() => {
    let cancelled = false;
    costService.getBenchmarks().then((benchmarks) => {
      if (cancelled) return;
      setState((s) => {
        const c = s.costs;
        return {
          ...s,
          costs: {
            ...c,
            hardCostPerSf: c.hardCostOverridden ? c.hardCostPerSf : benchmarks.hardCostPerSf,
            hardCostSource: benchmarks.hardCostSource,
            aePercent: c.aePercentOverridden ? c.aePercent : benchmarks.aePercent,
            aeSource: benchmarks.aeSource,
            leaseUpMarketingPercent: c.leaseUpMarketingOverridden
              ? c.leaseUpMarketingPercent
              : benchmarks.leaseUpMarketingPercent,
            leaseUpMarketingSource: benchmarks.leaseUpMarketingSource,
          },
        };
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const searchSites = useCallback(async (query: string) => {
    return siteService.searchAddresses(query);
  }, []);

  const selectSiteByRegridId = useCallback(async (ll_uuid: string) => {
    setSiteLoading(true);
    setSiteError(null);
    try {
      const site = await siteService.getParcelById(ll_uuid);
      setState((s) => ({
        ...s,
        site,
        costs: {
          ...s.costs,
          landPrice: site.taxValuation,
          landPriceSource: site.source,
          propertyTaxAnnual: site.annualTax ?? s.costs.propertyTaxAnnual,
          propertyTaxSource: site.source,
        },
      }));
    } catch (err) {
      setSiteError(err instanceof Error ? err.message : 'Failed to load parcel');
    } finally {
      setSiteLoading(false);
    }
  }, []);

  const value = useMemo<CalculatorContextValue>(
    () => ({
      state,
      blended,
      feasibility,
      siteLoading,
      siteError,
      setActiveStep: (step) => setState((s) => ({ ...s, activeStep: step })),
      searchSites,
      selectSiteByRegridId,
      clearSite: () => {
        setSiteError(null);
        setState((s) => ({ ...s, site: null }));
      },
      updateSiteField: (key, value) =>
        setState((s) => (s.site ? { ...s, site: { ...s.site, [key]: value } } : s)),
      toggleComp: (compId) =>
        setState((s) => {
          const selected = s.selectedCompIds.includes(compId)
            ? s.selectedCompIds.filter((id) => id !== compId)
            : [...s.selectedCompIds, compId];
          return { ...s, selectedCompIds: selected };
        }),
      retainSelectedComps: (allowedIds) =>
        setState((s) => {
          const allowed = new Set(allowedIds);
          const next = s.selectedCompIds.filter((id) => allowed.has(id));
          if (next.length === s.selectedCompIds.length) return s;
          return { ...s, selectedCompIds: next };
        }),
      setRentHurdle: (value) => setState((s) => ({ ...s, rentHurdlePerSf: value })),
      setProductType: (value) => setState((s) => ({ ...s, productType: value })),
      setBuildingType: (value) => setState((s) => ({ ...s, buildingType: value })),
      setBuildingCount: (value) => setState((s) => ({ ...s, buildingCount: value })),
      updateUnitType: (id, patch) =>
        setState((s) => {
          const blend = computeBlendedComps(s.allComps, s.selectedCompIds);
          return {
            ...s,
            unitTypes: s.unitTypes.map((u) => {
              if (u.id !== id) return u;
              const next: UnitType = { ...u, ...patch };
              if (patch.rentPerUnit !== undefined) {
                next.rentOverridden = true;
              } else if (patch.sqFt !== undefined && !next.rentOverridden) {
                next.rentPerUnit = defaultRentFromComps(next.sqFt, blend.avgRentPerSf);
              }
              return next;
            }),
          };
        }),
      addUnitType: () => {
        const id = `unit-${Date.now()}`;
        setState((s) => {
          const { label, beds } = nextUnitTypeLabel(s.unitTypes);
          const blend = computeBlendedComps(s.allComps, s.selectedCompIds);
          const sqFt = 750;
          const newUnit: UnitType = {
            id,
            label,
            beds,
            baths: 1,
            count: 0,
            sqFt,
            rentPerUnit: defaultRentFromComps(sqFt, blend.avgRentPerSf),
            rentOverridden: false,
          };
          return { ...s, unitTypes: [...s.unitTypes, newUnit] };
        });
        return id;
      },
      removeUnitType: (id) =>
        setState((s) => ({
          ...s,
          unitTypes: s.unitTypes.filter((u) => u.id !== id),
        })),
      reorderUnitTypes: (fromId, toId, place = 'before') =>
        setState((s) => ({
          ...s,
          unitTypes: reorderUnitTypeList(s.unitTypes, fromId, toId, place),
        })),
      moveUnitTypeToEnd: (fromId) =>
        setState((s) => ({
          ...s,
          unitTypes: moveUnitTypeToGroupEnd(s.unitTypes, fromId),
        })),
      updateParking: (key, value) =>
        setState((s) => {
          const parking = { ...s.parking, [key]: value };
          if (key === 'tuckedUnder') parking.tuckedUnderOverridden = true;
          if (key === 'covered') parking.coveredOverridden = true;
          if (key === 'surface') parking.surfaceOverridden = true;
          return { ...s, parking };
        }),
      resetParkingType: (type) =>
        setState((s) => {
          const required = computeParkingRequirement(
            s.unitTypes,
            s.parking.ratioBasis,
            s.parking.ratio,
          );
          if (type === 'tuckedUnder') {
            return {
              ...s,
              parking: {
                ...s.parking,
                tuckedUnderOverridden: false,
                tuckedUnder: parkingSpacesFromShare(required, s.parking.tuckedShare),
              },
            };
          }
          if (type === 'covered') {
            return {
              ...s,
              parking: {
                ...s.parking,
                coveredOverridden: false,
                covered: parkingSpacesFromShare(required, s.parking.coveredShare),
              },
            };
          }
          return {
            ...s,
            parking: {
              ...s.parking,
              surfaceOverridden: false,
              surface: parkingSpacesFromShare(required, s.parking.surfaceShare),
            },
          };
        }),
      updateCosts: (key, value) =>
        setState((s) => {
          const costs = { ...s.costs, [key]: value };
          if (key === 'hardCostPerSf') costs.hardCostOverridden = true;
          if (key === 'aePercent') costs.aePercentOverridden = true;
          if (key === 'leaseUpMarketingPercent') costs.leaseUpMarketingOverridden = true;
          return { ...s, costs };
        }),
      resetCostToDefault: (key) =>
        setState((s) => {
          const b = MOCK_COST_BENCHMARKS;
          if (key === 'hardCostPerSf') {
            return {
              ...s,
              costs: {
                ...s.costs,
                hardCostPerSf: b.hardCostPerSf,
                hardCostSource: b.hardCostSource,
                hardCostOverridden: false,
              },
            };
          }
          if (key === 'aePercent') {
            return {
              ...s,
              costs: {
                ...s.costs,
                aePercent: b.aePercent,
                aeSource: b.aeSource,
                aePercentOverridden: false,
              },
            };
          }
          return {
            ...s,
            costs: {
              ...s.costs,
              leaseUpMarketingPercent: b.leaseUpMarketingPercent,
              leaseUpMarketingSource: b.leaseUpMarketingSource,
              leaseUpMarketingOverridden: false,
            },
          };
        }),
      resetRentsToDefault: () =>
        setState((s) => {
          const blend = computeBlendedComps(s.allComps, s.selectedCompIds);
          return {
            ...s,
            unitTypes: applyCompRentDefaults(s.unitTypes, blend.avgRentPerSf, { force: true }),
          };
        }),
      resetUnitRentToDefault: (id) =>
        setState((s) => {
          const blend = computeBlendedComps(s.allComps, s.selectedCompIds);
          return {
            ...s,
            unitTypes: s.unitTypes.map((u) =>
              u.id === id
                ? {
                    ...u,
                    rentPerUnit: defaultRentFromComps(u.sqFt, blend.avgRentPerSf),
                    rentOverridden: false,
                  }
                : u,
            ),
          };
        }),
      loadCalculatorState: (next) => {
        setSiteError(null);
        setSiteLoading(false);
        setState(JSON.parse(JSON.stringify(next)) as CalculatorState);
      },
    }),
    [state, blended, feasibility, siteLoading, siteError, searchSites, selectSiteByRegridId],
  );

  return (
    <CalculatorContext.Provider value={value}>{children}</CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const ctx = useContext(CalculatorContext);
  if (!ctx) throw new Error('useCalculator must be used within CalculatorProvider');
  return ctx;
}

export function useCompById(compId: string): CompProperty | undefined {
  const { state } = useCalculator();
  return state.allComps.find((c) => c.id === compId);
}
