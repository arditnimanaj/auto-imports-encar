// Albanian labels for Encar's insurance history and inspection report. As in
// lib/i18n, anything unmapped falls through in Korean rather than vanishing.

import type { Inspection, InspectionItem } from './encar-shared';

export const CLAIM_TYPES: Record<string, string> = {
  '1': 'Dëm i veturës (siguracioni i vet)',
  '2': 'Dëm i veturës (siguracioni i palës tjetër)',
  '3': 'Dëm i shkaktuar veturës tjetër',
};

/** Panels on the body diagram, keyed by the Korean name without its side. */
export const PANELS: Record<string, string> = {
  '후드': 'Kapaku i motorit',
  '프론트 휀더': 'Parafango e përparme',
  '프론트 도어': 'Dera e përparme',
  '리어 도어': 'Dera e pasme',
  '트렁크 리드': 'Kapaku i bagazhit',
  '라디에이터 서포트(볼트체결부품)': 'Mbajtësi i radiatorit',
  '라디에이터 서포트': 'Mbajtësi i radiatorit',
  '쿼터 패널': 'Parafango e pasme',
  '루프 패널': 'Kulmi',
  '사이드실 패널': 'Pragu anësor',
  // Frame (골격) parts. Damage here is what makes a car an "accident car".
  '프론트 패널': 'Paneli i përparmë',
  '크로스 멤버': 'Traversa',
  '인사이드 패널': 'Paneli i brendshëm',
  '트렁크 플로어': 'Dyshemeja e bagazhit',
  '리어 패널': 'Paneli i pasmë',
  '사이드 멤버': 'Trau anësor',
  '휠하우스': 'Foleja e rrotës',
  '필러 패널': 'Shtylla',
  '패키지트레이': 'Rafti i pasmë',
  '대쉬 패널': 'Paneli i kruskotit',
  '플로어 패널': 'Dyshemeja',
};

export const PANEL_STATUS: Record<string, { label: string; tone: 'bad' | 'warn' }> = {
  X: { label: 'Ndërruar', tone: 'bad' },
  W: { label: 'Riparuar (llamarinë/saldim)', tone: 'warn' },
  C: { label: 'Korrozion', tone: 'warn' },
  A: { label: 'Gërvishtje', tone: 'warn' },
  U: { label: 'Gropë', tone: 'warn' },
  T: { label: 'Dëmtim', tone: 'warn' },
};

export const SYSTEMS: Record<string, string> = {
  S00: 'Vetëdiagnostikimi',
  S01: 'Motori',
  S02: 'Transmisioni',
  S03: 'Transmetimi i fuqisë',
  S04: 'Drejtimi',
  S05: 'Frenat',
  S06: 'Sistemi elektrik',
  S07: 'Karburanti',
  S08: 'Sistemi i tensionit të lartë',
};

/** Statuses that mean the item passed: good, adequate, none (e.g. no leak). */
const PASS = new Set(['1', '2', '3']);

const FINDINGS: Record<string, string> = {
  '불량': 'defekt',
  '미세누유': 'rrjedhje e lehtë vaji',
  '누유': 'rrjedhje vaji',
  '미세누수': 'rrjedhje e lehtë lëngu',
  '누수': 'rrjedhje lëngu',
  '부족': 'nivel i ulët',
  '과다': 'nivel i tepërt',
  '오염': 'i ndotur',
};

export type Side = 'L' | 'R' | null;

/** "프론트 도어(좌)" -> { base: "프론트 도어", side: "L" }. 좌 is the driver's (left) side. */
export function splitPanel(title: string): { base: string; side: Side } {
  const m = title.match(/^(.*?)\s*\((좌|우)\)\s*$/);
  if (!m) return { base: title.trim(), side: null };
  return { base: m[1].trim(), side: m[2] === '좌' ? 'L' : 'R' };
}

export function panelSq(title: string): string {
  const { base, side } = splitPanel(title);
  const name = PANELS[base] ?? base;
  return side ? `${name} (${side === 'L' ? 'majtas' : 'djathtas'})` : name;
}

export type SystemResult = { code: string; name: string; findings: string[] };

/** One row per inspected system, listing only what did not pass. */
export function systemResults(insp: Inspection): SystemResult[] {
  return (insp.inners ?? []).map((g) => {
    const findings: string[] = [];
    const walk = (items: InspectionItem[] | undefined) => {
      for (const it of items ?? []) {
        const s = it.statusType;
        // The part names are too specialised to translate usefully; the
        // system plus the finding ("Motori: rrjedhje e lehtë vaji") is what a
        // buyer needs, and we explain the detail when they ask.
        if (s && !PASS.has(s.code)) findings.push(FINDINGS[s.title] ?? s.title);
        walk(it.children);
      }
    };
    walk(g.children);
    return {
      code: g.type.code,
      name: SYSTEMS[g.type.code] ?? g.type.title,
      findings: [...new Set(findings)],
    };
  });
}
