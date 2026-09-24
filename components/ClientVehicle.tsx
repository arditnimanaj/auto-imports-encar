'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import CarDetail from '@/components/CarDetail';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { vehicleUrl, type VehicleDetail } from '@/lib/encar-shared';
import { VEHICLE_MS } from '@/lib/query';

/**
 * Used when the server was refused the detail endpoint. Fetches the same car
 * from the visitor's browser and hands it to the same layout, so a blocked
 * server render is invisible to the buyer apart from a brief skeleton.
 */
export default function ClientVehicle({
  id, rate,
}: { id: string; rate: number }) {
  // A 404 resolves to null rather than throwing, so "sold" is cached too.
  const { data: car, status } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async (): Promise<VehicleDetail | null> => {
      const res = await fetch(vehicleUrl(id));
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(String(res.status));
      return (await res.json()) as VehicleDetail;
    },
    staleTime: VEHICLE_MS,
    gcTime: VEHICLE_MS,
  });

  if (car) {
    return <CarDetail car={car} id={id} rate={rate} />;
  }

  if (status === 'pending') {
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

  const missing = car === null;
  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">
        {missing ? 'Kjo veturë është shitur' : 'Kjo veturë nuk po ngarkohet'}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {missing
          ? 'Kjo shpallje nuk është më në treg. Mund ta sigurojmë të njëjtin model — na tregoni çfarë ju nevojitet.'
          : 'Nuk arritëm ta ngarkojmë këtë shpallje për momentin. Provoni përsëri pas pak, ose na telefononi dhe e kontrollojmë për ju.'}
      </p>
      <div className="mt-7 flex justify-center gap-3">
        <Button nativeButton={false} render={<Link href="/cars" />}>Shfleto stokun</Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/contact" />}>
          Na kontaktoni
        </Button>
      </div>
    </div>
  );
}
