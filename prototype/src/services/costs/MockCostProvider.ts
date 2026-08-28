import type { CostBenchmarkProvider, CostBenchmarks } from './types';

/**
 * Prototype stand-in for FRED construction cost indexes + firm pay-app averages.
 * Replace with a live FRED / backend proxy in production.
 */
export const MOCK_COST_BENCHMARKS: CostBenchmarks = {
  hardCostPerSf: 218,
  hardCostSource: { name: 'FRED + Pay-app avg', date: 'Jun 2026' },
  aePercent: 6.5,
  aeSource: { name: 'FRED + Pay-app avg', date: 'Jun 2026' },
  leaseUpMarketingPercent: 2.5,
  leaseUpMarketingSource: { name: 'FRED + Pay-app avg', date: 'Jun 2026' },
};

export class MockCostProvider implements CostBenchmarkProvider {
  async getBenchmarks(): Promise<CostBenchmarks> {
    await new Promise((r) => setTimeout(r, 80));
    return { ...MOCK_COST_BENCHMARKS };
  }
}

export const costService: CostBenchmarkProvider = new MockCostProvider();
