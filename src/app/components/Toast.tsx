'use client';

import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';

export interface ToastItem {
  id: string;
  achievementName: string;
}

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

function SingleToast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slide in
    const showTimer = setTimeout(() => setVisible(true), 20);
    // Fade out before removal
    const fadeTimer = setTimeout(() => setVisible(false), 3600);
    // Remove
    const removeTimer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => { clearTimeout(showTimer); clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, [toast.id, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
        borderRadius: 12,
        background: 'var(--card-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(var(--fg-rgb),0.08)',
        borderLeft: '3px solid var(--accent)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.97)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        cursor: 'pointer',
        userSelect: 'none',
        minWidth: 240, maxWidth: 320,
      }}
      onClick={() => onDismiss(toast.id)}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: 'rgba(var(--accent-rgb),0.15)',
        border: '1px solid rgba(var(--accent-rgb),0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Trophy size={15} strokeWidth={1.8} color="var(--accent)" />
      </div>
      <div>
        <p style={{ fontSize: 11, color: 'var(--accent)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Achievement unlocked</p>
        <p style={{ fontSize: 13, color: 'var(--text)', margin: '2px 0 0', fontWeight: 500 }}>{toast.achievementName}</p>
      </div>
    </div>
  );
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      display: 'flex', flexDirection: 'column', gap: 10,
      zIndex: 9999,
    }}>
      {toasts.map(t => (
        <SingleToast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
