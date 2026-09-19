'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Stock isn&apos;t loading</h1>
      <p className="mt-3 text-muted-foreground">
        We couldn&apos;t reach our stock feed just now. Try again in a moment —
        or call us and we&apos;ll check availability for you.
      </p>
      <div className="mt-7 flex justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/contact" />}>
          Contact us
        </Button>
      </div>
    </div>
  );
}
