import { ChevronDown } from 'lucide-react';

/**
 * A closed-by-default section whose one-line summary carries the verdict, so
 * the car page stays short and the detail is a tap away. Native <details>,
 * so it needs no script and opens with find-in-page.
 */
export default function Disclosure({
  title, summary, children,
}: { title: string; summary: React.ReactNode; children: React.ReactNode }) {
  return (
    <details className="group rounded-lg border border-border open:pb-1">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-5 py-4 transition-colors hover:bg-mist/40 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block font-display text-lg font-bold">{title}</span>
          <span className="mt-0.5 block text-sm text-muted-foreground">{summary}</span>
        </span>
        <ChevronDown
          className="h-5 w-5 shrink-0 text-slate transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="px-5 pt-2 pb-4">{children}</div>
    </details>
  );
}
