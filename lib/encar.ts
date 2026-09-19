// Server-side Encar access.
//
// Not a public API: no docs, no token required, no stability guarantee.
// Encar drops /search/car/list/* from datacenter egress, so `searchCars`
// reports `unavailable` rather than throwing and the browser retries the same
// request from the visitor's own connection (see components/ClientCars).
// The detail endpoint is not blocked and stays server-rendered.

import {
  buildQuery, buildFeaturedQuery, extractFacets, metaUrl, normalize,
  searchUrl, vehicleUrl, SEARCH_URL,
  type Car, type Filters, type SearchResponse, type SortKey,
  type VehicleDetail,
} from './encar-shared';

export {
  buildQuery, buildFeaturedQuery, FEATURED_MAKES, imageUrl, normalize,
  searchUrl, vehicleUrl, SORTS, YEAR_FLOOR,
  type Car, type Filters, type SortKey, type VehicleDetail,
} from './encar-shared';


const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
  'Referer': 'https://www.encar.com/',
  'Origin': 'https://www.encar.com',
};

async function getJson<T>(url: string, revalidate = 300): Promise<T> {
  const res = await fetch(url, { headers: BROWSER_HEADERS, next: { revalidate } });
  if (!res.ok) {
    throw Object.assign(new Error(`Encar API returned ${res.status}`), {
      status: res.status,
    });
  }
  return res.json() as Promise<T>;
}

export type SearchOutcome = {
  count: number;
  cars: Car[];
  /** True when the upstream call failed and the browser should retry it. */
  unavailable: boolean;
};

export async function searchCars(
  filters: Filters = {},
  opts: { offset?: number; limit?: number; sort?: SortKey } = {},
): Promise<SearchOutcome> {
  try {
    const data = await getJson<SearchResponse>(searchUrl(filters, opts));
    return {
      count: data.Count ?? 0,
      cars: (data.SearchResults ?? []).map(normalize),
      unavailable: false,
    };
  } catch {
    return { count: 0, cars: [], unavailable: true };
  }
}

/**
 * Ten cars for the homepage: seven German, three from anything else, each from
 * a random offset so the sample changes between visits.
 */
export async function getFeatured(): Promise<SearchOutcome> {
  const pick = async (q: string, want: number) => {
    const url = (offset: number, limit: number) =>
      `${SEARCH_URL}?count=true&q=${encodeURIComponent(q)}`
      + `&sr=${encodeURIComponent(`|ModifiedDate|${offset}|${limit}`)}`;
    const head = await getJson<SearchResponse>(url(0, 1), 0);
    const total = head.Count ?? 0;
    if (!total) return [];
    const offset = Math.max(0, Math.floor(Math.random() * Math.max(1, total - want)));
    const page = await getJson<SearchResponse>(url(offset, want), 0);
    return (page.SearchResults ?? []).map(normalize);
  };

  try {
    const [german, rest] = await Promise.all([
      pick(buildFeaturedQuery(), 7),
      pick(buildQuery(), 3),
    ]);
    const seen = new Set<string>();
    const cars = [...german, ...rest]
      .filter((c) => !seen.has(c.id) && seen.add(c.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
    return { count: cars.length, cars, unavailable: false };
  } catch {
    return { count: 0, cars: [], unavailable: true };
  }
}

export type VehicleOutcome =
  | { status: 'ok'; car: VehicleDetail }
  /** Encar answered and said there is no such car. */
  | { status: 'missing' }
  /** We never got an answer -- the browser should try instead. */
  | { status: 'unavailable' };

export async function getVehicle(id: string): Promise<VehicleOutcome> {
  try {
    const car = await getJson<VehicleDetail>(vehicleUrl(id), 600);
    return { status: 'ok', car };
  } catch (e) {
    // A real 404 means the listing is gone; anything else means we were
    // refused, and showing "not found" for that would be a lie.
    if ((e as { status?: number }).status === 404) return { status: 'missing' };
    return { status: 'unavailable' };
  }
}

/**
 * Makes for the filters, read from Encar's own metadata so the list always
 * matches what actually has 2026 stock. Uses the same blocked search host, so
 * callers must tolerate an empty list.
 */
export async function getMakes(): Promise<{ name: string; count: number }[]> {
  return facets('Manufacturer', {});
}

/** Model groups for one make. Encar only exposes these per-manufacturer. */
export async function getModelGroups(make?: string): Promise<{ name: string; count: number }[]> {
  if (!make) return [];
  return facets('ModelGroup', { make });
}

async function facets(name: string, filters: Filters) {
  const data = await getJson<unknown>(metaUrl(filters), 3600).catch(() => null);
  return data ? extractFacets(data, name) : [];
}
