'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, TriangleAlert, X } from 'lucide-react';
import Disclosure from '@/components/Disclosure';
import { Skeleton } from '@/components/ui/skeleton';
import {
  inspectionUrl, recordUrl, type CarRecord, type Inspection,
} from '@/lib/encar-shared';
import { eur, km, toEur } from '@/lib/format';
import {
  CLAIM_TYPES, PANEL_STATUS, panelSq, splitPanel, systemResults, type Side,
} from '@/lib/history';

/** Both endpoints answer 200 with an empty body when a listing has no report. */
async function getJson<T>(url: string, valid: (d: T) => boolean): Promise<T | null> {
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(String(res.status));
  const text = await res.text();
  if (!text.trim()) return null;
  const data = JSON.parse(text) as T;
  return data && valid(data) ? data : null;
}

/**
 * The car's Korean insurance history and its statutory inspection report,
 * the two things a buyer abroad cannot check for themselves.
 */
export default function CarHistory({ id, rate }: { id: string; rate: number }) {
  const record = useQuery({
    queryKey: ['record', id],
    queryFn: () => getJson<CarRecord>(recordUrl(id), (d) => typeof d.myAccidentCnt === 'number'),
  });
  const inspection = useQuery({
    queryKey: ['inspection', id],
    queryFn: () => getJson<Inspection>(inspectionUrl(id), (d) => Boolean(d.master)),
  });

  if (record.isPending && inspection.isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-[4.5rem] rounded-lg" />
        <Skeleton className="h-[4.5rem] rounded-lg" />
      </div>
    );
  }

  if (!record.data && !inspection.data) return null;

  return (
    <>
      {record.data && <History r={record.data} rate={rate} />}
      {inspection.data && <Condition insp={inspection.data} />}
    </>
  );
}

/* ------------------------------------------------------------------ */

function History({ r, rate }: { r: CarRecord; rate: number }) {
  const [all, setAll] = useState(false);
  const claims = [...(r.accidents ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  const shown = all ? claims : claims.slice(0, 4);
  const flood = r.floodTotalLossCnt + (r.floodPartLossCnt ?? 0);

  const checks: [string, boolean][] = [
    ['Humbje totale', r.totalLossCnt > 0],
    ['Përmbytje', flood > 0],
    ['Vjedhje', r.robberCnt > 0],
    ['Taksi / komerciale', r.business > 0],
    ['Me qira', r.loan > 0],
    ['Institucion shtetëror', r.government > 0],
  ];

  const flagged = checks.filter(([, hit]) => hit).map(([label]) => label);
  const clean = !r.myAccidentCnt && !flagged.length;
  const summary = [
    r.myAccidentCnt
      ? `${r.myAccidentCnt} ${r.myAccidentCnt === 1 ? 'dëm' : 'dëme'} · ${eur(toEur(r.myAccidentCost, rate))}`
      : 'Pa dëme të veturës',
    ...flagged,
    `${r.ownerChangeCnt} ${r.ownerChangeCnt === 1 ? 'ndërrim' : 'ndërrime'} pronari`,
  ].join(' · ');

  return (
    <Disclosure title="Historia e sigurimit" summary={<Verdict ok={clean}>{summary}</Verdict>}>
      <p className="mb-4 text-xs text-muted-foreground">
        Nga regjistri korean i siguracioneve (KIDI), përmes Encar.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Dëme të veturës"
          value={r.myAccidentCnt}
          sub={r.myAccidentCnt ? eur(toEur(r.myAccidentCost, rate)) : 'Asnjë'}
        />
        <Stat
          label="Dëme ndaj të tjerëve"
          value={r.otherAccidentCnt}
          sub={r.otherAccidentCnt ? eur(toEur(r.otherAccidentCost, rate)) : 'Asnjë'}
        />
        <Stat label="Ndërrime pronari" value={r.ownerChangeCnt} neutral />
        <Stat label="Ndërrime targash" value={r.carNoChangeCnt} neutral />
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2.5 text-sm sm:grid-cols-3">
        {checks.map(([label, hit]) => (
          <li key={label} className="flex items-center gap-2">
            <Mark ok={!hit} />
            <span className={hit ? 'font-medium text-alert' : ''}>{label}</span>
            <span className="text-muted-foreground">{hit ? 'Po' : 'Jo'}</span>
          </li>
        ))}
      </ul>

      {claims.length > 0 && (
        <div className="mt-7">
          <h3 className="text-sm font-semibold">Dëmet e raportuara</h3>
          <ol className="mt-3 divide-y divide-border rounded-lg border border-border">
            {shown.map((c, i) => (
              <li key={`${c.date}-${i}`} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{CLAIM_TYPES[c.type] ?? 'Dëm'}</p>
                  <p className="numeric text-xs text-muted-foreground">
                    {date(c.date)}
                    {c.insuranceBenefit > 0 && (
                      <> · Pjesë {eur(toEur(c.partCost, rate))} · Punë {eur(toEur(c.laborCost, rate))}
                        {c.paintingCost > 0 && <> · Ngjyrosje {eur(toEur(c.paintingCost, rate))}</>}
                      </>
                    )}
                  </p>
                </div>
                <p className="numeric text-sm font-semibold">
                  {c.insuranceBenefit > 0 ? eur(toEur(c.insuranceBenefit, rate)) : 'Pa pagesë'}
                </p>
              </li>
            ))}
          </ol>
          {claims.length > shown.length && (
            <button
              onClick={() => setAll(true)}
              className="mt-2 text-sm font-medium text-slate hover:text-ink hover:underline"
            >
              Shfaq të gjitha ({claims.length})
            </button>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Shumat janë pagesat e siguracionit, të konvertuara në euro.
          </p>
        </div>
      )}
    </Disclosure>
  );
}

/* ------------------------------------------------------------------ */

type Tone = 'bad' | 'warn';

function Condition({ insp }: { insp: Inspection }) {
  const d = insp.master.detail;
  const panels = (insp.outers ?? []).map((o) => {
    const statuses = o.statusTypes.map((s) => PANEL_STATUS[s.code] ?? { label: s.title, tone: 'warn' as Tone });
    const tone: Tone = statuses.some((s) => s.tone === 'bad') ? 'bad' : 'warn';
    return { title: o.type.title, name: panelSq(o.type.title), statuses, tone };
  });
  const systems = d ? systemResults(insp) : [];

  const verdicts: [string, boolean, string][] = [
    ['Struktura (shasia)', !insp.master.accdient, insp.master.accdient ? 'E dëmtuar' : 'Pa dëmtim'],
    ['Panelet e jashtme', !insp.master.simpleRepair && !panels.length,
      panels.length ? `${panels.length} të riparuara` : insp.master.simpleRepair ? 'Të riparuara' : 'Origjinale'],
  ];
  if (d?.waterlog != null) verdicts.push(['Përmbytje', !d.waterlog, d.waterlog ? 'Po' : 'Jo']);
  if (d?.tuning != null) verdicts.push(['Modifikime', !d.tuning, d.tuning ? 'Po' : 'Jo']);

  const meta = [
    d?.issueDate && `Kontrolluar më ${date(d.issueDate)}`,
    d?.mileage != null && `në ${km(d.mileage)}`,
  ].filter(Boolean).join(' ');

  const mechanical = systems.filter((s) => s.findings.length).length;
  const bodyNote = panels.length
    ? `${panels.length} ${panels.length === 1 ? 'panel i riparuar' : 'panele të riparuara'}`
    : insp.master.simpleRepair ? 'Panele të riparuara' : 'Panelet origjinale';
  const summary = [
    insp.master.accdient ? 'Dëmtim i strukturës' : 'Pa dëmtim strukture',
    bodyNote,
    mechanical ? `${mechanical} vërejtje mekanike` : null,
  ].filter(Boolean).join(' · ');
  const clean = !insp.master.accdient && !insp.master.simpleRepair && !panels.length && !mechanical;

  return (
    <Disclosure title="Kontrolli teknik" summary={<Verdict ok={clean}>{summary}</Verdict>}>
      <p className="mb-4 text-xs text-muted-foreground">
        Raporti zyrtar i gjendjes në Kore{meta ? ` · ${meta}` : ''}.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {verdicts.map(([label, ok, value]) => (
          <div key={label} className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`mt-1.5 flex items-center gap-1.5 text-sm font-semibold ${ok ? 'text-ok' : 'text-alert'}`}>
              <Mark ok={ok} />
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 rounded-lg border border-border p-5 sm:grid-cols-[9.5rem_1fr]">
        <BodyDiagram panels={panels} />
        <div>
          <h3 className="text-sm font-semibold">Karroceria</h3>
          {panels.length ? (
            <ul className="mt-3 space-y-2.5 text-sm">
              {panels.map((p) => (
                <li key={p.title} className="flex items-start justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${p.tone === 'bad' ? 'bg-alert' : 'bg-alert/45'}`} aria-hidden />
                    {p.name}
                  </span>
                  <span className="text-right text-muted-foreground">
                    {p.statuses.map((s) => s.label).join(', ')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 flex items-center gap-2 text-sm">
              <Mark ok />
              {insp.master.simpleRepair
                ? 'Raporti shënon riparim, por pa detaje për panelet.'
                : 'Asnjë panel i ndërruar apo i riparuar.'}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-alert" />Ndërruar</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-alert/45" />Riparuar</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-slate/40 bg-paper" />Origjinale</span>
          </div>
        </div>
      </div>

      {systems.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold">Mekanika</h3>
          <ul className="mt-3 grid gap-x-6 sm:grid-cols-2">
            {systems.map((s) => (
              <li key={s.code} className="flex items-start justify-between gap-3 border-b border-border py-2.5 text-sm">
                <span>{s.name}</span>
                {s.findings.length ? (
                  <span className="flex items-center gap-1.5 text-right font-medium text-alert">
                    <TriangleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {s.findings.join(', ')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-ok">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    Në rregull
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Disclosure>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Top-down outline, front at the top. Only outer panels are drawn; frame
 * parts are inside the car and appear in the list alone. Shapes are keyed by
 * the Korean panel name plus side, as splitPanel returns them.
 */
const SHAPES: { key: string; side: Side; x: number; y: number; w: number; h: number; r?: number }[] = [
  { key: '라디에이터 서포트', side: null, x: 44, y: 12, w: 72, h: 12, r: 4 },
  { key: '후드', side: null, x: 40, y: 28, w: 80, h: 70, r: 10 },
  { key: '프론트 휀더', side: 'L', x: 16, y: 32, w: 20, h: 72, r: 7 },
  { key: '프론트 휀더', side: 'R', x: 124, y: 32, w: 20, h: 72, r: 7 },
  { key: '프론트 도어', side: 'L', x: 16, y: 108, w: 20, h: 64, r: 3 },
  { key: '프론트 도어', side: 'R', x: 124, y: 108, w: 20, h: 64, r: 3 },
  { key: '리어 도어', side: 'L', x: 16, y: 176, w: 20, h: 60, r: 3 },
  { key: '리어 도어', side: 'R', x: 124, y: 176, w: 20, h: 60, r: 3 },
  { key: '사이드실 패널', side: 'L', x: 8, y: 110, w: 5, h: 124, r: 2 },
  { key: '사이드실 패널', side: 'R', x: 147, y: 110, w: 5, h: 124, r: 2 },
  { key: '루프 패널', side: null, x: 42, y: 134, w: 76, h: 100, r: 6 },
  { key: '쿼터 패널', side: 'L', x: 16, y: 240, w: 20, h: 60, r: 7 },
  { key: '쿼터 패널', side: 'R', x: 124, y: 240, w: 20, h: 60, r: 7 },
  { key: '트렁크 리드', side: null, x: 40, y: 262, w: 80, h: 42, r: 8 },
];

function BodyDiagram({ panels }: { panels: { title: string; tone: Tone }[] }) {
  const tones = new Map<string, Tone>();
  for (const p of panels) {
    const { base, side } = splitPanel(p.title);
    const key = base.replace(/\(.*\)$/, '').trim();
    tones.set(`${key}|${side}`, p.tone);
  }

  return (
    <svg viewBox="0 0 160 320" className="mx-auto h-64 w-auto sm:h-72" role="img" aria-label="Skema e karrocerisë">
      <rect x="12" y="6" width="136" height="306" rx="34" className="fill-mist" />
      {/* Glass, for orientation only. */}
      <rect x="44" y="102" width="72" height="28" rx="6" className="fill-slate/20" />
      <rect x="44" y="238" width="72" height="20" rx="6" className="fill-slate/20" />
      {SHAPES.map((s) => {
        const tone = tones.get(`${s.key}|${s.side}`);
        return (
          <rect
            key={`${s.key}|${s.side}`}
            x={s.x} y={s.y} width={s.w} height={s.h} rx={s.r ?? 4}
            className={
              tone === 'bad' ? 'fill-alert'
                : tone === 'warn' ? 'fill-alert/45'
                  : 'fill-paper stroke-slate/40'
            }
            strokeWidth={1}
          />
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */

function Verdict({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span className="flex items-start gap-1.5">
      {ok
        ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden />
        : <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-alert" aria-hidden />}
      <span>{children}</span>
    </span>
  );
}

function Stat({
  label, value, sub, neutral,
}: { label: string; value: number; sub?: string; neutral?: boolean }) {
  const tone = neutral ? '' : value ? 'text-alert' : 'text-ok';
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`numeric mt-1 font-display text-2xl font-bold ${tone}`}>{value}</p>
      {sub && <p className="numeric mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Mark({ ok }: { ok: boolean }) {
  return ok
    ? <Check className="h-4 w-4 shrink-0 text-ok" aria-hidden />
    : <X className="h-4 w-4 shrink-0 text-alert" aria-hidden />;
}

/** "2025-07-22" or "20250722" -> "22.07.2025". */
function date(v: string): string {
  const m = v.match(/^(\d{4})-?(\d{2})-?(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : v;
}
