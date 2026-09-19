import Image from 'next/image';
import Link from 'next/link';
import CarCard from '@/components/CarCard';
import Reveal from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import ClientCars from '@/components/ClientCars';
import { buildQuery, getFeatured, getMakes, searchCars } from '@/lib/encar';
import { getRate } from '@/lib/fx';
import { eur, toEur } from '@/lib/format';
import { makeEn, modelEn } from '@/lib/i18n';
import { SITE } from '@/lib/site';

export default async function Home() {
  // Each call reports `unavailable` when Encar refused the server; those
  // sections then re-fetch from the visitor's browser instead.
  const [rate, featured, newest, affordable, makes] = await Promise.all([
    getRate(),
    getFeatured(),
    searchCars({}, { limit: 8, sort: 'newest' }),
    searchCars({ priceMax: 4000 }, { limit: 6, sort: 'priceAsc' }),
    getMakes().catch(() => []),
  ]);
  const blocked = featured.unavailable;

  const hero = featured.cars.find((c) => c.imageUrl) ?? newest.cars[0];
  const stock = newest.count;

  return (
    <>
      <Hero car={hero} stock={stock} rate={rate.krwToEur} />
      <RouteStrip stock={stock} />

      {(featured.cars.length > 0 || blocked) && (
      <Section
        title="Ten cars, picked fresh"
        note="A fresh selection each visit, weighted to the German marques."
        href="/cars"
        linkLabel="Browse all cars"
      >
        {blocked ? (
          <ClientCars
            filters={{}}
            limit={10}
            featured
            rate={rate.krwToEur}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {featured.cars.map((car, i) => (
              <CarCard key={car.id} car={car} rate={rate.krwToEur} priority={i < 3} />
            ))}
          </div>
        )}
      </Section>
      )}

      {newest.cars.length > 0 && !blocked && (
      <Section
        title="Just landed"
        note="The most recently listed cars in Korea, ready to quote."
        href="/cars?sort=newest"
        linkLabel="See newest"
      >
        {/* A scroll rail rather than another grid, so the two sections read differently. */}
        <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 md:-mx-8 md:px-8">
          {newest.cars.map((car) => (
            <div key={car.id} className="w-72 shrink-0 snap-start">
              <CarCard car={car} rate={rate.krwToEur} />
            </div>
          ))}
        </div>
      </Section>
      )}

      {makes.length > 0 && (
      <Section
        title="Browse by make"
        note="Live counts — every number is stock we can quote today."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {makes.slice(0, 12).map((m) => (
            <Link
              key={m.name}
              href={`/cars?make=${encodeURIComponent(m.name)}`}
              className="flex items-baseline justify-between rounded-lg border border-border px-4 py-3 transition-colors hover:border-brass hover:bg-mist/50"
            >
              <span className="truncate font-medium">{makeEn(m.name)}</span>
              <span className="numeric ml-2 shrink-0 text-sm text-muted-foreground">
                {m.count}
              </span>
            </Link>
          ))}
        </div>
      </Section>
      )}

      {(affordable.cars.length > 0 || blocked) && (
        <Section
          title="Under €25,000"
          note="Low-mileage 2026 cars at the accessible end of the range."
          href="/cars?priceMax=4000&sort=priceAsc"
          linkLabel="See all under €25,000"
        >
          {blocked ? (
            <ClientCars
              filters={{ priceMax: 4000 }}
              limit={6}
              sort="priceAsc"
              rate={rate.krwToEur}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {affordable.cars.map((car) => (
                <CarCard key={car.id} car={car} rate={rate.krwToEur} />
              ))}
            </div>
          )}
        </Section>
      )}

      <ContactBand />
    </>
  );
}

function Hero({
  car, stock, rate,
}: { car?: { imageUrl: string | null; make: string; model: string; priceKrw: number | null }; stock: number; rate: number }) {
  return (
    <section className="relative isolate overflow-hidden bg-ink">
      {car?.imageUrl && (
        <>
          <Image
            src={car.imageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-45"
          />
          <div
            className="absolute inset-0 bg-linear-to-r from-ink via-ink/85 to-ink/30"
            aria-hidden
          />
        </>
      )}

      <div className="relative px-5 py-20 md:px-8 md:py-28">
        <h1 className="max-w-2xl font-display text-4xl leading-[1.05] font-extrabold text-paper md:text-6xl">
          Korean stock, Kosovo plates.
        </h1>
        <p className="mt-5 max-w-lg text-lg text-mist">
          We source 2026 cars from Korea's largest auction market and handle the
          shipping, customs and registration. You collect the keys in {SITE.city}.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/cars" />}>See {stock.toLocaleString('en-US')} cars in stock</Button>
          <Button
            size="lg"
            variant="outline"
            className="border-mist/30 bg-transparent text-mist hover:bg-mist/10 hover:text-paper" nativeButton={false} render={<Link href="/contact" />}>Ask for a quote</Button>
        </div>

        {car && (
          <p className="mt-10 text-sm text-slate">
            Pictured: {makeEn(car.make)} {modelEn(car.model)}
            {car.priceKrw ? ` — ${eur(toEur(car.priceKrw, rate))}` : ''}
          </p>
        )}
      </div>
    </section>
  );
}

function RouteStrip({ stock }: { stock: number }) {
  const facts = [
    { value: stock ? stock.toLocaleString('en-US') : '—', label: 'cars in stock right now' },
    { value: '2026', label: 'the oldest model year we list' },
    { value: SITE.route.join(' → '), label: 'the route your car takes' },
  ];
  return (
    <section className="border-b border-border bg-mist/60">
      <dl className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {facts.map((f) => (
          <div key={f.label} className="px-5 py-6 md:px-8">
            <dt className="numeric font-display text-2xl font-bold">{f.value}</dt>
            <dd className="mt-1 text-sm text-muted-foreground">{f.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Section({
  title, note, href, linkLabel, children,
}: {
  title: string; note?: string; href?: string; linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-5 pt-16 md:px-8">
      <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold md:text-3xl">{title}</h2>
          {note && <p className="mt-1.5 text-sm text-muted-foreground">{note}</p>}
        </div>
        {href && linkLabel && (
          <Link href={href} className="text-sm font-medium text-brass hover:underline">
            {linkLabel}
          </Link>
        )}
      </Reveal>
      {children}
    </section>
  );
}

function ContactBand() {
  return (
    <section className="mt-20 bg-steel px-5 py-14 md:px-8">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="max-w-xl">
          <h2 className="font-display text-2xl font-bold text-paper md:text-3xl">
            Looking for something not listed?
          </h2>
          <p className="mt-2 text-mist">
            Tell us the model and budget. We check the Korean auctions daily and
            come back with options, landed price included.
          </p>
        </div>
        <Button size="lg" nativeButton={false} render={<Link href="/contact" />}>Tell us what you want</Button>
      </div>
    </section>
  );
}
