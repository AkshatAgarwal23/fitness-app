'use client';
import { useCallback, useSyncExternalStore } from 'react';

function computeMobile(breakpoint: number): boolean {
  if (typeof window === 'undefined') return false;
  // Desktop "mobile preview" mode should make the whole app behave as mobile,
  // even though the real viewport is still wide.
  if (document.documentElement.classList.contains('mobile-preview')) return true;
  return window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches;
}

/**
 * SSR-safe responsive check.
 *
 * useSyncExternalStore renders the server snapshot (false) on the first pass so
 * hydration matches the server HTML, then swaps to the real value right after —
 * without the hydration mismatch a lazy useState initializer would cause when
 * the client already knows it's mobile (real device or desktop preview mode).
 */
export function useIsMobile(breakpoint = 640) {
  const subscribe = useCallback((onChange: () => void) => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    mq.addEventListener('change', onChange);
    // Re-evaluate whenever the mobile-preview class is toggled on <html>.
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      mq.removeEventListener('change', onChange);
      observer.disconnect();
    };
  }, [breakpoint]);

  return useSyncExternalStore(
    subscribe,
    () => computeMobile(breakpoint), // client snapshot
    () => false,                     // server snapshot
  );
}

/**
 * Real device viewport check — ignores the desktop "mobile preview" mode.
 * Use this for controls that must stay reachable on a real desktop even while
 * the app is being previewed as mobile (e.g. the view-toggle button).
 */
export function useIsRealDesktop(breakpoint = 640) {
  const subscribe = useCallback((onChange: () => void) => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [breakpoint]);

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(`(min-width: ${breakpoint}px)`).matches, // client snapshot
    () => false,                                                     // server snapshot
  );
}
