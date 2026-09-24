export const SITE = {
  name: 'Auto Kosova Import',
  short: 'AKI',
  tagline: 'Vetura gati të reja nga Koreja, të sjella në Kosovë.',
  city: 'Prishtinë',
  email: 'info@autokosovaimport.com',
  phone: '+383 44 000 000',
  address: 'Rr. Bill Clinton, 10000 Prishtinë, Kosovë',
  /** The actual shipping route, used in copy rather than invented jargon. */
  route: ['Seul', 'Durrës', 'Prishtinë'],
  hours: 'Hën–Pre 09:00–18:00, Sht 09:00–14:00',
} as const;

export const NAV = [
  { href: '/', label: 'Ballina' },
  { href: '/cars', label: 'Veturat' },
  { href: '/kalkulatori', label: 'Kalkulatori i Doganës' },
  { href: '/contact', label: 'Kontakti' },
] as const;
