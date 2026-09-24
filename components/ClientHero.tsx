'use client';

import { useQuery } from '@tanstack/react-query';
import CarPhoto from '@/components/CarPhoto';
import { imageUrl } from '@/lib/encar-shared';
import { carEur, eur } from '@/lib/format';
import { makeSq, modelSq } from '@/lib/i18n';
import { latestQuery } from '@/lib/query';

/** The hero backdrop, drawn from a car actually in stock. */
export default function ClientHero({ rate }: { rate: number }) {
  // Shares the latest-cars query with the row below, so it costs no request.
  // On failure the hero simply stays on its solid background.
  const { data: car = null } = useQuery({
    ...latestQuery,
    select: (d) => d.cars[0] ?? null,
  });

  const src = imageUrl(car?.photoPath, 'full');

  return (
    <>
      {src && (
        <>
          <CarPhoto
            src={src}
            alt=""
            priority
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-45"
          />
          <div
            className="absolute inset-0 -z-10 bg-linear-to-r from-ink via-ink/85 to-ink/30"
            aria-hidden
          />
        </>
      )}
      {car && (
        <p className="relative mt-10 text-sm text-slate">
          Në foto: {makeSq(car.make)} {modelSq(car.model)}
          {car.priceKrw ? ` — ${eur(carEur(car.priceKrw, rate))}` : ''}
        </p>
      )}
    </>
  );
}
