import Image from 'next/image';
import Link from 'next/link';
import type { Car } from '@/lib/encar';
import { eur, km, ym } from '@/lib/format';
import { fuelEn, makeEn, modelEn } from '@/lib/i18n';
import { toEur } from '@/lib/fx';
import { Badge } from '@/components/ui/badge';

export default function CarCard({
  car, rate, priority = false,
}: { car: Car; rate: number; priority?: boolean }) {
  return (
    <Link
      href={`/car/${car.id}`}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-mist">
        {car.imageUrl && (
          <Image
            src={car.imageUrl}
            alt={`${makeEn(car.make)} ${modelEn(car.model)}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
        {car.mileageKm != null && car.mileageKm < 1000 && (
          <Badge className="absolute top-3 left-3 bg-ink text-paper">
            Delivery mileage
          </Badge>
        )}
      </div>

      <div className="p-4">
        <h3 className="truncate text-base font-semibold">
          {makeEn(car.make)} {modelEn(car.model)}
        </h3>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {modelEn(car.trim) || ' '}
        </p>

        <p className="numeric mt-3 font-display text-xl font-bold text-brass">
          {eur(toEur(car.priceKrw, rate))}
        </p>

        <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
          <div>
            <dt className="text-muted-foreground">Year</dt>
            <dd className="numeric font-medium">{ym(car.year, car.month)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Mileage</dt>
            <dd className="numeric font-medium">{km(car.mileageKm)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Fuel</dt>
            <dd className="truncate font-medium">{fuelEn(car.fuel) || '—'}</dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}
