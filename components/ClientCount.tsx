'use client';

import { useEffect, useState } from 'react';
import { searchUrl, type Filters, type SearchResponse } from '@/lib/encar-shared';

/**
 * The live stock number, fetched from the browser when the server was refused.
 * Renders `fallback` until it has a real figure, so the page never shows a
 * confident "0 cars" it cannot stand behind.
 */
export default function ClientCount({
  filters = {}, fallback = '—', format = (n: number) => n.toLocaleString('de-DE'),
}: {
  filters?: Filters;
  fallback?: string;
  format?: (n: number) => string;
}) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(searchUrl(filters, { offset: 0, limit: 1 }));
        if (!res.ok) return;
        const data = (await res.json()) as SearchResponse;
        if (!cancelled && data.Count) setCount(data.Count);
      } catch {
        // Leave the fallback in place.
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return <>{count == null ? fallback : format(count)}</>;
}
