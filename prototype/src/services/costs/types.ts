import type { DataSource } from '../../types';

/** Benchmark hard / soft costs from FRED + firm pay-app history (mockable). */
export interface CostBenchmarks {
  hardCostPerSf: number;
  hardCostSource: DataSource;
  aePercent: number;
  aeSource: DataSource;
  leaseUpMarketingPercent: number;
  leaseUpMarketingSource: DataSource;
}

export interface CostBenchmarkProvider {
  getBenchmarks(): Promise<CostBenchmarks>;
}
