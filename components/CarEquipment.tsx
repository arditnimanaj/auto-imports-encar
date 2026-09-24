import { Check } from 'lucide-react';
import Disclosure from '@/components/Disclosure';
import { equipment } from '@/lib/options';

/** The listing's fitted equipment, grouped as Encar groups it. */
export default function CarEquipment({ codes }: { codes?: string[] }) {
  const { groups, count, highlights } = equipment(codes);
  if (!count) return null;

  const teaser = highlights.slice(0, 3).join(', ');
  return (
    <Disclosure
      title="Opsionet shtesë"
      summary={`${count} opsione${teaser ? ` · ${teaser}` : ''}`}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {groups.map((g) => (
          <div key={g.code}>
            <h3 className="text-sm font-semibold">{g.name}</h3>
            <ul className="mt-2.5 space-y-1.5 text-sm">
              {g.items.map((name) => (
                <li key={name} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden />
                  {name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Disclosure>
  );
}
