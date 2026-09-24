import Link from 'next/link';
import { MESSAGING, NAV, SITE, STEPS } from '@/lib/site';

export default function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink px-5 py-14 text-mist md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-extrabold text-paper">
            Auto Kosova <span className="font-medium text-brass">Import</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-slate">{SITE.tagline}</p>
          <p className="mt-4 text-sm text-slate">{SITE.route.join(' → ')}</p>
        </div>

        <nav>
          <p className="text-sm font-semibold text-paper">Faqet</p>
          <ul className="mt-3 space-y-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} prefetch={false} className="text-sm text-slate hover:text-mist">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-sm">
          <p className="font-semibold text-paper">Si funksionon</p>
          <ol className="mt-3 space-y-2 text-slate">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <span className="numeric text-brass">{i + 1}.</span> {step.title}
              </li>
            ))}
          </ol>
          <Link href="/#pyetje" prefetch={false} className="mt-3 inline-block text-mist hover:text-brass">
            Pyetje të shpeshta →
          </Link>
        </div>

        <address className="text-sm not-italic">
          <p className="font-semibold text-paper">Na vizitoni ose telefononi</p>
          <p className="mt-3 text-slate">{SITE.address}</p>
          <p className="mt-2">
            <a href={MESSAGING.tel} className="numeric text-mist hover:text-brass">
              {SITE.phone}
            </a>
          </p>
          <p className="mt-1 flex gap-3">
            <a href={MESSAGING.whatsapp()} target="_blank" rel="noopener" className="text-mist hover:text-brass">WhatsApp</a>
            <a href={MESSAGING.viber} className="text-mist hover:text-brass">Viber</a>
          </p>
          <p>
            <a href={`mailto:${SITE.email}`} className="text-mist hover:text-brass">
              {SITE.email}
            </a>
          </p>
          <p className="mt-3 text-slate">{SITE.hours}</p>
        </address>
      </div>

      <p className="mx-auto mt-12 max-w-7xl border-t border-steel pt-6 text-xs text-slate">
        Stoku merret drejtpërdrejt nga Encar, tregu më i madh i veturave të
        përdorura në Kore. Çmimet konvertohen nga woni korean dhe nuk përfshijnë
        transportin, doganën dhe regjistrimin përveç nëse thuhet ndryshe.
      </p>
    </footer>
  );
}
