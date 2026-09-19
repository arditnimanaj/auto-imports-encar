'use client';

import { useEffect, useState } from 'react';
import { extractFacets, metaUrl, type Filters } from './encar-shared';

export type Facet = { name: string; count: number };

/**
 * Facet lists for the filters. The server already supplies these wherever
 * Encar answers it; this only runs when the server came back empty because
 * the search host refused its egress, and fetches the same metadata from the
 * visitor's browser instead.
 */
export function useFacets(
  name: 'Manufacturer' | 'ModelGroup',
  serverValue: Facet[],
  filters: Filters = {},
  enabled = true,
): Facet[] {
  const [facets, setFacets] = useState<Facet[]>(serverValue);
  const key = JSON.stringify(filters);

  useEffect(() => {
    setFacets(serverValue);
    if (serverValue.length || !enabled) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(metaUrl(JSON.parse(key) as Filters));
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setFacets(extractFacets(data, name));
      } catch {
        // Leave the list empty; the filter simply offers nothing to pick.
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, name, enabled, serverValue.length]);

  return facets;
}
