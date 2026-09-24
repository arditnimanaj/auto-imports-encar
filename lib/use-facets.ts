'use client';

import { useQuery } from '@tanstack/react-query';
import type { Filters } from './encar-shared';
import { metaQuery } from './query';

export type Facet = { name: string; count: number };

/**
 * Facet lists for the filters, fetched from the visitor's browser. Makes
 * below MIN_MAKE_COUNT listings are already dropped (see lib/query).
 */
export function useFacets(
  name: 'Manufacturer' | 'ModelGroup',
  filters: Filters = {},
  enabled = true,
): Facet[] {
  // On failure the list stays empty; the filter simply offers nothing to pick.
  const { data } = useQuery(metaQuery(filters, enabled));
  return (enabled && data?.[name]) || [];
}
