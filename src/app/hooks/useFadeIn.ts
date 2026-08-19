'use client';

import { useState, useEffect } from 'react';

/**
 * Staggered entrance animation. Returns `fi(delay)` — spread it into any
 * element's style to have it fade up shortly after mount.
 *
 *   const fi = useFadeIn();
 *   <div style={{ ...fi(0)   }} />   // first
 *   <div style={{ ...fi(100) }} />   // 100ms later
 */
export function useFadeIn() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  return function fi(delay: number): React.CSSProperties {
    return {
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    };
  };
}
