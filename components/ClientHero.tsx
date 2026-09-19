'use client';

import { useEffect, useState } from 'react';
import CarPhoto from '@/components/CarPhoto';
import {
  imageUrl, normalize, searchUrl, type Car, type SearchResponse,
} from '@/lib/encar-shared';
import { eur, toEur } from '@/lib/format';
import { makeEn, modelEn } from '@/lib/i18n';

/** The hero backdrop, drawn from a car actually in stock. */
export default function ClientHero({ rate }: { rate: number }) {
  const [car, setCar] = useState<Car | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(searchUrl({}, { offset: 0, limit: 1, sort: 'newest' }));
        if (!res.ok) return;
        const data = (await res.json()) as SearchResponse;
        const first = (data.SearchResults ?? [])[0];
        if (first && !cancelled) setCar(normalize(first));
      } catch {
        // The hero simply stays on its solid background.
      }
    })();
    return () => { cancelled = true; };
  }, []);

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
          Pictured: {makeEn(car.make)} {modelEn(car.model)}
          {car.priceKrw ? ` — ${eur(toEur(car.priceKrw, rate))}` : ''}
        </p>
      )}
    </>
  );
}
