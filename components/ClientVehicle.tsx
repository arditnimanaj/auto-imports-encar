'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import CarDetail from '@/components/CarDetail';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { vehicleUrl, type VehicleDetail } from '@/lib/encar-shared';

/**
 * Used when the server was refused the detail endpoint. Fetches the same car
 * from the visitor's browser and hands it to the same layout, so a blocked
 * server render is invisible to the buyer apart from a brief skeleton.
 */
export default function ClientVehicle({
  id, rate, live, rateUpdated,
}: { id: string; rate: number; live: boolean; rateUpdated: string | null }) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'ok'; car: VehicleDetail }
    | { status: 'missing' }
    | { status: 'error' }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(vehicleUrl(id));
        if (res.status === 404) {
          if (!cancelled) setState({ status: 'missing' });
          return;
        }
        if (!res.ok) throw new Error(String(res.status));
        const car = (await res.json()) as VehicleDetail;
        if (!cancelled) setState({ status: 'ok', car });
      } catch {
        if (!cancelled) setState({ status: 'error' });
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (state.status === 'ok') {
    return (
      <CarDetail car={state.car} id={id} rate={rate} live={live} rateUpdated={rateUpdated} />
    );
  }

  if (state.status === 'loading') {
    return (
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <Skeleton className="h-4 w-24" />
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div>
            <Skeleton className="aspect-16/9 w-full rounded-lg" />
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="aspect-4/3 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const missing = state.status === 'missing';
  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">
        {missing ? 'This car has been sold' : 'This car isn’t loading'}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {missing
          ? 'The listing is no longer on the market. We can source the same model — tell us what you need.'
          : 'We couldn’t load this listing just now. Try again in a moment, or call us and we’ll check it for you.'}
      </p>
      <div className="mt-7 flex justify-center gap-3">
        <Button nativeButton={false} render={<Link href="/cars" />}>Browse stock</Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/contact" />}>
          Contact us
        </Button>
      </div>
    </div>
  );
}
