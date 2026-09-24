// Live KRW -> EUR rate. Free, no API key.
const ENDPOINT = 'https://open.er-api.com/v6/latest/KRW';

/** Used only if the FX API is unreachable, so prices still render. */
const FALLBACK = 0.00064;

export type Rate = { krwToEur: number; updated: string | null; live: boolean };

/** Cached for six hours -- the source updates daily and this is a display conversion. */
export async function getRate(): Promise<Rate> {
  try {
    const res = await fetch(ENDPOINT, { next: { revalidate: 6 * 3600 } });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as {
      result?: string;
      rates?: Record<string, number>;
      time_last_update_utc?: string;
    };
    const eur = data.rates?.EUR;
    if (data.result !== 'success' || typeof eur !== 'number' || eur <= 0) {
      throw new Error('bad payload');
    }
    return { krwToEur: eur, updated: data.time_last_update_utc ?? null, live: true };
  } catch {
    return { krwToEur: FALLBACK, updated: null, live: false };
  }
}
