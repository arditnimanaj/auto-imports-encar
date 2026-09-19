// Client for Encar's internal JSON API (api.encar.com).
// Not a public API: no docs, no token required today, no stability guarantee.
// See README.md before deploying any of this.

const SEARCH = 'https://api.encar.com/search/car/list/premium';
const SEARCH_META = 'https://api.encar.com/search/car/list/general';
const DETAIL = 'https://api.encar.com/v1/readside/vehicle';
const IMAGES = 'https://ci.encar.com';

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
  /** Encar's ModelGroup, e.g. "X5" or "5시리즈". Only meaningful with a make. */
  model?: string;
  /** Model year floor, e.g. 2026. Never goes below YEAR_FLOOR. */
  yearFrom?: number;
  /** In 만원 (10,000 KRW), matching Encar's own unit. */
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
 * closed with `.)`. That trailing dot is required -- without it you get nothing.
 *   (And.Hidden.N._.CarType.N._.Manufacturer.BMW._.Year.range(202601..).)
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

async function getJson<T>(url: string, revalidate = 300): Promise<T> {
  // Encar rejects requests from some hosting egress. Sending the headers a
  // browser would, and running the functions from Seoul (see vercel.json),
  // keeps it answering from a deployed environment as well as locally.
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        + ' (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',
      Referer: 'https://www.encar.com/',
      Origin: 'https://www.encar.com',
    },
    next: { revalidate },
  });
  if (!res.ok) {
    throw Object.assign(new Error(`Encar API returned ${res.status}`), {
      status: res.status,
      body: await res.text().catch(() => ''),
    });
  }
  return res.json() as Promise<T>;
}

export async function searchCars(
  filters: Filters = {},
  { offset = 0, limit = 20, sort = 'newest' as SortKey } = {},
): Promise<{ count: number; cars: Car[] }> {
  const take = Math.min(Math.max(limit, 1), 200); // API honors up to 200
  const url = `${SEARCH}?count=true`
    + `&q=${encodeURIComponent(buildQuery(filters))}`
    + `&sr=${encodeURIComponent(`|${SORTS[sort]}|${offset}|${take}`)}`;
  const data = await getJson<{ Count?: number; SearchResults?: RawCar[] }>(url);
  return {
    count: data.Count ?? 0,
    cars: (data.SearchResults ?? []).map(normalize),
  };
}

/** The four German makes the homepage is weighted toward. */
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

/**
 * 10 cars for the homepage: 7 from the German four, 3 from anything else,
 * each drawn from a random offset so the set changes between loads.
 */
export async function getFeatured(): Promise<Car[]> {
  const pick = async (q: string, want: number) => {
    const head = await rawSearch(q, 0, 1);
    if (!head.count) return [];
    const offset = Math.max(0, Math.floor(Math.random() * Math.max(1, head.count - want)));
    const page = await rawSearch(q, offset, want);
    return page.cars;
  };
  const [german, rest] = await Promise.all([
    pick(buildFeaturedQuery(), 7),
    pick(buildQuery(), 3),
  ]);
  const seen = new Set<string>();
  return [...german, ...rest]
    .filter((c) => !seen.has(c.id) && seen.add(c.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 10);
}

async function rawSearch(q: string, offset: number, limit: number) {
  const url = `${SEARCH}?count=true&q=${encodeURIComponent(q)}`
    + `&sr=${encodeURIComponent(`|ModifiedDate|${offset}|${limit}`)}`;
  // Not cached: the homepage sample should differ between loads.
  const data = await getJson<{ Count?: number; SearchResults?: RawCar[] }>(url, 0);
  return { count: data.Count ?? 0, cars: (data.SearchResults ?? []).map(normalize) };
}

export async function getVehicle(id: string): Promise<VehicleDetail> {
  return getJson<VehicleDetail>(`${DETAIL}/${encodeURIComponent(id)}`, 600);
}

/**
 * Makes available for the dropdown, read from Encar's own filter metadata so
 * the list always matches what actually has 2026 inventory.
 */
export async function getMakes(): Promise<{ name: string; count: number }[]> {
  const url = `${SEARCH_META}?count=true`
    + `&q=${encodeURIComponent(buildQuery())}`
    + `&inav=${encodeURIComponent('|Metadata|Sort')}`;
  const data = await getJson<{ iNav?: { Nodes?: unknown[] } }>(url, 3600);
  const node = findNode(data.iNav?.Nodes, 'Manufacturer');
  const facets = (node?.Facets ?? []) as { Value: string; Count: number }[];
  return facets
    .filter((f) => f.Count > 0)
    .map((f) => ({ name: f.Value, count: f.Count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Model groups for one make, from the same filter metadata. Encar only exposes
 * these per-manufacturer, so the model list depends on the selected make.
 */
export async function getModelGroups(make?: string): Promise<{ name: string; count: number }[]> {
  if (!make) return [];
  const url = `${SEARCH_META}?count=true`
    + `&q=${encodeURIComponent(buildQuery({ make }))}`
    + `&inav=${encodeURIComponent('|Metadata|Sort')}`;
  const data = await getJson<{ iNav?: { Nodes?: unknown[] } }>(url, 3600).catch(() => null);
  if (!data) return [];
  const node = findNode(data.iNav?.Nodes, 'ModelGroup');
  const facets = (node?.Facets ?? []) as { Value: string; Count: number }[];
  return facets
    .filter((f) => f.Count > 0)
    .map((f) => ({ name: f.Value, count: f.Count }))
    .sort((a, b) => b.count - a.count);
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

export function imageUrl(path?: string | null): string | null {
  return path ? `${IMAGES}${path}` : null;
}

type RawCar = {
  Id: string; Manufacturer: string; Model: string; Badge?: string;
  Year: number; Mileage?: number; Price?: number; FuelType?: string;
  Transmission?: string; OfficeCityState?: string;
  Photos?: { location: string }[];
};

function normalize(r: RawCar): Car {
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

// The detail endpoint names the photo field `path`; search calls it `location`.
export type VehicleDetail = {
  vehicleId: number;
  category: {
    manufacturerName: string; manufacturerEnglishName?: string;
    modelName: string; modelGroupEnglishName?: string;
    gradeName?: string; gradeEnglishName?: string; yearMonth: string;
  };
  spec: {
    mileage?: number; displacement?: number; fuelName?: string;
    transmissionName?: string; colorName?: string; bodyName?: string;
    seatCount?: number;
  };
  advertisement: { price?: number };
  photos: { path: string; type: string; code: string }[];
};
