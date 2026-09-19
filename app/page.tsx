import Link from 'next/link';
import ClientCars from '@/components/ClientCars';
import ClientCount from '@/components/ClientCount';
import ClientHero from '@/components/ClientHero';
import ClientMakes from '@/components/ClientMakes';
import Reveal from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import { getRate } from '@/lib/fx';
import { YEAR_FLOOR_YEAR } from '@/lib/encar-shared';
import { SITE } from '@/lib/site';

/**
 * No stock is fetched on the server. Encar throttles datacenter egress hard
 * enough that a server attempt usually just costs a slow round-trip before
 * failing, so the page shell ships immediately and the browser -- which Encar
 * serves normally -- fills in the cars.
 */
export default async function Home() {
  const rate = await getRate();

  return (
    <>
      <Hero rate={rate.krwToEur} />
      <RouteStrip />

      <Section
        title="Nine cars, picked fresh"
        note="A different selection each visit, weighted to the German marques."
        href="/cars"
        linkLabel="Browse all cars"
      >
        <ClientCars
          filters={{}}
          limit={9}
          featured
          rate={rate.krwToEur}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
        />
      </Section>

      <Section
        title="Just landed"
        note="The most recently listed cars in Korea, ready to quote."
        href="/cars?sort=newest"
        linkLabel="See newest"
      >
        <ClientCars
          filters={{}}
          limit={8}
          sort="newest"
          rate={rate.krwToEur}
          className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4"
        />
      </Section>

      <Section
        title="Browse by make"
        note="Live counts — every number is stock we can quote today."
      >
        <ClientMakes />
      </Section>

      <Section
        title="Under €25,000"
        note="Cars at the accessible end of the range, ready to quote."
        href="/cars?priceMax=4000&sort=priceAsc"
        linkLabel="See all under €25,000"
      >
        <ClientCars
          filters={{ priceMax: 4000 }}
          limit={6}
          sort="priceAsc"
          rate={rate.krwToEur}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
        />
      </Section>

      <ContactBand />
    </>
  );
}

function Hero({ rate }: { rate: number }) {
  return (
    <section className="relative isolate overflow-hidden bg-ink">
      <div className="relative px-5 py-20 md:px-8 md:py-28">
        <div className="relative">
          <h1 className="max-w-2xl font-display text-4xl leading-[1.05] font-extrabold text-paper md:text-6xl">
            Korean stock, Kosovo plates.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-mist">
            We source cars from Korea&apos;s largest auction market — {YEAR_FLOOR_YEAR}{' '}
            models and newer — and handle the shipping, customs and registration.
            You collect the keys in {SITE.city}.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="/cars" />}>
              See <ClientCount fallback="our" /> cars in stock
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-mist/30 bg-transparent text-mist hover:bg-mist/10 hover:text-paper"
              nativeButton={false}
              render={<Link href="/contact" />}
            >
              Ask for a quote
            </Button>
          </div>
        </div>

        {/* Renders the backdrop (absolutely positioned) plus the caption, which
            belongs below the copy rather than above it. */}
        <ClientHero rate={rate} />
      </div>
    </section>
  );
}

function RouteStrip() {
  const facts: { value: React.ReactNode; label: string }[] = [
    { value: <ClientCount />, label: 'cars in stock right now' },
    { value: String(YEAR_FLOOR_YEAR), label: 'the oldest model year we list' },
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
        <Button size="lg" nativeButton={false} render={<Link href="/contact" />}>
          Tell us what you want
        </Button>
      </div>
    </section>
  );
}
