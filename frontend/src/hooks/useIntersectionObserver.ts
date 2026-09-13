'use client';

import { useEffect, useRef } from 'react';

export function useIntersectionObserver(callback: () => void, enabled = true) {
  const ref = useRef<HTMLDivElement | null>(null);
  // Store callback in a ref so that changing the inline function reference
  // does NOT recreate the observer on every parent render.
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) callbackRef.current();
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  // Only re-run when `enabled` flips — NOT when the callback reference changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return ref;
}
