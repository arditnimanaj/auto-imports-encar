'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NAV, SITE } from '@/lib/site';

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-steel bg-ink">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:px-8">
        <Link href="/" prefetch={false} className="shrink-0">
          <span className="font-display text-lg font-extrabold tracking-tight text-paper">
            Auto Kosova
          </span>
          <span className="ml-1.5 font-display text-lg font-medium text-brass">Import</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
                  active ? 'text-paper' : 'text-mist/70 hover:text-paper'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="numeric text-sm text-mist">
            {SITE.phone}
          </a>
          <Button size="sm" nativeButton={false} render={<Link href="/contact" />}>Merr ofertë</Button>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="text-mist md:hidden"
          aria-label={open ? 'Mbyll menynë' : 'Hap menynë'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-steel px-5 py-3 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm font-medium text-mist"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={`tel:${SITE.phone.replace(/\s/g, '')}`}
            className="numeric block py-2.5 text-sm text-brass"
          >
            {SITE.phone}
          </a>
        </nav>
      )}
    </header>
  );
}
