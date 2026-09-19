import Link from 'next/link';
import { Suspense } from 'react';
import CarCard from '@/components/CarCard';
import SearchBar from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { getMakes, getModelGroups, searchCars, SORTS, type Car, type SortKey } from '@/lib/encar';
import { getRate } from '@/lib/fx';
import { makeEn, modelEn } from '@/lib/i18n';

export const metadata = { title: 'Cars in stock' };

const PAGE_SIZE = 24;
/** Encar has no free-text search, so `q` scans this many results and matches locally. */
const SEARCH_WINDOW = 200;

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v?: string) => {
  const n = Number(v);
  return v && Number.isFinite(n) ? n : undefined;
};

export default async function CarsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const make = one(sp.make);
  const model = one(sp.model);
  const fuel = one(sp.fuel);
  const q = (one(sp.q) ?? '').trim();
  const priceMax = num(one(sp.priceMax));
  const sortParam = one(sp.sort);
  const sort: SortKey = sortParam && sortParam in SORTS ? (sortParam as SortKey) : 'newest';
  const page = Math.max(1, num(one(sp.page)) ?? 1);

  // Model groups only exist per-make, so the list depends on the chosen make.
  const [rate, makes, models] = await Promise.all([
    getRate(),
    getMakes().catch(() => []),
    getModelGroups(make),
  ]);
  const filters = { make, model, fuel, priceMax };

  let cars: Car[];
  let total: number;

  if (q) {
    const { cars: window } = await searchCars(filters, { limit: SEARCH_WINDOW, sort });
    const needle = q.toLowerCase();
    const hits = window.filter((c) =>
      `${c.make} ${makeEn(c.make)} ${c.model} ${modelEn(c.model)} ${c.trim ?? ''} ${modelEn(c.trim)}`
        .toLowerCase().includes(needle));
    total = hits.length;
    cars = hits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  } else {
    const res = await searchCars(filters, {
      offset: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE, sort,
    });
    cars = res.cars;
    total = res.count;
  }

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      const s = one(v);
      if (s && k !== 'page') next.set(k, s);
    }
    if (p > 1) next.set('page', String(p));
    return `/cars${next.toString() ? `?${next}` : ''}`;
  };

  return (
    <>
      <Suspense fallback={<div className="h-[4.25rem] border-b border-border" />}>
        <SearchBar makes={makes} models={models} />
      </Suspense>

      <div className="px-5 py-8 md:px-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold md:text-3xl">
          {make ? `${makeEn(make)}${model ? ` ${modelEn(model)}` : ''} in stock` : 'Cars in stock'}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {total.toLocaleString('en-US')} {total === 1 ? 'car' : 'cars'}
          {q && ` matching “${q}” within the first ${SEARCH_WINDOW} results`}
          {!q && ' — 2026 models, shipped from Korea'}
        </p>
      </header>

      {cars.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-20 text-center">
          <p className="font-medium">Nothing matches those filters yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Widen the budget or clear the search — or tell us what you're after
            and we'll source it.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Button variant="outline" nativeButton={false} render={<Link href="/cars" />}>Clear filters</Button>
            <Button nativeButton={false} render={<Link href="/contact" />}>Request a car</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {cars.map((car, i) => (
            <CarCard key={car.id} car={car} rate={rate.krwToEur} priority={i < 4} />
          ))}
        </div>
      )}

      {lastPage > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Pagination">
          <Button variant="outline" size="sm" disabled={page <= 1} nativeButton={false} render={<Link href={href(Math.max(1, page - 1))} />}>Previous</Button>
          <span className="numeric text-sm text-muted-foreground">
            Page {page} of {lastPage.toLocaleString('en-US')}
          </span>
          <Button variant="outline" size="sm" disabled={page >= lastPage} nativeButton={false} render={<Link href={href(Math.min(lastPage, page + 1))} />}>Next</Button>
        </nav>
      )}
      </div>
    </>
  );
}
