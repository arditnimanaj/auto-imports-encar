'use client';

import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { PersistQueryClientProvider, removeOldestQuery } from '@tanstack/react-query-persist-client';
import { useState } from 'react';
import { CACHE_MS } from '@/lib/query';

/**
 * Every Encar response the browser fetches is reused for a few hours and
 * written to localStorage, so it survives reloads and new tabs. Besides saving
 * requests, this keeps the grids still: Encar's ordering is unstable --
 * ModifiedDate churns as dealers touch listings, and identical requests
 * seconds apart can return ties in a different order -- so any refetch
 * reshuffled the cars, e.g. on Back from a car page. Cached results also
 * render on the first client paint, which lets scroll restoration land.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: CACHE_MS,
        gcTime: CACHE_MS,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
      },
    },
  }));
  const [persister] = useState(() => createSyncStoragePersister({
    storage: safeLocalStorage(),
    key: 'encar-query-cache',
    // Over the storage quota, drop the oldest queries until it fits.
    retry: removeOldestQuery,
  }));

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister,
        maxAge: CACHE_MS,
        // Bump when a cached shape changes, to discard what visitors hold.
        buster: '2',
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}

/** Undefined on the server, and in browsers that block storage access. */
function safeLocalStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
