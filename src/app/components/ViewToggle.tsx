'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

/**
 * Toggles the desktop "mobile preview" frame by adding/removing the
 * `mobile-preview` class on <html> and persisting the choice.
 *
 * `block` renders it as a full-width settings control instead of the compact
 * navbar pill.
 */
export default function ViewToggle({ block = false }: { block?: boolean }) {
  const [mobilePreview, setMobilePreview] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setMobilePreview(document.documentElement.classList.contains('mobile-preview'));
  }, []);

  function toggle() {
    const next = !mobilePreview;
    setMobilePreview(next);
    document.documentElement.classList.toggle('mobile-preview', next);
    try { localStorage.setItem('forma-mobile-preview', next ? '1' : '0'); } catch {}
  }

  const Icon = mobilePreview ? Monitor : Smartphone;
  const label = mobilePreview ? 'Desktop' : 'Mobile';

  return (
    <button
      onClick={toggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`Switch to ${label} view`}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: block ? '9px 16px' : '6px 12px',
        borderRadius: 8, border: 'none',
        width: block ? '100%' : 'auto',
        background: mobilePreview
          ? 'rgba(var(--accent-rgb), 0.12)'
          : hovered ? 'rgba(var(--fg-rgb), 0.07)' : 'rgba(var(--fg-rgb), 0.04)',
        color: mobilePreview ? 'var(--accent)' : 'var(--text-secondary)',
        fontSize: 13, fontWeight: 500, cursor: 'pointer',
        transition: 'all 0.18s ease',
        outline: mobilePreview ? '1px solid rgba(var(--accent-rgb), 0.25)' : '1px solid rgba(var(--fg-rgb), 0.08)',
      } as React.CSSProperties}
    >
      <Icon size={14} strokeWidth={1.8} />
      {label}
    </button>
  );
}
