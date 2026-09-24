'use client';

import { useQuery } from '@tanstack/react-query';
import { latestQuery } from '@/lib/query';

/**
 * The live stock number, read from the homepage's latest-cars query so it
 * costs no request of its own. Renders `fallback` until it has a real figure,
 * so the page never shows a confident "0 cars" it cannot stand behind.
 */
export default function ClientCount({
  fallback = '—', format = (n: number) => n.toLocaleString('de-DE'),
}: {
  fallback?: string;
  format?: (n: number) => string;
}) {
  // On failure the fallback simply stays in place.
  const { data: count } = useQuery({ ...latestQuery, select: (d) => d.count });

  return <>{!count ? fallback : format(count)}</>;
}
