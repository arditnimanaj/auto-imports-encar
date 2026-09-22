import { Mail, MapPin, Phone } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'Kontakti',
  description: `Flisni me ${SITE.name} për importin e një veture nga Koreja në Kosovë.`,
};

export default async function ContactPage({
  searchParams,
}: { searchParams: Promise<{ car?: string }> }) {
  const { car } = await searchParams;

  return (
    <>
      <section className="bg-ink px-5 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-3xl font-extrabold text-paper md:text-5xl">
            Na tregoni çfarë po kërkoni.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-mist">
            Dërgoni modelin dhe buxhetin tuaj. Përgjigjemi brenda një dite pune
            me atë që është në dispozicion dhe çmimin e plotë të dorëzuar në {SITE.city}.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:px-8 lg:grid-cols-[1fr_20rem]">
        <ContactForm presetCar={car} />

        <aside className="lg:border-l lg:border-border lg:pl-10">
          <h2 className="font-display text-lg font-bold">Na kontaktoni drejtpërdrejt</h2>
          <ul className="mt-5 space-y-5 text-sm">
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brass" aria-hidden />
              <div>
                <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="numeric font-medium hover:text-brass">
                  {SITE.phone}
                </a>
                <p className="mt-0.5 text-muted-foreground">{SITE.hours}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brass" aria-hidden />
              <a href={`mailto:${SITE.email}`} className="font-medium hover:text-brass">
                {SITE.email}
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brass" aria-hidden />
              <address className="not-italic text-muted-foreground">{SITE.address}</address>
            </li>
          </ul>

          <h2 className="mt-10 font-display text-lg font-bold">Si funksionon importi</h2>
          <ol className="mt-4 space-y-4 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-ink">Ju zgjidhni një veturë.</span> Nga
              stoku ynë, ose na tregoni specifikat dhe i kërkojmë në ankandet koreane.
            </li>
            <li>
              <span className="font-medium text-ink">Ju ofertojmë çmimin e dorëzuar.</span>{' '}
              Vetura, transporti detar, dogana, TVSH-ja dhe regjistrimi — një shifër e vetme.
            </li>
            <li>
              <span className="font-medium text-ink">Transporti.</span>{' '}
              {SITE.route.join(' → ')}, afërsisht 6–8 javë derë më derë.
            </li>
            <li>
              <span className="font-medium text-ink">Ju i merrni çelësat.</span>{' '}
              E regjistruar dhe e gatshme për rrugë në Kosovë.
            </li>
          </ol>
        </aside>
      </div>
    </>
  );
}
