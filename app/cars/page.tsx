import { Suspense } from 'react';
import ClientCars from '@/components/ClientCars';
import SearchBar from '@/components/SearchBar';
import { getRate } from '@/lib/fx';
import { makeSq, modelSq } from '@/lib/i18n';
import { type SortKey, SORTS } from '@/lib/encar-shared';

export const metadata = { title: 'Veturat në stok' };

const PAGE_SIZE = 24;

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v?: string) => {
  const n = Number(v);
  return v && Number.isFinite(n) ? n : undefined;
};

/** No stock is fetched here; the browser does it. See app/page.tsx for why. */
export default async function CarsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const make = one(sp.make);
  const model = one(sp.model);
  const fuel = one(sp.fuel);
  const q = (one(sp.q) ?? '').trim();
  const yearFrom = num(one(sp.yearFrom));
  const priceMax = num(one(sp.priceMax));
  const sortParam = one(sp.sort);
  const sort: SortKey = sortParam && sortParam in SORTS ? (sortParam as SortKey) : 'newest';
  const page = Math.max(1, num(one(sp.page)) ?? 1);

  const rate = await getRate();
  const filters = { make, model, fuel, yearFrom, priceMax };

  return (
    <>
      <Suspense fallback={<div className="h-[4.25rem] border-b border-border" />}>
        <SearchBar />
      </Suspense>

      <div className="px-5 py-8 md:px-8">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold md:text-3xl">
            {make ? `${makeSq(make)}${model ? ` ${modelSq(model)}` : ''} në stok` : 'Veturat në stok'}
          </h1>
        </header>

        <ClientCars
          filters={filters}
          offset={(page - 1) * PAGE_SIZE}
          limit={PAGE_SIZE}
          sort={sort}
          query={q || undefined}
          rate={rate.krwToEur}
          meta={{
            page,
            pageSize: PAGE_SIZE,
            basePath: '/cars',
            params: Object.fromEntries(
              Object.entries(sp)
                .map(([k, v]) => [k, one(v) ?? ''])
                .filter(([k, v]) => v && k !== 'page'),
            ),
          }}
        />
      </div>
    </>
  );
}
