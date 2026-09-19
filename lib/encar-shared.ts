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
