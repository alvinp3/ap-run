'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Uses @chenglou/pretext to count how many lines a string occupies at a given
 * container width. Returns the line count (or null while pending).
 *
 * Browser-only — pretext uses canvas.measureText internally.
 */
export function useTextLines(
  text: string,
  font: string,
  lineHeight: number
): { lineCount: number | null; containerRef: React.RefObject<HTMLDivElement | null> } {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [lineCount, setLineCount] = useState<number | null>(null);

  useEffect(() => {
    if (!text || !containerRef.current) return;
    let cancelled = false;

    // Defer to next frame so the container is laid out
    const raf = requestAnimationFrame(async () => {
      if (cancelled || !containerRef.current) return;
      const width = containerRef.current.getBoundingClientRect().width;
      if (width === 0) return;

      try {
        const { prepare, layout } = await import('@chenglou/pretext');
        const prepared = prepare(text, font);
        const result = layout(prepared, width, lineHeight);
        if (!cancelled) setLineCount(result.lineCount);
      } catch {
        // pretext is browser-only; silently skip in SSR
      }
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [text, font, lineHeight]);

  return { lineCount, containerRef };
}
