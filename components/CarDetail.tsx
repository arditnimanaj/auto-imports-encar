import Link from 'next/link';
import { ArrowLeft, MessageCircle, Phone } from 'lucide-react';
import CarEquipment from '@/components/CarEquipment';
import CarHistory from '@/components/CarHistory';
import CarVerdicts from '@/components/CarVerdicts';
import Gallery, { type Photo } from '@/components/Gallery';
import PriceCard from '@/components/PriceCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { imageUrl, PRICE_ON_REQUEST, type VehicleDetail } from '@/lib/encar-shared';
import { landedEstimate } from '@/lib/customs';
import { carEur, eur, km, ym } from '@/lib/format';
import { bodySq, colorSq, fuelSq, makeSq, modelSq, transmissionSq } from '@/lib/i18n';
import { MESSAGING, SITE } from '@/lib/site';

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
  const message = `Përshëndetje, jam i interesuar për ${title}${year ? ` ${year}` : ''} (referenca ${id}).`;

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

      {/* Source order is gallery, details, reports, so a phone reads the price
          before the reports; on large screens the details become a sticky
          right column spanning both rows. */}
      <div className="mt-6 grid gap-x-10 gap-y-8 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <Gallery photos={photos} alt={title} />
        </div>

        <div className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          {trim && <p className="mt-1 text-muted-foreground">{trim}</p>}

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">{year || '—'}</Badge>
            {spec?.fuelName && <Badge variant="secondary">{fuelSq(spec.fuelName)}</Badge>}
            {spec?.mileage != null && spec.mileage < 1000 && (
              <Badge className="bg-ink text-paper">Pothuajse e re</Badge>
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

          <CarVerdicts id={id} rate={rate} />

          <div className="mt-6 flex flex-col gap-2">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href={`/contact?car=${encodeURIComponent(`${title} (${id})`)}`} />}
            >
              Kërko këtë veturë
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                render={<a href={MESSAGING.whatsapp(message)} target="_blank" rel="noopener" />}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                render={<a href={MESSAGING.viber} />}
              >
                <MessageCircle className="h-4 w-4" />
                Viber
              </Button>
            </div>
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              render={<a href={MESSAGING.tel} />}
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

        <div className="min-w-0 space-y-3 lg:col-start-1 lg:row-start-2">
          <CarEquipment codes={car.options?.standard} />
          <CarHistory id={id} rate={rate} />
        </div>
      </div>

      {/* Phones: price and the two ways to act stay in reach while scrolling. */}
      <div data-sticky-bar className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="min-w-0 flex-1">
          {priceEur && !priceOnRequest ? (
            <>
              <p className="numeric font-display text-xl leading-tight font-extrabold text-brass">{eur(priceEur)}</p>
              <p className="numeric truncate text-xs text-muted-foreground">
                Me doganë deri në {eur(landedEstimate(priceEur, year, spec?.displacement).total)}
              </p>
            </>
          ) : (
            <p className="font-display font-bold">Çmimi me kërkesë</p>
          )}
        </div>
        <Button
          variant="outline"
          size="icon-lg"
          nativeButton={false}
          aria-label="Na shkruani në WhatsApp"
          render={<a href={MESSAGING.whatsapp(message)} target="_blank" rel="noopener" />}
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href={`/contact?car=${encodeURIComponent(`${title} (${id})`)}`} />}
        >
          Kërko
        </Button>
      </div>
    </div>
  );
}
