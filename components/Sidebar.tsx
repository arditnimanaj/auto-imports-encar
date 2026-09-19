'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { FUEL_OPTIONS, makeEn } from '@/lib/i18n';
import { useFacets } from '@/lib/use-facets';

type Props = { makes: { name: string; count: number }[] };

export default function Sidebar({ makes: serverMakes }: Props) {
  const params = useSearchParams();
  const makes = useFacets('Manufacturer', serverMakes);
  const [open, setOpen] = useState(false);
  const activeMake = params.get('make') ?? '';
  const activeFuel = params.get('fuel') ?? '';

  const keep = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete('page');
    return `/cars${next.toString() ? `?${next}` : ''}`;
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 border-b border-border px-5 py-3 text-sm font-medium lg:hidden"
        aria-expanded={open}
      >
        <SlidersHorizontal className="h-4 w-4" />
        {open ? 'Hide makes' : 'Browse by make'}
      </button>

      <aside
        className={`${open ? 'block' : 'hidden'} border-r border-border bg-mist/40 lg:block`}
      >
        <div className="lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-4.5rem)] lg:overflow-y-auto">
          <nav className="p-5">
            <p className="text-sm font-semibold">Make</p>
            <ul className="mt-2.5 space-y-0.5">
              <li>
                <Link
                  href={keep({ make: '' })}
                  className={`flex items-baseline justify-between rounded px-2.5 py-1.5 text-sm transition-colors ${
                    activeMake
                      ? 'text-muted-foreground hover:bg-paper'
                      : 'bg-paper font-medium shadow-xs'
                  }`}
                >
                  All makes
                </Link>
              </li>
              {makes.map((m) => (
                <li key={m.name}>
                  <Link
                    href={keep({ make: m.name })}
                    className={`flex items-baseline justify-between rounded px-2.5 py-1.5 text-sm transition-colors ${
                      activeMake === m.name
                        ? 'bg-paper font-medium shadow-xs'
                        : 'text-muted-foreground hover:bg-paper'
                    }`}
                  >
                    <span className="truncate">{makeEn(m.name)}</span>
                    <span className="numeric ml-2 shrink-0 text-xs">{m.count}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-7 text-sm font-semibold">Fuel</p>
            <ul className="mt-2.5 space-y-0.5">
              {FUEL_OPTIONS.map((f) => (
                <li key={f.value}>
                  <Link
                    href={keep({ fuel: activeFuel === f.value ? '' : f.value })}
                    className={`block rounded px-2.5 py-1.5 text-sm transition-colors ${
                      activeFuel === f.value
                        ? 'bg-paper font-medium shadow-xs'
                        : 'text-muted-foreground hover:bg-paper'
                    }`}
                  >
                    {f.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
