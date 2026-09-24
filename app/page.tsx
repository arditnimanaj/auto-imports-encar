import Link from 'next/link';
import ClientCars from '@/components/ClientCars';
import ClientCount from '@/components/ClientCount';
import ClientHero from '@/components/ClientHero';
import ClientMakes from '@/components/ClientMakes';
import Reveal from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import { getRate } from '@/lib/fx';
import { YEAR_FLOOR_YEAR } from '@/lib/encar-shared';
import { SITE, STEPS } from '@/lib/site';

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
        title="Nëntë vetura, të zgjedhura rishtas"
        note="Një përzgjedhje e re çdo tre orë, me theks te markat gjermane."
        href="/cars"
        linkLabel="Shiko të gjitha veturat"
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
        title="Sapo mbërritën"
        note="Veturat e listuara më së fundi në Kore, gati për ofertë."
        href="/cars?sort=newest"
        linkLabel="Shiko më të rejat"
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
        title="Shfleto sipas markës"
        note="Numra të drejtpërdrejtë — çdo shifër është stok që mund ta ofertojmë sot."
      >
        <ClientMakes />
      </Section>

      <Section
        title="Sipas buxhetit"
        note="Çmimi i veturës në Kore. Dogana shtohet sipas vitit dhe motorit."
      >
        <Budgets rate={rate.krwToEur} />
      </Section>

      <Faq />

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
            Stok korean, targa kosovare.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-mist">
            I sjellim veturat nga tregu më i madh i ankandeve në Kore — modele{' '}
            {YEAR_FLOOR_YEAR} e tutje — dhe kujdesemi për transportin, doganën dhe
            regjistrimin. Ju i merrni çelësat në {SITE.city}.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="/cars" />}>
              Shiko <ClientCount fallback="të gjitha" /> veturat në stok
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-mist/30 bg-transparent text-mist hover:bg-mist/10 hover:text-paper"
              nativeButton={false}
              render={<Link href="/contact" />}
            >
              Kërko ofertë
            </Button>
          </div>

          <ol className="mt-12 grid max-w-3xl gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="border-t border-steel pt-3">
                <p className="numeric font-display text-sm font-bold text-brass">0{i + 1}</p>
                <p className="mt-1 text-sm font-semibold text-paper">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-mist/70">{step.body}</p>
              </li>
            ))}
          </ol>
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
    { value: <ClientCount />, label: 'vetura në stok tani' },
    { value: String(YEAR_FLOOR_YEAR), label: 'viti më i vjetër i modelit që listojmë' },
    { value: SITE.route.join(' → '), label: 'rruga që bën vetura juaj' },
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
            Po kërkoni diçka që nuk është e listuar?
          </h2>
          <p className="mt-2 text-mist">
            Na tregoni modelin dhe buxhetin. I kontrollojmë ankandet koreane çdo
            ditë dhe kthehemi me opsione, përfshirë çmimin e dorëzuar.
          </p>
        </div>
        <Button size="lg" nativeButton={false} render={<Link href="/contact" />}>
          Na tregoni çfarë doni
        </Button>
      </div>
    </section>
  );
}

/**
 * Price bands a buyer here thinks in, as links into /cars with live counts.
 * Encar filters in 만원 (10k KRW), so the euro edges are converted at today's
 * rate.
 */
const BANDS: { label: string; min?: number; max?: number }[] = [
  { label: 'Nën €15.000', max: 15_000 },
  { label: '€15.000 – €25.000', min: 15_000, max: 25_000 },
  { label: '€25.000 – €40.000', min: 25_000, max: 40_000 },
  { label: 'Mbi €40.000', min: 40_000 },
];

function Budgets({ rate }: { rate: number }) {
  const man = (eur?: number) => (eur == null ? undefined : Math.round(eur / rate / 10_000));
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {BANDS.map((b) => {
        const priceMin = man(b.min);
        const priceMax = man(b.max);
        const q = new URLSearchParams();
        if (priceMin != null) q.set('priceMin', String(priceMin));
        if (priceMax != null) q.set('priceMax', String(priceMax));
        return (
          <Link
            key={b.label}
            href={`/cars?${q}`}
            className="group rounded-lg border border-border p-5 transition-colors hover:border-brass hover:bg-mist/50"
          >
            <p className="numeric font-display text-lg font-bold">{b.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              <ClientCount filters={{ priceMin, priceMax }} fallback="…" /> vetura
            </p>
          </Link>
        );
      })}
    </div>
  );
}

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Sa zgjat derisa vetura të arrijë në Kosovë?',
    a: `Afërsisht ${SITE.deliveryWeeks} javë derë më derë: ${SITE.route.join(' → ')}.`,
  },
  {
    q: 'Çka përfshin çmimi që shoh në faqe?',
    a: 'Çmimi i madh është çmimi i veturës në Kore, i konvertuar në euro dhe i rrumbullakuar lart në 100 €. "Me doganë" shton akcizën, tatimin në import (10%) dhe TVSH-në (18%) si vlerësim. Transportin dhe regjistrimin i përfshijmë në ofertën tonë të plotë.',
  },
  {
    q: 'Si e di nëse vetura ka pasur aksident?',
    a: 'Çdo veturë ka historinë koreane të sigurimit dhe raportin zyrtar të kontrollit teknik — dëmet e paguara, panelet e riparuara dhe gjendjen e shasisë. Në kërkim mund të filtroni vetëm veturat pa dëmtim strukture.',
  },
  {
    q: 'Po sikur vetura të shitet para se ta porosis?',
    a: 'Stoku vjen drejtpërdrejt nga Koreja dhe ndryshon çdo ditë. Nëse vetura shitet, ju gjejmë një tjetër me të njëjtat specifika.',
  },
  {
    q: 'A mund të kërkoj një veturë që nuk është në listë?',
    a: 'Po. Na tregoni modelin dhe buxhetin, dhe i kontrollojmë ankandet koreane çdo ditë për ju.',
  },
];

function Faq() {
  return (
    <section id="pyetje" className="scroll-mt-24 px-5 pt-16 md:px-8">
      <h2 className="font-display text-2xl font-bold md:text-3xl">Pyetje të shpeshta</h2>
      <div className="mt-6 max-w-3xl divide-y divide-border border-y border-border">
        {FAQ.map((f) => (
          <details key={f.q} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="text-xl leading-none text-slate transition-transform group-open:rotate-45" aria-hidden>+</span>
            </summary>
            <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
