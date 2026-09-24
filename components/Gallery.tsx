'use client';

import CarPhoto from '@/components/CarPhoto';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export type Photo = { src: string; full: string; label: string };

/** Only this many photos load with the page; the rest wait for the viewer. */
const INITIAL = 5;

export default function Gallery({ photos, alt }: { photos: Photo[]; alt: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const stripRef = useRef<HTMLDivElement>(null);

  const move = useCallback(
    (d: number) =>
      setOpen((i) => (i == null ? i : (i + d + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (open == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, move]);

  const trackRef = useRef<HTMLDivElement>(null);
  /** The slide the track shows, as far as we know. */
  const shown = useRef<number | null>(null);
  /** Set while we scroll the track ourselves, so its scroll events are ignored. */
  const scrollingTo = useRef<number | null>(null);

  const onTrackScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (scrollingTo.current != null) {
      if (Math.abs(el.scrollLeft - scrollingTo.current * el.clientWidth) < 2) {
        scrollingTo.current = null;
      }
      return;
    }
    if (i !== shown.current && i >= 0 && i < photos.length) {
      shown.current = i;
      setOpen(i);
    }
  }, [photos.length]);

  // Arrows, keys and thumbnails move the track. A swipe has already moved it,
  // and set `shown` to match, so there is nothing to do.
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (open == null || !el) { shown.current = null; scrollingTo.current = null; return; }
    if (open === shown.current) return;
    const near = shown.current != null && Math.abs(open - shown.current) === 1;
    shown.current = open;
    const left = open * el.clientWidth;
    if (Math.abs(el.scrollLeft - left) < 2) return;
    scrollingTo.current = open;
    el.scrollTo({ left, behavior: near && !reduced ? 'smooth' : 'auto' });
  }, [open, reduced]);

  // Keep the active thumbnail visible as you arrow through the set.
  useEffect(() => {
    if (open == null) return;
    stripRef.current
      ?.querySelector<HTMLElement>(`[data-index="${open}"]`)
      ?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  }, [open, reduced]);

  if (!photos.length) {
    return (
      <p className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        Ende nuk ka foto për këtë veturë.
      </p>
    );
  }

  const [lead, ...rest] = photos;
  const thumbs = rest.slice(0, INITIAL - 1);
  const hidden = rest.length - thumbs.length;

  return (
    <>
      <button
        onClick={() => setOpen(0)}
        className="relative block aspect-16/9 w-full overflow-hidden rounded-lg bg-mist"
        aria-label={`Hap foton 1 nga ${photos.length}`}
      >
        <CarPhoto
          src={lead.full}
          alt={alt}
          priority
          className="absolute inset-0 h-full w-full object-cover"
        />
      </button>

      {/* Four thumbnails plus a box for the remainder. Only these five images
          are requested up front, however many the listing has. */}
      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {thumbs.map((p, i) => (
          <button
            key={p.src}
            onClick={() => setOpen(i + 1)}
            className="relative aspect-4/3 overflow-hidden rounded-lg bg-mist"
            aria-label={`Hap foton ${i + 2} nga ${photos.length}`}
          >
            <CarPhoto
              src={p.src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </button>
        ))}

        {hidden > 0 && (
          <button
            onClick={() => setOpen(INITIAL)}
            className="grid aspect-4/3 place-items-center rounded-lg border border-border bg-mist/60 transition-colors hover:bg-mist"
            aria-label={`Shiko ${hidden} fotot e tjera`}
          >
            <span className="text-center">
              <span className="numeric block font-display text-xl font-bold">+{hidden}</span>
              <span className="text-xs text-muted-foreground">më shumë</span>
            </span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {open != null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Fotoja ${open + 1} nga ${photos.length}`}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-50 flex flex-col bg-ink"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-center justify-between px-4 py-3 text-mist">
              <p className="numeric text-sm">{open + 1} nga {photos.length}</p>
              <button
                onClick={() => setOpen(null)}
                aria-label="Mbyll fotot"
                className="grid h-10 w-10 place-items-center rounded-full bg-paper/10 transition-colors hover:bg-paper/20 hover:text-paper"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center">
              <Arrow side="left" onClick={(e) => { e.stopPropagation(); move(-1); }} />
              {/* A native scroll-snap track, so a phone swipes photo to photo
                  with its own momentum. Only the current photo and its two
                  neighbours are mounted; the rest are empty slides. */}
              <div
                ref={trackRef}
                onScroll={onTrackScroll}
                // A finger on the track takes over from any scroll we started.
                onTouchStart={() => { scrollingTo.current = null; }}
                onClick={(e) => e.stopPropagation()}
                className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
              >
                {photos.map((p, i) => (
                  <div
                    key={p.src}
                    className="relative h-full w-full shrink-0 snap-center snap-always px-2 md:px-16"
                  >
                    {Math.abs(i - open) <= 1 && (
                      <div className="relative mx-auto h-full max-w-5xl">
                        <CarPhoto
                          src={p.full}
                          alt={`${alt} — fotoja ${i + 1}`}
                          priority={i === open}
                          className="absolute inset-0 h-full w-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Arrow side="right" onClick={(e) => { e.stopPropagation(); move(1); }} />
            </div>

            {/* Every photo, as a scrollable strip. */}
            <div
              ref={stripRef}
              onClick={(e) => e.stopPropagation()}
              className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto px-4 py-4"
            >
              {photos.map((p, i) => (
                <button
                  key={p.src}
                  data-index={i}
                  onClick={() => setOpen(i)}
                  aria-label={`Fotoja ${i + 1}`}
                  aria-current={i === open}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded transition-all ${
                    i === open
                      ? 'opacity-100 ring-2 ring-brass'
                      : 'opacity-50 hover:opacity-90'
                  }`}
                >
                  <CarPhoto src={p.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Arrow({
  side, onClick,
}: { side: 'left' | 'right'; onClick: (e: React.MouseEvent) => void }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      aria-label={side === 'left' ? 'Fotoja e mëparshme' : 'Fotoja tjetër'}
      className={`absolute z-10 hidden h-11 w-11 md:grid place-items-center rounded-full bg-paper/10 text-mist transition-colors hover:bg-paper/20 hover:text-paper ${
        side === 'left' ? 'left-1 md:left-4' : 'right-1 md:right-4'
      }`}
    >
      <Icon className="h-6 w-6" />
    </button>
  );
}
