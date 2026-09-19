'use client';

import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { FUEL_OPTIONS, makeEn, modelEn } from '@/lib/i18n';

type Props = {
  makes: { name: string; count: number }[];
  /** Empty until a make is chosen -- Encar scopes models to a manufacturer. */
  models: { name: string; count: number }[];
};

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'priceAsc', label: 'Price: low to high' },
  { value: 'priceDesc', label: 'Price: high to low' },
  { value: 'mileageAsc', label: 'Mileage: low to high' },
  { value: 'mileageDesc', label: 'Mileage: high to low' },
];

/** Encar prices are in 만원 (10k KRW); labels show the rough euro equivalent. */
const BUDGETS = [
  { value: '2500', label: 'Up to €16,000' },
  { value: '4000', label: 'Up to €25,000' },
  { value: '6000', label: 'Up to €38,000' },
  { value: '9000', label: 'Up to €57,000' },
  { value: '15000', label: 'Up to €94,000' },
];

const ANY = 'any';

export default function SearchBar({ makes, models }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  // Every control writes to the URL so results stay shareable and the server
  // components re-render with the new filters.
  function apply(changes: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v && v !== ANY) next.set(k, v);
      else next.delete(k);
    }
    next.delete('page'); // a filter change invalidates the current page
    start(() => router.push(`/cars${next.toString() ? `?${next}` : ''}`));
  }

  const get = (k: string) => params.get(k) ?? '';
  const active = ['q', 'make', 'model', 'fuel', 'priceMax', 'sort'].filter((k) => get(k));

  return (
    <div className="sticky top-[4.5rem] z-30 border-b border-border bg-paper/95 backdrop-blur supports-backdrop-filter:bg-paper/80">
      <form
        className="flex flex-wrap items-center gap-2 px-5 py-3 md:px-8"
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get('q');
          apply({ q: typeof q === 'string' ? q.trim() : '' });
        }}
      >
        <div className="relative min-w-0 flex-1 basis-56">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            name="q"
            defaultValue={get('q')}
            placeholder="Search model — X5, E-Class, Tucson"
            aria-label="Search by model"
            className="pl-9"
          />
        </div>

        <Select value={get('make') || ANY} onValueChange={(v) => apply({ make: String(v ?? ""), model: "" })}>
          <SelectTrigger className="w-40" aria-label="Make">
            <SelectValue>{(v: string) => (v && v !== ANY ? makeEn(v) : "Any make")}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any make</SelectItem>
            {makes.map((m) => (
              <SelectItem key={m.name} value={m.name}>
                {makeEn(m.name)} ({m.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={get('model') || ANY}
          onValueChange={(v) => apply({ model: String(v ?? '') })}
          disabled={!models.length}
        >
          <SelectTrigger className="w-44" aria-label="Model">
            <SelectValue>
              {(v: string) =>
                v && v !== ANY
                  ? modelEn(v)
                  : models.length ? 'Any model' : 'Any model'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any model</SelectItem>
            {models.map((m) => (
              <SelectItem key={m.name} value={m.name}>
                {modelEn(m.name)} ({m.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={get('fuel') || ANY} onValueChange={(v) => apply({ fuel: String(v ?? "") })}>
          <SelectTrigger className="w-32" aria-label="Fuel">
            <SelectValue>{(v: string) => FUEL_OPTIONS.find((f) => f.value === v)?.label ?? "Any fuel"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any fuel</SelectItem>
            {FUEL_OPTIONS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={get('priceMax') || ANY} onValueChange={(v) => apply({ priceMax: String(v ?? "") })}>
          <SelectTrigger className="w-40" aria-label="Budget">
            <SelectValue>{(v: string) => BUDGETS.find((b) => b.value === v)?.label ?? "Any price"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any price</SelectItem>
            {BUDGETS.map((b) => (
              <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={get('sort') || 'newest'} onValueChange={(v) => apply({ sort: v === "newest" ? "" : String(v ?? "") })}>
          <SelectTrigger className="w-44" aria-label="Sort">
            <SelectValue>
              {(v: string) => SORTS.find((o) => o.value === v)?.label ?? 'Newest first'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" disabled={pending}>
          {pending ? 'Searching' : 'Search'}
        </Button>

        {active.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => start(() => router.push('/cars'))}
          >
            <X className="h-4 w-4" />
            Clear {active.length}
          </Button>
        )}
      </form>
    </div>
  );
}
