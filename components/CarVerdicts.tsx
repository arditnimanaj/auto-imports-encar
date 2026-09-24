'use client';

import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { Verdict } from '@/components/CarHistory';
import { inspectionSummary, recordSummary } from '@/lib/history';
import { inspectionQuery, recordQuery } from '@/lib/query';

/**
 * The history and inspection verdicts beside the price, since buyers weigh
 * the two together. Same queries as the full sections, so no extra requests;
 * each line opens its section further down.
 */
export default function CarVerdicts({ id, rate }: { id: string; rate: number }) {
  const record = useQuery(recordQuery(id));
  const inspection = useQuery(inspectionQuery(id));

  const lines = [
    record.data && { target: 'historia', ...recordSummary(record.data, rate) },
    inspection.data && { target: 'kontrolli', ...inspectionSummary(inspection.data) },
  ].filter((l): l is { target: string; ok: boolean; text: string } => Boolean(l));

  if (!lines.length) return null;

  function open(target: string) {
    const el = document.getElementById(target);
    if (el instanceof HTMLDetailsElement) el.open = true;
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <ul className="mt-4 divide-y divide-border rounded-lg border border-border text-sm">
      {lines.map((l) => (
        <li key={l.target}>
          <button
            onClick={() => open(l.target)}
            className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-mist/40"
          >
            <Verdict ok={l.ok}>{l.text}</Verdict>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate" aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}
