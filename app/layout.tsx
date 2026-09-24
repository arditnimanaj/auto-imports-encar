import type { Metadata } from 'next';
import { Bricolage_Grotesque, Manrope } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import { SITE } from '@/lib/site';
import './globals.css';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display-face',
});
const body = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body-face',
});

export const metadata: Metadata = {
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description:
    'Import cars from Korea to Kosovo — 2016 models and newer. Live stock, euro prices, shipping and customs handled door to door.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen">
        <Header />
        <main>{children}</main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
