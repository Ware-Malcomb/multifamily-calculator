import type { SiteData } from '../../types';
import type { TypeaheadResult } from './types';

export class HttpRegridProvider {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async searchAddresses(_query: string): Promise<TypeaheadResult[]> {
    throw new Error(
      `Regrid HTTP provider not configured. Set VITE_REGRID_API_BASE and a backend proxy. Base: ${this.baseUrl}`,
    );
  }

  async getParcelById(_ll_uuid: string): Promise<SiteData> {
    throw new Error(
      `Regrid HTTP provider not configured. Set VITE_REGRID_API_BASE and a backend proxy. Base: ${this.baseUrl}`,
    );
  }
}
