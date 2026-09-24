import Link from 'next/link';
import { ArrowLeft, Phone } from 'lucide-react';
import CarEquipment from '@/components/CarEquipment';
import CarHistory from '@/components/CarHistory';
import Gallery, { type Photo } from '@/components/Gallery';
import PriceCard from '@/components/PriceCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { imageUrl, PRICE_ON_REQUEST, type VehicleDetail } from '@/lib/encar-shared';
import { carEur, km, ym } from '@/lib/format';
import { bodySq, colorSq, fuelSq, makeSq, modelSq, transmissionSq } from '@/lib/i18n';
import { SITE } from '@/lib/site';

/**
 * Rendered either from the server or, where Encar refused the server, from
 * ClientVehicle in the browser. Kept free of server-only APIs so one layout
 * serves both paths.
 */
export default function CarDetail({
  car, id, rate,
}: {
  car: VehicleDetail;
  id: string;
  rate: number;
}) {
  const { category: cat, spec } = car;
  const make = cat.manufacturerEnglishName || makeSq(cat.manufacturerName);
  const model = cat.modelGroupEnglishName || modelSq(cat.modelName);
  const trim = cat.gradeEnglishName || modelSq(cat.gradeName) || '';
  const year = Number(cat.yearMonth?.slice(0, 4));
  const month = Number(cat.yearMonth?.slice(4, 6));
  // Encar only sets salesStatus once a sale is agreed, so anything other than
  // an absent value means this car is no longer freely available.
  const underContract = car.advertisement?.salesStatus === 'CONTRACT';
  const rawPrice = car.advertisement?.price ?? null;
  const priceOnRequest = rawPrice === PRICE_ON_REQUEST;
  const priceKrw = rawPrice != null && !priceOnRequest ? rawPrice * 10_000 : null;
  const priceEur = carEur(priceKrw, rate);
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
    ['Regjistruar', year && month ? ym(year, month) : '—'],
    ['Kilometrazhi', km(spec?.mileage ?? null)],
    ['Karburanti', fuelSq(spec?.fuelName) || '—'],
    ['Transmisioni', transmissionSq(spec?.transmissionName) || '—'],
    ['Motori', spec?.displacement ? `${spec.displacement.toLocaleString('de-DE')} cc` : '—'],
    ['Ngjyra', colorSq(spec?.colorName) || '—'],
    ['Karroceria', bodySq(spec?.bodyName) || '—'],
    ['Ulëse', spec?.seatCount ? String(spec.seatCount) : '—'],
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      <Link
        href="/cars"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Të gjitha veturat
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <Gallery photos={photos} alt={title} />
          <div className="mt-10 space-y-3">
            <CarEquipment codes={car.options?.standard} />
            <CarHistory id={id} rate={rate} />
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          {trim && <p className="mt-1 text-muted-foreground">{trim}</p>}

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">{year || '—'}</Badge>
            {spec?.fuelName && <Badge variant="secondary">{fuelSq(spec.fuelName)}</Badge>}
            {spec?.mileage != null && spec.mileage < 1000 && (
              <Badge className="bg-ink text-paper">Kilometrazh dorëzimi</Badge>
            )}
            {underContract && (
              <Badge className="bg-alert text-paper">Nën kontratë</Badge>
            )}
          </div>

          {underContract && (
            <p className="mt-4 rounded-lg border border-border bg-mist/60 p-3 text-sm">
              Një blerës ka rënë dakord tashmë për këtë veturë në Kore. Na
              pyetni dhe ju konfirmojmë nëse është ende e lirë, ose ju gjejmë
              të njëjtat specifika.
            </p>
          )}

          {priceOnRequest || !priceEur ? (
            <>
              <p className="mt-6 font-display text-3xl font-bold">Çmimi me kërkesë</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Shitësi nuk ka publikuar një shifër për këtë veturë. Ne e
                sigurojmë për ju.
              </p>
            </>
          ) : (
            <PriceCard price={priceEur} year={year} displacement={spec?.displacement} />
          )}

          <div className="mt-6 flex flex-col gap-2">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href={`/contact?car=${encodeURIComponent(`${title} (${id})`)}`} />}
            >
              Kërko këtë veturë
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

          <p className="mt-6 text-xs text-muted-foreground">Referenca {id}</p>
        </div>
      </div>
    </div>
  );
}
