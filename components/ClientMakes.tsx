'use client';

import Link from 'next/link';
import { useFacets } from '@/lib/use-facets';
import { makeSq } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';

/** Brand tiles with live counts, fetched in the browser. */
export default function ClientMakes({ limit = 12 }: { limit?: number }) {
  const makes = useFacets('Manufacturer');

  if (!makes.length) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: limit }).map((_, i) => (
          <Skeleton key={i} className="h-[3.25rem] rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {makes.slice(0, limit).map((m) => (
        <Link
          key={m.name}
          href={`/cars?make=${encodeURIComponent(m.name)}`}
          className="flex items-baseline justify-between rounded-lg border border-border px-4 py-3 transition-colors hover:border-brass hover:bg-mist/50"
        >
          <span className="truncate font-medium">{makeSq(m.name)}</span>
          <span className="numeric ml-2 shrink-0 text-sm text-muted-foreground">
            {m.count}
          </span>
        </Link>
      ))}
    </div>
  );
}
