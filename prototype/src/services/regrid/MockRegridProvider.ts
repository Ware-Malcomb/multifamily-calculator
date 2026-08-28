import { mapParcelToSite } from './mapParcelToSite';
import { MOCK_REGRID_PARCELS } from './fixtures';
import type { RegridSiteProvider } from './RegridSiteProvider';
import type { TypeaheadResult } from './types';

function parcelToTypeahead(feature: (typeof MOCK_REGRID_PARCELS)[0]): TypeaheadResult {
  const { properties } = feature;
  const lat = properties.lat ? parseFloat(String(properties.lat)) : undefined;
  const lon = properties.lon ? parseFloat(String(properties.lon)) : undefined;
  const cityState = properties.address?.includes('Austin') ? 'Austin, TX' : 'TX';

  return {
    ll_uuid: properties.ll_uuid,
    address: properties.address ?? '',
    context: cityState,
    path: properties.path ?? '',
    score: 95,
    lat: Number.isFinite(lat) ? lat : undefined,
    lon: Number.isFinite(lon) ? lon : undefined,
  };
}

export class MockRegridProvider implements RegridSiteProvider {
  async searchAddresses(query: string): Promise<TypeaheadResult[]> {
    await delay(150);
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const seen = new Set<string>();
    const results: TypeaheadResult[] = [];

    for (const parcel of MOCK_REGRID_PARCELS) {
      const addr = parcel.properties.address?.toLowerCase() ?? '';
      const apn = parcel.properties.parcelnumb?.toLowerCase() ?? '';
      if (!addr.includes(q) && !apn.includes(q)) continue;
      if (seen.has(parcel.properties.ll_uuid)) continue;
      seen.add(parcel.properties.ll_uuid);
      results.push(parcelToTypeahead(parcel));
    }

    return results;
  }

  async getParcelById(ll_uuid: string) {
    await delay(200);
    const feature = MOCK_REGRID_PARCELS.find((p) => p.properties.ll_uuid === ll_uuid);
    if (!feature) throw new Error('Parcel not found');
    return mapParcelToSite(feature);
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
