'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recordQuery } from '@/lib/query';

/**
 * Insurance-history badges on a card's photo. The record is only fetched once
 * the card is near the viewport, so a page of 24 cards does not fire 24
 * requests up front; the car page then reuses the cached record. Badges sit
 * over the photo, so their arrival never shifts the grid.
 */
export default function CardTrust({ id }: { id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  const { data: r } = useQuery({ ...recordQuery(id), enabled: seen });

  const badges: { label: string; bad?: boolean }[] = [];
  if (r) {
    if (r.totalLossCnt > 0) badges.push({ label: 'Humbje totale', bad: true });
    if (r.floodTotalLossCnt + (r.floodPartLossCnt ?? 0) > 0) badges.push({ label: 'Përmbytje', bad: true });
    badges.push(
      r.myAccidentCnt
        ? { label: `${r.myAccidentCnt} ${r.myAccidentCnt === 1 ? 'dëm' : 'dëme'}`, bad: true }
        : { label: 'Pa dëme' },
    );
    // Dealer transfers count as owner changes, so only the clean case is worth saying.
    if (r.ownerChangeCnt === 0) badges.push({ label: '1 pronar' });
  }

  return (
    <div ref={ref} className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
      {badges.map((b) => (
        <span
          key={b.label}
          className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold shadow-sm ${
            b.bad ? 'bg-paper/95 text-alert' : 'bg-ok text-paper'
          }`}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}
