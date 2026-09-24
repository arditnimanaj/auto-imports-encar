import Link from 'next/link';
import { Info } from 'lucide-react';
import { calculateCustoms, type EngineBand } from '@/lib/customs';
import { eur } from '@/lib/format';

/** Engine band from Encar's displacement. Unknown (or electric) counts as small. */
function bandFor(cc: number | undefined): EngineBand {
  if (!cc || cc <= 2000) return 'upTo2000';
  return cc <= 3000 ? 'upTo3000' : 'over3000';
}

const up100 = (n: number) => Math.ceil(n / 100) * 100;

/**
 * The car's set price, then how far it can go once Kosovo customs are added:
 * excise from engine size and age, 10% import duty and 18% VAT, each shown as
 * a slice of the total so the buyer sees where the money goes.
 */
export default function PriceCard({
  price, year, displacement,
}: { price: number; year: number; displacement?: number }) {
  const r = calculateCustoms(price, year || new Date().getFullYear(), bandFor(displacement));
  const total = up100(r.total);

  const parts = [
    { label: 'Vetura', amount: price, color: 'bg-paper/80' },
    { label: 'Akciza', amount: r.excise, color: 'bg-brass', note: 'e përafërt' },
    { label: 'Tatimi në import (10%)', amount: r.duty, color: 'bg-mist/40' },
    { label: 'TVSH (18%)', amount: r.vat, color: 'bg-slate' },
  ];

  return (
    <div className="mt-6 overflow-hidden rounded-xl bg-ink text-paper">
      <div className="p-6">
        <p className="text-sm text-mist/70">Çmimi i veturës</p>
        <p className="numeric mt-1 font-display text-4xl font-extrabold text-brass">
          {eur(price)}
        </p>
      </div>

      <div className="border-t border-steel bg-steel/40 p-6">
        <p className="text-sm text-mist/70">Me doganë në Kosovë, deri në</p>
        <p className="numeric mt-1 font-display text-3xl font-bold">{eur(total)}</p>

        <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-steel" aria-hidden>
          {parts.map((p) => (
            <div
              key={p.label}
              className={p.color}
              style={{ width: `${(p.amount / r.total) * 100}%` }}
            />
          ))}
        </div>

        <dl className="mt-5 space-y-2.5 text-sm">
          {parts.map((p) => (
            <div key={p.label} className="flex items-center justify-between gap-4">
              <dt className="flex items-center gap-2 text-mist">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${p.color}`} aria-hidden />
                {p.label}
                {p.note && <span className="text-xs text-mist/50">({p.note})</span>}
              </dt>
              <dd className="numeric font-medium">{eur(p.amount)}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 flex gap-2 text-xs leading-relaxed text-mist/70">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass" aria-hidden />
          <span>
            Vlerësim. Shuma përfundimtare caktohet nga Dogana e Kosovës.{' '}
            <Link href="/kalkulatori" className="text-brass hover:underline">
              Kalkulatori i doganës
            </Link>
          </span>
        </p>
      </div>
    </div>
  );
}
