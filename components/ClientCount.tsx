'use client';

import { useQuery } from '@tanstack/react-query';
import type { Filters } from '@/lib/encar-shared';
import { carsQuery, latestQuery } from '@/lib/query';

/**
 * The live stock number, read from the homepage's latest-cars query so it
 * costs no request of its own. Renders `fallback` until it has a real figure,
 * so the page never shows a confident "0 cars" it cannot stand behind. With
 * `filters`, it counts that slice instead, at the cost of a one-car search.
 */
export default function ClientCount({
  filters, fallback = '—', format = (n: number) => n.toLocaleString('de-DE'),
}: {
  filters?: Filters;
  fallback?: string;
  format?: (n: number) => string;
}) {
  // On failure the fallback simply stays in place.
  const { data: count } = useQuery({
    ...(filters ? carsQuery(filters, 0, 1, 'newest') : latestQuery),
    select: (d) => d.count,
  });

  return <>{!count ? fallback : format(count)}</>;
}
