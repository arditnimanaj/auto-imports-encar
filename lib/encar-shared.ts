// Pure query-building and normalising, safe to run on the server or in the
// browser. lib/encar.ts wraps these for server fetches; components/ClientCars
// uses them when the server call was blocked upstream.

export const SEARCH_URL = 'https://api.encar.com/search/car/list/premium';
export const IMAGES = 'https://ci.encar.com';

/** Oldest model year listed. Year is stored as YYYYMM, so 2016 is 201601. */
export const YEAR_FLOOR = 201601;
export const YEAR_FLOOR_YEAR = 2016;

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

/**
 * Encar uses 9999만원 as a "price on request" (가격문의) placeholder rather than
 * a real figure: 43 listings sit on exactly this value while the nine values
 * below it hold 49 between them, and they span cars as different as a 72k km
 * Audi A6 and a 187k km BMW 6-series GT. Prices above 10000 exist, so it is a
 * sentinel and not a ceiling. Rendered as a real price it showed a 2017 520d
 * with 86k km at about EUR 62,800 -- more than it cost new.
 */
export const PRICE_ON_REQUEST = 9999;

export type Car = {
  id: string;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  month: number;
  mileageKm: number | null;
  priceKrw: number | null;
  /** Encar is withholding the figure; ask the dealer. */
  priceOnRequest: boolean;
  fuel: string | null;
  transmission: string | null;
  region: string | null;
  imageUrl: string | null;
  /** Raw CDN path, so callers can request a different size. */
  photoPath: string | null;
};

/**
 * Encar encodes filters as a dotted expression, clauses joined by `._.` and
 * closed with `.)`. That trailing dot is required -- without it the response
 * body comes back empty.
 */
export function buildQuery(f: Filters = {}): string {
  // CarType.N = imported. SellType.일반 = outright sale: lease (리스) and rent
  // (렌트) listings quote a takeover/deposit figure in `Price`, not the car's
  // price, so including them would show a late-model BMW i5 at about EUR 700.
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

/**
 * Encar serves the bare photo URL at only 640x360. Its CDN will resize, so
 * ask for something worth showing: 'card' returns 1160x696 (~100KB), 'full'
 * returns the 2200px original for full-screen viewing. Next/Image re-encodes
 * either one down to the size actually rendered.
 */
export type ImageVariant = 'card' | 'full';

export function imageUrl(
  path?: string | null, variant: ImageVariant = 'card',
): string | null {
  if (!path) return null;
  const url = `${IMAGES}${path}`;
  return variant === 'full'
    ? `${url}?impolicy=widthRate&rw=2200`
    : `${url}?impolicy=heightRate&rh=696&cw=1160&ch=696&cg=Center`;
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
    priceKrw:
      r.Price != null && r.Price !== PRICE_ON_REQUEST ? r.Price * 10_000 : null,
    priceOnRequest: r.Price === PRICE_ON_REQUEST,
    fuel: r.FuelType ?? null,
    transmission: r.Transmission ?? null,
    region: r.OfficeCityState ?? null,
    imageUrl: imageUrl(r.Photos?.[0]?.location),
    photoPath: r.Photos?.[0]?.location ?? null,
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

export const DETAIL_URL = 'https://api.encar.com/v1/readside/vehicle';

export function vehicleUrl(id: string): string {
  return `${DETAIL_URL}/${encodeURIComponent(id)}`;
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
  advertisement: {
    price?: number;
    /** Sparse: absent on a normal listing, "CONTRACT" once one is agreed. */
    salesStatus?: string | null;
  };
  photos: { path: string; type: string; code: string }[];
};
