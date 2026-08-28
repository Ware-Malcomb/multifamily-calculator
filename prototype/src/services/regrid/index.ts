import { HttpRegridProvider } from './HttpRegridProvider';
import { MockRegridProvider } from './MockRegridProvider';
import type { RegridSiteProvider } from './RegridSiteProvider';

function createSiteService(): RegridSiteProvider {
  const baseUrl = import.meta.env.VITE_REGRID_API_BASE;
  if (baseUrl) {
    return new HttpRegridProvider(baseUrl);
  }
  return new MockRegridProvider();
}

export const siteService = createSiteService();
