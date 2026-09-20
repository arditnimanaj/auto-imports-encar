import Link from 'next/link';
import { ArrowLeft, Phone } from 'lucide-react';
import Gallery, { type Photo } from '@/components/Gallery';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { imageUrl, PRICE_ON_REQUEST, type VehicleDetail } from '@/lib/encar-shared';
import { eur, km, krw, toEur, ym } from '@/lib/format';
import { bodyEn, colorEn, fuelEn, makeEn, modelEn, transmissionEn } from '@/lib/i18n';
import { SITE } from '@/lib/site';

/**
 * Rendered either from the server or, where Encar refused the server, from
 * ClientVehicle in the browser. Kept free of server-only APIs so one layout
 * serves both paths.
 */
export default function CarDetail({
  car, id, rate, live = true, rateUpdated,
}: {
  car: VehicleDetail;
  id: string;
  rate: number;
  live?: boolean;
  rateUpdated?: string | null;
}) {
  const { category: cat, spec } = car;
  const make = cat.manufacturerEnglishName || makeEn(cat.manufacturerName);
  const model = cat.modelGroupEnglishName || modelEn(cat.modelName);
  const trim = cat.gradeEnglishName || modelEn(cat.gradeName) || '';
  const year = Number(cat.yearMonth?.slice(0, 4));
  const month = Number(cat.yearMonth?.slice(4, 6));
  // Encar only sets salesStatus once a sale is agreed, so anything other than
  // an absent value means this car is no longer freely available.
  const underContract = car.advertisement?.salesStatus === 'CONTRACT';
  const rawPrice = car.advertisement?.price ?? null;
  const priceOnRequest = rawPrice === PRICE_ON_REQUEST;
  const priceKrw = rawPrice != null && !priceOnRequest ? rawPrice * 10_000 : null;
  const title = `${make} ${model}`;

  // Encar repeats photo paths within a listing, so dedupe by URL.
  const photos: Photo[] = [];
  const seen = new Set<string>();
  for (const p of car.photos ?? []) {
    const src = imageUrl(p.path);
    const full = imageUrl(p.path, 'full');
    if (!src || !full || seen.has(src)) continue;
    seen.add(src);
    photos.push({ src, full, label: p.type });
  }

  const specs: [string, string][] = [
    ['Registered', year && month ? ym(year, month) : '—'],
    ['Mileage', km(spec?.mileage ?? null)],
    ['Fuel', fuelEn(spec?.fuelName) || '—'],
    ['Gearbox', transmissionEn(spec?.transmissionName) || '—'],
    ['Engine', spec?.displacement ? `${spec.displacement.toLocaleString('en-US')} cc` : '—'],
    ['Colour', colorEn(spec?.colorName) || '—'],
    ['Body', bodyEn(spec?.bodyName) || '—'],
    ['Seats', spec?.seatCount ? String(spec.seatCount) : '—'],
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      <Link
        href="/cars"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        All cars
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <Gallery photos={photos} alt={title} />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          {trim && <p className="mt-1 text-muted-foreground">{trim}</p>}

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">{year || '—'}</Badge>
            {spec?.fuelName && <Badge variant="secondary">{fuelEn(spec.fuelName)}</Badge>}
            {spec?.mileage != null && spec.mileage < 1000 && (
              <Badge className="bg-ink text-paper">Delivery mileage</Badge>
            )}
            {underContract && (
              <Badge className="bg-alert text-paper">Under contract</Badge>
            )}
          </div>

          {underContract && (
            <p className="mt-4 rounded-lg border border-border bg-mist/60 p-3 text-sm">
              A buyer has already agreed terms on this car in Korea. Ask us and
              we&apos;ll confirm whether it&apos;s still available, or find you
              the same spec.
            </p>
          )}

          {priceOnRequest ? (
            <>
              <p className="mt-6 font-display text-3xl font-bold">Price on request</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The seller hasn&apos;t published a figure for this car. We&apos;ll
                get it for you.
              </p>
            </>
          ) : (
            <>
              <p className="numeric mt-6 font-display text-4xl font-extrabold text-brass">
                {eur(toEur(priceKrw, rate))}
              </p>
              <p className="numeric mt-1 text-sm text-muted-foreground">
                {krw(priceKrw)} in Korea
              </p>
            </>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            {!priceOnRequest && 'Price before shipping, duty and registration. '}
            Ask us for the landed total to {SITE.city}.
            {/* The conversion note only means anything when there is a price. */}
            {!priceOnRequest && !live && ' Conversion rate approximate.'}
            {!priceOnRequest && live && rateUpdated ? ` Rate from ${rateUpdated}.` : ''}
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href={`/contact?car=${encodeURIComponent(`${title} (${id})`)}`} />}
            >
              Request this car
            </Button>
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              render={<a href={`tel:${SITE.phone.replace(/\s/g, '')}`} />}
            >
              <Phone className="h-4 w-4" />
              {SITE.phone}
            </Button>
          </div>

          <Separator className="my-7" />

          <dl className="grid grid-cols-2 gap-x-5 gap-y-4">
            {specs.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="numeric mt-0.5 text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-xs text-muted-foreground">Reference {id}</p>
        </div>
      </div>
    </div>
  );
}
