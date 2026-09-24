'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import CarCard from '@/components/CarCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Filters, SortKey } from '@/lib/encar-shared';
import { carsQuery, featuredQuery } from '@/lib/query';

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
  /**
   * Homepage sample: seven cars from the German four plus three from anything
   * else, each drawn from a random offset. A single random window would return
   * ten consecutive listings, which cluster by make.
   */
  featured?: boolean;
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
  query, featured, meta,
}: Props) {
  // The homepage sample is persisted to localStorage (see Providers), so the
  // same nine cars greet a visitor for a few hours instead of every reload.
  const { data, status } = useQuery(
    featured ? featuredQuery : carsQuery(filters, offset, limit, sort, query),
  );

  useEffect(() => {
    if (data) onCount?.(data.count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const grid = className
    ?? 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4';

  if (status === 'pending') {
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

  if (status === 'error') {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center">
        <p className="font-medium">Stoku nuk po ngarkohet për momentin.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Rifreskoni faqen, ose na telefononi dhe e kontrollojmë disponueshmërinë për ju.
        </p>
      </div>
    );
  }

  const { cars, count } = data;
  if (!cars.length) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        Asnjë veturë nuk përputhet me këta filtra.
      </p>
    );
  }

  return (
    <>
      {meta && (
        <p className="mb-6 -mt-2 text-sm text-muted-foreground">
          {count.toLocaleString('de-DE')} {count === 1 ? 'veturë' : 'vetura'}
          {query ? ` që përputhen me \u201c${query}\u201d brenda 200 rezultateve të para` : ''}
        </p>
      )}

      <div className={grid}>
        {cars.map((car) => (
          <CarCard key={car.id} car={car} rate={rate} />
        ))}
      </div>

      {meta && <Pager meta={meta} count={count} />}
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
    <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Faqezimi">
      <Button
        variant="outline"
        size="sm"
        disabled={meta.page <= 1}
        nativeButton={false}
        render={<Link href={href(Math.max(1, meta.page - 1))} prefetch={false} />}
      >
        E mëparshme
      </Button>
      <span className="numeric text-sm text-muted-foreground">
        Faqja {meta.page} nga {last.toLocaleString('de-DE')}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={meta.page >= last}
        nativeButton={false}
        render={<Link href={href(Math.min(last, meta.page + 1))} prefetch={false} />}
      >
        Tjetra
      </Button>
    </nav>
  );
}
