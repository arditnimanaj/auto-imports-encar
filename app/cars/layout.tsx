import { Suspense } from 'react';
import Sidebar from '@/components/Sidebar';
import { getMakes } from '@/lib/encar';

export default async function CarsLayout({ children }: { children: React.ReactNode }) {
  const makes = await getMakes().catch(() => []);

  return (
    <div className="lg:grid lg:grid-cols-[15rem_1fr]">
      <Suspense fallback={<div className="hidden border-r border-border bg-mist/40 lg:block" />}>
        <Sidebar makes={makes} />
      </Suspense>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
