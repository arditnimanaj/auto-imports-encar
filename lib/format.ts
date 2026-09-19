export const eur = (n: number | null) =>
  n == null ? '—' : new Intl.NumberFormat('de-DE',
    { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

export const krw = (n: number | null) =>
  n == null ? '—' : new Intl.NumberFormat('ko-KR',
    { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(n);

export const km = (n: number | null) =>
  n == null ? '—' : `${new Intl.NumberFormat('en-US').format(n)} km`;

export const ym = (year: number, month: number) =>
  `${year}/${String(month).padStart(2, '0')}`;
