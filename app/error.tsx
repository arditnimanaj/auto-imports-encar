'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Stoku nuk po ngarkohet</h1>
      <p className="mt-3 text-muted-foreground">
        Nuk arritëm ta marrim stokun tonë për momentin. Provoni përsëri pas pak —
        ose na telefononi dhe e kontrollojmë disponueshmërinë për ju.
      </p>
      <div className="mt-7 flex justify-center gap-3">
        <Button onClick={reset}>Provo përsëri</Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/contact" />}>
          Na kontaktoni
        </Button>
      </div>
    </div>
  );
}
