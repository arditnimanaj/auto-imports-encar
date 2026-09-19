// Pure query-building and normalising, safe to run on the server or in the
// browser. lib/encar.ts wraps these for server fetches; components/ClientCars
// uses them when the server call was blocked upstream.

export const SEARCH_URL = 'https://api.encar.com/search/car/list/premium';
export const IMAGES = 'https://ci.encar.com';

/** Only 2026-and-newer cars are ever shown. Year is stored as YYYYMM. */
export const YEAR_FLOOR = 202601;

export const SORTS = {
  newest: 'ModifiedDate',
  priceAsc: 'PriceAsc',
  priceDesc: 'PriceDesc',
  mileageAsc: 'MileageAsc',
  mileageDesc: 'MileageDesc',
  year: 'Year',
} as const;
export type SortKey = keyof typeof SORTS;

export type Filters = {
  make?: string;
  /** Korean API value, e.g. 가솔린 -- see FUEL_OPTIONS in lib/i18n.ts. */
  fuel?: string;
  /** Encar's ModelGroup, e.g. "X5". Only meaningful alongside a make. */
  model?: string;
  yearFrom?: number;
  priceMin?: number;
  priceMax?: number;
};

export type Car = {
  id: string;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  month: number;
  mileageKm: number | null;
  priceKrw: number | null;
  fuel: string | null;
  transmission: string | null;
  region: string | null;
  imageUrl: string | null;
};

/**
 * Encar encodes filters as a dotted expression, clauses joined by `._.` and
 * closed with `.)`. That trailing dot is required -- without it the response
 * body comes back empty.
 */
export function buildQuery(f: Filters = {}): string {
  // CarType.N = imported. SellType.일반 = outright sale: lease (리스) and rent
  // (렌트) listings quote a takeover/deposit figure in `Price`, not the car's
  // price, so including them would show a 2026 BMW i5 at about EUR 700.
  const clauses = ['Hidden.N', 'CarType.N', 'SellType.일반'];
  if (f.make) clauses.push(`Manufacturer.${f.make}`);
  if (f.fuel) clauses.push(`FuelType.${f.fuel}`);
  if (f.model) clauses.push(`ModelGroup.${f.model}`);

  const floor = Math.max(f.yearFrom ? f.yearFrom * 100 + 1 : YEAR_FLOOR, YEAR_FLOOR);
  clauses.push(`Year.range(${floor}..)`);

  if (f.priceMin != null || f.priceMax != null) {
    clauses.push(`Price.range(${f.priceMin ?? ''}..${f.priceMax ?? ''})`);
  }
  return `(And.${clauses.join('._.')}.)`;
}

export function searchUrl(
  filters: Filters = {},
  { offset = 0, limit = 20, sort = 'newest' as SortKey } = {},
): string {
  const take = Math.min(Math.max(limit, 1), 200); // API honours up to 200
  return `${SEARCH_URL}?count=true`
    + `&q=${encodeURIComponent(buildQuery(filters))}`
    + `&sr=${encodeURIComponent(`|${SORTS[sort]}|${offset}|${take}`)}`;
}

export function imageUrl(path?: string | null): string | null {
  return path ? `${IMAGES}${path}` : null;
}

export type RawCar = {
  Id: string; Manufacturer: string; Model: string; Badge?: string;
  Year: number; Mileage?: number; Price?: number; FuelType?: string;
  Transmission?: string; OfficeCityState?: string;
  Photos?: { location: string }[];
};

export function normalize(r: RawCar): Car {
  return {
    id: r.Id,
    make: r.Manufacturer,
    model: r.Model,
    trim: r.Badge ?? null,
    year: Math.floor(r.Year / 100),
    month: r.Year % 100,
    mileageKm: r.Mileage ?? null,
    priceKrw: r.Price != null ? r.Price * 10_000 : null,
    fuel: r.FuelType ?? null,
    transmission: r.Transmission ?? null,
    region: r.OfficeCityState ?? null,
    imageUrl: imageUrl(r.Photos?.[0]?.location),
  };
}

export type SearchResponse = { Count?: number; SearchResults?: RawCar[] };

export const SEARCH_META_URL = 'https://api.encar.com/search/car/list/general';

/** URL for Encar's filter metadata: facet lists with live counts. */
export function metaUrl(filters: Filters = {}): string {
  return `${SEARCH_META_URL}?count=true`
    + `&q=${encodeURIComponent(buildQuery(filters))}`
    + `&inav=${encodeURIComponent('|Metadata|Sort')}`;
}

type MetaNode = { Name?: string; Facets?: unknown[] };

function findNode(o: unknown, name: string): MetaNode | null {
  if (Array.isArray(o)) {
    for (const c of o) {
      const r = findNode(c, name);
      if (r) return r;
    }
  } else if (o && typeof o === 'object') {
    const rec = o as Record<string, unknown>;
    if (rec.Name === name) return rec as MetaNode;
    for (const v of Object.values(rec)) {
      const r = findNode(v, name);
      if (r) return r;
    }
  }
  return null;
}

/** Pull one named facet list (e.g. "Manufacturer", "ModelGroup") out of it. */
export function extractFacets(
  json: unknown, name: string,
): { name: string; count: number }[] {
  const nodes = (json as { iNav?: { Nodes?: unknown[] } })?.iNav?.Nodes;
  const node = findNode(nodes, name);
  const list = (node?.Facets ?? []) as { Value: string; Count: number }[];
  return list
    .filter((f) => f.Count > 0)
    .map((f) => ({ name: f.Value, count: f.Count }))
    .sort((a, b) => b.count - a.count);
}

/** The four German makes the homepage sample is weighted toward. */
export const FEATURED_MAKES = ['BMW', '벤츠', '아우디', '폭스바겐'];

/**
 * An `Or` over manufacturers. Encar only accepts an Or branch when the whole
 * expression is nested as (And.(And.<base>.)_.(Or.<clauses>.)) -- flattening it
 * into the base And returns an empty body, not an error.
 */
export function buildFeaturedQuery(): string {
  const or = FEATURED_MAKES.map((m) => `Manufacturer.${m}`).join('._.');
  return `(And.${buildQuery()}_.(Or.${or}.))`;
}

export function searchUrlFor(q: string, offset: number, limit: number, sort: SortKey = 'newest') {
  return `${SEARCH_URL}?count=true&q=${encodeURIComponent(q)}`
    + `&sr=${encodeURIComponent(`|${SORTS[sort]}|${offset}|${limit}`)}`;
}
