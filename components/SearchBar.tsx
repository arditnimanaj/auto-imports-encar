'use client';

import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { YEAR_FLOOR_YEAR } from '@/lib/encar-shared';
import { FUEL_OPTIONS, makeSq, modelSq } from '@/lib/i18n';
import { useFacets } from '@/lib/use-facets';



const SORTS = [
  { value: 'newest', label: 'Më të rejat në fillim' },
  { value: 'priceAsc', label: 'Çmimi: i ulët te i lartë' },
  { value: 'priceDesc', label: 'Çmimi: i lartë te i ulët' },
  { value: 'mileageAsc', label: 'Kilometrazhi: i ulët te i lartë' },
  { value: 'mileageDesc', label: 'Kilometrazhi: i lartë te i ulët' },
];

/** Encar prices are in 만원 (10k KRW); labels show the rough euro equivalent. */
const BUDGETS = [
  { value: '2500', label: 'Deri në €16.000' },
  { value: '4000', label: 'Deri në €25.000' },
  { value: '6000', label: 'Deri në €38.000' },
  { value: '9000', label: 'Deri në €57.000' },
  { value: '15000', label: 'Deri në €94.000' },
];

const ANY = 'any';

/** Model years we list, newest first. */
const YEARS = Array.from(
  { length: new Date().getFullYear() - YEAR_FLOOR_YEAR + 1 },
  (_, i) => new Date().getFullYear() - i,
);

export default function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const selectedMake = params.get('make') ?? '';
  // Facets come from the browser too, so nothing here depends on the server.
  const makes = useFacets('Manufacturer', []);
  const models = useFacets('ModelGroup', [], { make: selectedMake }, Boolean(selectedMake));

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
  const active = ['q', 'make', 'model', 'fuel', 'yearFrom', 'priceMax', 'sort']
    .filter((k) => get(k));

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
            placeholder="Kërko model — X5, E-Class, Tucson"
            aria-label="Kërko sipas modelit"
            className="pl-9"
          />
        </div>

        <Select value={get('make') || ANY} onValueChange={(v) => apply({ make: String(v ?? ""), model: "" })}>
          <SelectTrigger className="w-40" aria-label="Marka">
            <SelectValue>{(v: string) => (v && v !== ANY ? makeSq(v) : "Çdo markë")}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Çdo markë</SelectItem>
            {makes.map((m) => (
              <SelectItem key={m.name} value={m.name}>
                {makeSq(m.name)} ({m.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={get('model') || ANY}
          onValueChange={(v) => apply({ model: String(v ?? '') })}
          disabled={!models.length}
        >
          <SelectTrigger className="w-44" aria-label="Modeli">
            <SelectValue>
              {(v: string) => (v && v !== ANY ? modelSq(v) : 'Çdo model')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Çdo model</SelectItem>
            {models.map((m) => (
              <SelectItem key={m.name} value={m.name}>
                {modelSq(m.name)} ({m.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={get('fuel') || ANY} onValueChange={(v) => apply({ fuel: String(v ?? "") })}>
          <SelectTrigger className="w-32" aria-label="Karburanti">
            <SelectValue>{(v: string) => FUEL_OPTIONS.find((f) => f.value === v)?.label ?? "Çdo karburant"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Çdo karburant</SelectItem>
            {FUEL_OPTIONS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={get('yearFrom') || ANY} onValueChange={(v) => apply({ yearFrom: String(v ?? '') })}>
          <SelectTrigger className="w-36" aria-label="Viti nga">
            <SelectValue>
              {(v: string) => (v && v !== ANY ? `${v} e tutje` : 'Çdo vit')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Çdo vit</SelectItem>
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)}>{y} e tutje</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={get('priceMax') || ANY} onValueChange={(v) => apply({ priceMax: String(v ?? "") })}>
          <SelectTrigger className="w-40" aria-label="Buxheti">
            <SelectValue>{(v: string) => BUDGETS.find((b) => b.value === v)?.label ?? "Çdo çmim"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Çdo çmim</SelectItem>
            {BUDGETS.map((b) => (
              <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={get('sort') || 'newest'} onValueChange={(v) => apply({ sort: v === "newest" ? "" : String(v ?? "") })}>
          <SelectTrigger className="w-44" aria-label="Renditja">
            <SelectValue>
              {(v: string) => SORTS.find((o) => o.value === v)?.label ?? 'Më të rejat në fillim'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" disabled={pending}>
          {pending ? 'Duke kërkuar' : 'Kërko'}
        </Button>

        {active.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => start(() => router.push('/cars'))}
          >
            <X className="h-4 w-4" />
            Pastro {active.length}
          </Button>
        )}
      </form>
    </div>
  );
}
