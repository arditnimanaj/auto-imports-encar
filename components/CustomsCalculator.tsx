'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateCustoms, ENGINE_BANDS, type EngineBand } from '@/lib/customs';
import { eur } from '@/lib/format';

const THIS_YEAR = new Date().getFullYear();

export default function CustomsCalculator() {
  const [value, setValue] = useState('15000');
  const [year, setYear] = useState(String(THIS_YEAR - 5));
  const [isNew, setIsNew] = useState(false);
  const [band, setBand] = useState<EngineBand>('upTo2000');

  const yearNum = Number(year);
  const yearValid = isNew || (yearNum >= 1950 && yearNum <= THIS_YEAR);
  const r = calculateCustoms(Number(value), isNew ? 'new' : yearValid ? yearNum : NaN, band);

  const parts = [
    { label: 'Akciza', amount: r.excise, color: 'bg-brass', note: 'e përafërt' },
    { label: 'Tatimi në import (10%)', amount: r.duty, color: 'bg-steel' },
    { label: 'TVSH (18%)', amount: r.vat, color: 'bg-slate' },
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_26rem]">
      <form className="max-w-xl space-y-7" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-2">
          <Label htmlFor="value">Vlera e veturës (€)</Label>
          <Input
            id="value"
            inputMode="numeric"
            className="numeric h-12 text-lg md:text-lg"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="15000"
          />
          <p className="text-xs text-muted-foreground">
            Çmimi i blerjes së bashku me transportin deri në kufi.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="year">Viti i prodhimit</Label>
          <div className="flex items-center gap-3">
            <Input
              id="year"
              inputMode="numeric"
              maxLength={4}
              disabled={isNew}
              aria-invalid={!yearValid}
              className="numeric h-12 max-w-40 text-lg md:text-lg"
              value={isNew ? '' : year}
              onChange={(e) => setYear(e.target.value.replace(/[^\d]/g, ''))}
              placeholder={String(THIS_YEAR)}
            />
            <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="h-4 w-4 accent-brass"
              />
              Veturë e re
            </label>
          </div>
          {!yearValid && (
            <p className="text-xs text-alert">Shkruani një vit ndërmjet 1950 dhe {THIS_YEAR}.</p>
          )}
        </div>

        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-medium">Kubikazha e motorit</legend>
          <div className="grid grid-cols-3 gap-2">
            {ENGINE_BANDS.map((b) => (
              <button
                key={b.value}
                type="button"
                aria-pressed={band === b.value}
                onClick={() => setBand(b.value)}
                className={`rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
                  band === b.value
                    ? 'border-ink bg-ink text-paper'
                    : 'border-border hover:border-slate'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </fieldset>
      </form>

      <aside className="h-fit rounded-xl bg-ink p-7 text-paper lg:sticky lg:top-24">
        <p className="text-sm text-mist/70">Dogana gjithsej</p>
        <p className="numeric mt-1 font-display text-4xl font-extrabold text-brass">
          {eur(r.customs)}
        </p>

        {r.customs > 0 && (
          <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-steel">
            {parts.map((p) => (
              <div
                key={p.label}
                className={`${p.color} transition-all duration-300`}
                style={{ width: `${(p.amount / r.customs) * 100}%` }}
              />
            ))}
          </div>
        )}

        <dl className="mt-6 space-y-3 text-sm">
          {parts.map((p) => (
            <div key={p.label} className="flex items-center justify-between gap-4">
              <dt className="flex items-center gap-2 text-mist">
                <span className={`h-2.5 w-2.5 rounded-sm ${p.color}`} aria-hidden />
                {p.label}
                {p.note && <span className="text-xs text-mist/50">({p.note})</span>}
              </dt>
              <dd className="numeric font-medium">{eur(p.amount)}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 border-t border-steel pt-5">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm text-mist">Totali (vetura + dogana)</span>
            <span className="numeric font-display text-2xl font-bold">{eur(r.total)}</span>
          </div>
        </div>

        <p className="mt-6 flex gap-2 rounded-lg bg-steel/60 p-3 text-xs leading-relaxed text-mist/80">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass" aria-hidden />
          Akciza do të jetë rreth kësaj shume. Shuma përfundimtare caktohet nga
          Dogana e Kosovës gjatë zhdoganimit.
        </p>

        <Button size="lg" className="mt-6 w-full" nativeButton={false} render={<Link href="/contact" />}>
          Merr ofertë të saktë
        </Button>
      </aside>
    </div>
  );
}
