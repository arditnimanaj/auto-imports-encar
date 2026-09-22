import type { Metadata } from 'next';
import { Bricolage_Grotesque, Manrope } from 'next/font/google';
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
    'Importoni vetura nga Koreja në Kosovë — modele 2016 e tutje. Stok i drejtpërdrejtë, çmime në euro, transporti dhe dogana derë më derë.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen">
        <Header />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
