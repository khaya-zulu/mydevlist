"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { Polaroid } from "./polaroid";
import { getDevList, PAGE_SIZE, type Dev, type DevCursor } from "./queries";

export const DevListClient = ({
  initialDevs,
  initialCursor,
}: {
  initialDevs: Dev[];
  initialCursor: DevCursor | null;
}) => {
  const [devs, setDevs] = useState(initialDevs);
  const [cursor, setCursor] = useState(initialCursor);
  const [isPending, startTransition] = useTransition();

  const sentinelRef = useRef<HTMLDivElement>(null);

  // The observer is set up once, so it reads the live cursor from a ref. The
  // inFlight ref is a synchronous guard against the sentinel firing repeatedly
  // before isPending updates on the next render.
  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;
  const inFlight = useRef(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (inFlight.current || !cursorRef.current) return;

        inFlight.current = true;
        startTransition(async () => {
          try {
            const { devs: next, nextCursor } = await getDevList(
              cursorRef.current,
            );
            setDevs((prev) => [...prev, ...next]);
            setCursor(nextCursor);
          } finally {
            inFlight.current = false;
          }
        });
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex-1 h-full flex flex-col py-10">
      <div className="flex gap-4">
        <div className="flex-1 flex flex-col gap-4">
          {devs
            .filter((_, i) => i % 2 === 0)
            .map((dev, i) => (
              <Polaroid key={dev.slug} dev={dev} index={(i * 2) % PAGE_SIZE} />
            ))}
        </div>
        <div className="flex-1 flex flex-col gap-4">
          {devs
            .filter((_, i) => i % 2 === 1)
            .map((dev, i) => (
              <Polaroid
                key={dev.slug}
                dev={dev}
                index={(i * 2 + 1) % PAGE_SIZE}
              />
            ))}
        </div>
      </div>

      {cursor && (
        <div ref={sentinelRef} className="h-10 flex items-center justify-center">
          {isPending && (
            <span className="text-xs text-neutral-400">Loading…</span>
          )}
        </div>
      )}
    </div>
  );
};
