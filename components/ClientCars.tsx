'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import CarCard from '@/components/CarCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  normalize, searchUrl,
  type Car, type Filters, type SearchResponse, type SortKey,
} from '@/lib/encar-shared';

type Props = {
  filters: Filters;
  offset?: number;
  limit?: number;
  sort?: SortKey;
  rate: number;
  /** Rendered once the count is known, so the page can show totals. */
  onCount?: (count: number) => void;
  className?: string;
  /** Substring match applied client-side, mirroring the server path. */
  query?: string;
  /** Draw from a random offset, for the homepage sample. */
  random?: boolean;
  /** When set, the component also renders the result count and pagination. */
  meta?: { page: number; pageSize: number; params: Record<string, string>; basePath: string };
};

/**
 * Encar drops /search/car/list/* from datacenter egress, so when the server
 * render came back empty the same request is made from the visitor's own
 * browser. Encar serves browsers cross-origin (it reflects the Origin and
 * allows credentials), so no proxy is involved -- the request simply comes
 * from the person looking at the page.
 */
export default function ClientCars({
  filters, offset = 0, limit = 24, sort = 'newest', rate, onCount, className,
  query, random, meta,
}: Props) {
  const [count, setCount] = useState<number | null>(null);
  const [state, setState] = useState<
    { status: 'loading' } | { status: 'ready'; cars: Car[] } | { status: 'error' }
  >({ status: 'loading' });

  const key = JSON.stringify([filters, offset, limit, sort, query, random]);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    (async () => {
      try {
        // With a text query we scan a window and match locally, as the server
        // path does -- Encar has no free-text parameter.
        const take = query ? 200 : limit;
        let from = query ? 0 : offset;

        if (random) {
          // One cheap call for the total, then a window starting anywhere in it.
          const head = await fetch(searchUrl(filters, { offset: 0, limit: 1, sort }));
          if (!head.ok) throw new Error(String(head.status));
          const total = ((await head.json()) as SearchResponse).Count ?? 0;
          from = Math.max(0, Math.floor(Math.random() * Math.max(1, total - limit)));
        }

        const res = await fetch(searchUrl(filters, { offset: from, limit: take, sort }));
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as SearchResponse;
        if (cancelled) return;

        let cars = (data.SearchResults ?? []).map(normalize);
        let count = data.Count ?? 0;

        if (query) {
          const needle = query.toLowerCase();
          const hits = cars.filter((c) =>
            `${c.make} ${c.model} ${c.trim ?? ''}`.toLowerCase().includes(needle));
          count = hits.length;
          cars = hits.slice(offset, offset + limit);
        }

        onCount?.(count);
        setCount(count);
        setState({ status: 'ready', cars });
      } catch {
        if (!cancelled) setState({ status: 'error' });
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const grid = className
    ?? 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4';

  if (state.status === 'loading') {
    return (
      <div className={grid}>
        {Array.from({ length: Math.min(limit, 8) }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-border">
            <Skeleton className="aspect-4/3 w-full rounded-none" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center">
        <p className="font-medium">Stock isn&apos;t loading right now.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Refresh the page, or call us and we&apos;ll check availability for you.
        </p>
      </div>
    );
  }

  if (!state.cars.length) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        No cars match those filters.
      </p>
    );
  }

  return (
    <>
      {meta && count != null && (
        <p className="mb-6 -mt-2 text-sm text-muted-foreground">
          {count.toLocaleString('en-US')} {count === 1 ? 'car' : 'cars'}
          {query ? ` matching \u201c${query}\u201d within the first 200 results` : ''}
        </p>
      )}

      <div className={grid}>
        {state.cars.map((car) => (
          <CarCard key={car.id} car={car} rate={rate} />
        ))}
      </div>

      {meta && count != null && <Pager meta={meta} count={count} />}
    </>
  );
}

function Pager({
  meta, count,
}: { meta: NonNullable<Props['meta']>; count: number }) {
  const last = Math.max(1, Math.ceil(count / meta.pageSize));
  if (last <= 1) return null;

  const href = (p: number) => {
    const next = new URLSearchParams(meta.params);
    if (p > 1) next.set('page', String(p));
    else next.delete('page');
    return `${meta.basePath}${next.toString() ? `?${next}` : ''}`;
  };

  return (
    <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Pagination">
      <Button
        variant="outline"
        size="sm"
        disabled={meta.page <= 1}
        nativeButton={false}
        render={<Link href={href(Math.max(1, meta.page - 1))} />}
      >
        Previous
      </Button>
      <span className="numeric text-sm text-muted-foreground">
        Page {meta.page} of {last.toLocaleString('en-US')}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={meta.page >= last}
        nativeButton={false}
        render={<Link href={href(Math.min(last, meta.page + 1))} />}
      >
        Next
      </Button>
    </nav>
  );
}
