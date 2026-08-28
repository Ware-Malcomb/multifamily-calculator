import type { SiteData } from '../../types';
import type { TypeaheadResult } from './types';

export interface RegridSiteProvider {
  searchAddresses(query: string): Promise<TypeaheadResult[]>;
  getParcelById(ll_uuid: string): Promise<SiteData>;
}
