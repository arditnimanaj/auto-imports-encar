export const SITE = {
  name: 'Auto Kosova Import',
  short: 'AKI',
  tagline: 'Near-new cars from Korea, landed in Kosovo.',
  city: 'Prishtinë',
  email: 'info@autokosovaimport.com',
  phone: '+383 44 000 000',
  address: 'Rr. Bill Clinton, 10000 Prishtinë, Kosovë',
  /** The actual shipping route, used in copy rather than invented jargon. */
  route: ['Seoul', 'Durrës', 'Prishtinë'],
  hours: 'Mon–Fri 09:00–18:00, Sat 09:00–14:00',
} as const;

export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/cars', label: 'Cars' },
  { href: '/contact', label: 'Contact' },
] as const;
