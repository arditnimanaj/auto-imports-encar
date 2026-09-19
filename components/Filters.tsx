'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

type Props = { makes: { name: string; count: number }[] };

const SORT_LABELS: Record<string, string> = {
  newest: 'Newest',
  priceAsc: 'Price: low to high',
  priceDesc: 'Price: high to low',
  mileageAsc: 'Mileage: low to high',
  mileageDesc: 'Mileage: high to low',
  year: 'Year',
};

export default function Filters({ makes }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  // Every control writes straight to the URL, so results stay shareable and
  // the server component re-renders with the new filters.
  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page'); // any filter change resets paging
    start(() => router.push(next.toString() ? `/?${next}` : '/'));
  }

  const field =
    'rounded border border-[color:var(--color-line)] px-2 py-1.5 text-sm';

  return (
    <form
      className="mb-6 flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get('q');
        set('q', typeof q === 'string' ? q.trim() : '');
      }}
    >
      <label className="flex flex-col gap-1">
        <span className="text-xs text-[color:var(--color-muted)]">Search</span>
        <input
          name="q"
          defaultValue={params.get('q') ?? ''}
          placeholder="model, e.g. X5"
          className={field}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-[color:var(--color-muted)]">Make</span>
        <select
          value={params.get('make') ?? ''}
          onChange={(e) => set('make', e.target.value)}
          className={field}
        >
          <option value="">All makes</option>
          {makes.map((m) => (
            <option key={m.name} value={m.name}>
              {m.name} ({m.count})
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-[color:var(--color-muted)]">Year</span>
        {/* Nothing older than 2026 is ever listed, so this is the full range. */}
        <select
          value={params.get('yearFrom') ?? ''}
          onChange={(e) => set('yearFrom', e.target.value)}
          className={field}
        >
          <option value="">2026+</option>
          <option value="2026">2026</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-[color:var(--color-muted)]">Max price (EUR)</span>
        <select
          value={params.get('priceMax') ?? ''}
          onChange={(e) => set('priceMax', e.target.value)}
          className={field}
        >
          <option value="">Any</option>
          {/* Values are Encar's 만원 units; labels are the rough EUR equivalent. */}
          <option value="3000">under €19k</option>
          <option value="5000">under €31k</option>
          <option value="8000">under €50k</option>
          <option value="12000">under €75k</option>
          <option value="20000">under €126k</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-[color:var(--color-muted)]">Sort</span>
        <select
          value={params.get('sort') ?? 'newest'}
          onChange={(e) => set('sort', e.target.value === 'newest' ? '' : e.target.value)}
          className={field}
        >
          {Object.entries(SORT_LABELS).map(([k, label]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </select>
      </label>

      <button type="submit" className={`${field} bg-gray-50 font-medium`}>
        Apply
      </button>
      {params.toString() && (
        <button
          type="button"
          onClick={() => start(() => router.push('/'))}
          className="px-1 pb-2 text-sm text-[color:var(--color-muted)] underline"
        >
          Reset
        </button>
      )}
      {pending && (
        <span className="pb-2 text-sm text-[color:var(--color-muted)]">loading…</span>
      )}
    </form>
  );
}
