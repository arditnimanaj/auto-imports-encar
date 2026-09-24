import { queryOptions } from '@tanstack/react-query';
import {
  buildFeaturedQuery, buildQuery, extractFacets, metaUrl, normalize, searchUrl, searchUrlFor,
  type Car, type Filters, type SearchResponse, type SortKey,
} from './encar-shared';

/** Query key and lifetime for the homepage sample, which is persisted. */
export const FEATURED_KEY: unknown[] = ['featured'];
export const FEATURED_MS = 3 * 60 * 60_000;

/** How long any Encar response is reused and kept in localStorage. */
export const CACHE_MS = 3 * 60 * 60_000;

/** A car page is refreshed sooner, so a sale shows up within the hour. */
export const VEHICLE_MS = 60 * 60_000;

type Page = { cars: Car[]; count: number };

export function carsQuery(
  filters: Filters, offset: number, limit: number, sort: SortKey, query?: string,
) {
  return queryOptions({
    queryKey: ['cars', filters, offset, limit, sort, query ?? null] as unknown[],
    queryFn: () => search(filters, offset, limit, sort, query),
  });
}

/**
 * The homepage's "Sapo mbërritën" row. The hero backdrop and both stock
 * counts read from it too, so four widgets cost one Encar request.
 */
export const latestQuery = carsQuery({}, 0, 8, 'newest');

export const featuredQuery = queryOptions({
  queryKey: FEATURED_KEY,
  queryFn: ({ client }) => pickFeatured(client.fetchQuery(latestQuery)),
  staleTime: FEATURED_MS,
  gcTime: FEATURED_MS,
});

/**
 * Makes with fewer listings than this are left out of the make filter and the
 * homepage brand tiles -- a handful of cars is not a range worth browsing.
 */
export const MIN_MAKE_COUNT = 50;

/**
 * Encar's filter metadata. Makes and models are two views of one response,
 * so the homepage tiles and the /cars make filter share a fetch. Only the two
 * lists are kept, not the raw payload, since results go to localStorage.
 */
export function metaQuery(filters: Filters, enabled = true) {
  return queryOptions({
    queryKey: ['meta', filters] as unknown[],
    queryFn: async () => {
      const res = await fetch(metaUrl(filters));
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      return {
        Manufacturer: extractFacets(json, 'Manufacturer')
          .filter((f) => f.count >= MIN_MAKE_COUNT),
        ModelGroup: extractFacets(json, 'ModelGroup'),
      };
    },
    enabled,
  });
}

/**
 * With a text query we scan a window and match locally, as the server path
 * does -- Encar has no free-text parameter.
 */
async function search(
  filters: Filters, offset: number, limit: number, sort: SortKey, query?: string,
): Promise<Page> {
  const take = query ? 200 : limit;
  const from = query ? 0 : offset;
  const res = await fetch(searchUrl(filters, { offset: from, limit: take, sort }));
  if (!res.ok) throw new Error(String(res.status));
  const data = (await res.json()) as SearchResponse;

  const cars = (data.SearchResults ?? []).map(normalize);
  if (!query) return { cars, count: data.Count ?? 0 };

  const needle = query.toLowerCase();
  const hits = cars.filter((c) =>
    `${c.make} ${c.model} ${c.trim ?? ''}`.toLowerCase().includes(needle));
  return { cars: hits.slice(offset, offset + limit), count: hits.length };
}

/**
 * Nine cars: six from the German four, three from anything else, shuffled.
 * The unfiltered total comes from the latest-cars query the homepage already
 * makes, rather than a head request of its own.
 */
async function pickFeatured(latest: Promise<Page>): Promise<Page> {
  const count = async (q: string) => {
    const head = await fetch(searchUrlFor(q, 0, 1));
    if (!head.ok) throw new Error(String(head.status));
    return ((await head.json()) as SearchResponse).Count ?? 0;
  };
  const pick = async (q: string, total: Promise<number>, want: number) => {
    const n = await total;
    if (!n) return [];
    const offset = Math.floor(Math.random() * Math.max(1, n - want));
    const page = await fetch(searchUrlFor(q, offset, want));
    if (!page.ok) throw new Error(String(page.status));
    return (((await page.json()) as SearchResponse).SearchResults ?? []).map(normalize);
  };

  const [german, rest] = await Promise.all([
    pick(buildFeaturedQuery(), count(buildFeaturedQuery()), 6),
    pick(buildQuery(), latest.then((p) => p.count), 3),
  ]);
  const seen = new Set<string>();
  const cars = [...german, ...rest]
    .filter((c) => !seen.has(c.id) && seen.add(c.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 9);
  return { cars, count: cars.length };
}
