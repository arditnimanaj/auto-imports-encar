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
  /** Door to door, Seoul to Prishtina. Quoted on the contact page and homepage. */
  deliveryWeeks: '6–8',
} as const;

const digits = SITE.phone.replace(/[^\d]/g, '');

/** Tap-to-message links. Most buyers here message a dealer before calling. */
export const MESSAGING = {
  tel: `tel:+${digits}`,
  whatsapp: (text?: string) =>
    `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`,
  viber: `viber://chat?number=%2B${digits}`,
};

/** How an import works, in the order it happens. Shared by homepage and contact. */
export const STEPS = [
  {
    title: 'Ju zgjidhni një veturë.',
    body: 'Nga stoku ynë, ose na tregoni specifikat dhe i kërkojmë në ankandet koreane.',
  },
  {
    title: 'Ju ofertojmë çmimin e dorëzuar.',
    body: 'Vetura, transporti detar, dogana, TVSH-ja dhe regjistrimi — një shifër e vetme.',
  },
  {
    title: 'Transporti.',
    body: `${SITE.route.join(' → ')}, afërsisht ${SITE.deliveryWeeks} javë derë më derë.`,
  },
  {
    title: 'Ju i merrni çelësat.',
    body: 'E regjistruar dhe e gatshme për rrugë në Kosovë.',
  },
] as const;

export const NAV = [
  { href: '/', label: 'Ballina' },
  { href: '/cars', label: 'Veturat' },
  { href: '/kalkulatori', label: 'Kalkulatori i Doganës' },
  { href: '/contact', label: 'Kontakti' },
] as const;
