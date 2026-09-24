// Kosovo import customs, following the Instituti GAP calculator
// (veturat.institutigap.org/kalkulator.html). Duty and VAT are fixed rates;
// the excise bands date from that calculator and are an estimate only.

export type EngineBand = 'upTo2000' | 'upTo3000' | 'over3000';

export const ENGINE_BANDS: { value: EngineBand; label: string }[] = [
  { value: 'upTo2000', label: 'deri 2000 cm³' },
  { value: 'upTo3000', label: '2001–3000 cm³' },
  { value: 'over3000', label: 'mbi 3000 cm³' },
];

export const DUTY_RATE = 0.1;
export const VAT_RATE = 0.18;

// Excise by age: index 0 = current model year, 1–8 share one value, then 9..16, and 17+.
const EXCISE: Record<EngineBand, { brandNew: number; byAge: number[] }> = {
  upTo2000: { brandNew: 0,   byAge: [0,    400,  600,  700,  800,  900,  1000, 1100, 1200, 1300, 1500] },
  upTo3000: { brandNew: 300, byAge: [400,  400,  600,  800,  1000, 1200, 1400, 1600, 1800, 2000, 2200] },
  over3000: { brandNew: 800, byAge: [1000, 1000, 1500, 1800, 2100, 2400, 2700, 3000, 3300, 3600, 3900] },
};

export function exciseFor(band: EngineBand, age: number | 'new'): number {
  const row = EXCISE[band];
  if (age === 'new') return row.brandNew;
  if (!Number.isFinite(age) || age < 0) return 0;
  if (age === 0) return row.byAge[0];
  if (age <= 8) return row.byAge[1];
  return row.byAge[Math.min(age - 7, 10)];
}

export type CustomsBreakdown = {
  value: number;
  excise: number;
  duty: number;
  vat: number;
  customs: number;
  total: number;
};

/** `year` is the model year, or 'new' for a brand-new car. `value` is in EUR. */
export function calculateCustoms(
  value: number,
  year: number | 'new',
  band: EngineBand,
  currentYear = new Date().getFullYear(),
): CustomsBreakdown {
  const v = Math.max(0, value || 0);
  const excise = exciseFor(band, year === 'new' ? 'new' : currentYear - year);
  const duty = v * DUTY_RATE;
  const vat = (v + excise + duty) * VAT_RATE;
  const customs = excise + duty + vat;
  return {
    value: v,
    excise,
    duty: Math.round(duty),
    vat: Math.round(vat),
    customs: Math.round(customs),
    total: Math.round(v + customs),
  };
}
