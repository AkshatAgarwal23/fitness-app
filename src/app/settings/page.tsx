'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import SidePanel from '../components/SidePanel';
import { useIsMobile } from '../hooks/useIsMobile';
import { useFadeIn } from '../hooks/useFadeIn';
import { getCached, setCached } from '../lib/cache';

type Theme = 'forma' | 'light';

interface Settings {
  weeklyGoal: number;
  weightUnit: 'kg' | 'lbs';
  theme: Theme;
  name: string;
}

function applyTheme(theme: Theme) {
  if (theme === 'forma') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  try { localStorage.setItem('forma-theme', theme); } catch {}
}

function Section({ title, children, compact, style }: { title: string; children: React.ReactNode; compact?: boolean; style?: React.CSSProperties }) {
  return (
    <div style={{
      borderRadius: 14,
      background: 'var(--card-bg)',
      border: '1px solid var(--card-border)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      overflow: 'hidden',
      ...style,
    }}>
      <div style={{ padding: compact ? '12px 16px' : '16px 24px', borderBottom: '1px solid rgba(var(--fg-rgb),0.06)' }}>
        <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {title}
        </p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Row({ label, desc, children, compact }: { label: string; desc?: string; children: React.ReactNode; compact?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: compact ? 'flex-start' : 'center',
      flexDirection: compact ? 'column' : 'row',
      justifyContent: 'space-between',
      padding: compact ? '14px 16px' : '18px 24px',
      borderBottom: '1px solid rgba(var(--fg-rgb),0.04)',
      gap: compact ? 10 : 24,
    }}>
      <div>
        <p style={{ fontSize: 14, color: 'var(--text)', margin: 0, fontWeight: 450 }}>{label}</p>
        {desc && <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0' }}>{desc}</p>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function PillGroup<T extends string | number>({
  options, value, onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 500,
              background: active ? 'var(--accent)' : 'rgba(var(--fg-rgb),0.05)',
              color: active ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.18s ease',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const fi = useFadeIn();
  const [panelOpen, setPanelOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => {
    const cached = getCached<{ name: string; weeklyGoal: number; weightUnit: string; theme: string }>('profile');
    if (!cached) return { weeklyGoal: 3, weightUnit: 'kg', theme: 'forma', name: '' };
    let theme: Theme = (cached.theme as Theme) ?? 'forma';
    try {
      const local = localStorage.getItem('forma-theme');
      if (local === 'forma' || local === 'light') theme = local as Theme;
      if (local === 'dark') theme = 'forma';
    } catch {}
    return { weeklyGoal: cached.weeklyGoal ?? 3, weightUnit: (cached.weightUnit as 'kg' | 'lbs') ?? 'kg', theme, name: cached.name ?? '' };
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch('http://localhost:5000/api/profile', {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        try { localStorage.removeItem('forma-theme'); } catch {}
        router.push('/');
      } else {
        setDeleting(false);
        setConfirmingDelete(false);
      }
    } catch {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  useEffect(() => {
    fetch('http://localhost:5000/api/profile', { credentials: 'include' })
      .then(res => { if (res.status === 401) { router.replace('/login'); return null; } return res.json(); })
      .then(data => {
        if (data) {
          let theme: Theme = data.theme ?? 'forma';
          try {
            const local = localStorage.getItem('forma-theme');
            if (local === 'forma' || local === 'light') theme = local as Theme;
            if (local === 'dark') theme = 'forma';
          } catch {}
          setSettings({ weeklyGoal: data.weeklyGoal ?? 3, weightUnit: data.weightUnit ?? 'kg', theme, name: data.name ?? '' });
          setCached('profile', data);
        }
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  async function save(patch: Partial<Settings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    setSaving(true);
    try {
      await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ weeklyGoal: next.weeklyGoal, weightUnit: next.weightUnit, theme: next.theme }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userName={settings.name} onMenuOpen={() => setPanelOpen(true)} />
      <SidePanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} />

      <main style={{ flex: 1, padding: isMobile ? '24px 16px calc(84px + env(safe-area-inset-bottom, 0px))' : '40px 24px 80px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: isMobile ? 20 : 32 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...fi(0) }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 500, color: 'var(--text)', margin: '0 0 4px', letterSpacing: '-0.025em' }}>Settings</h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Preferences are saved automatically.</p>
            </div>
            {(saved || saving) && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, color: 'var(--accent)',
                padding: '6px 12px', borderRadius: 8,
                background: 'rgba(var(--accent-rgb),0.08)',
                border: '1px solid rgba(var(--accent-rgb),0.2)',
                transition: 'opacity 0.3s',
              }}>
                <Check size={13} strokeWidth={2.5} />
                Saved
              </div>
            )}
          </div>

          {/* Appearance */}
          <Section title="Appearance" compact={isMobile} style={fi(80)}>
            <Row
              label="Theme"
              desc="Forma is the signature dark green. Light is beige & white."
              compact={isMobile}
            >
              <PillGroup
                options={[
                  { label: 'Forma', value: 'forma' as const },
                  { label: 'Light', value: 'light' as const },
                ]}
                value={settings.theme}
                onChange={v => { applyTheme(v); save({ theme: v }); }}
              />
            </Row>
          </Section>

          {/* Preferences */}
          <Section title="Preferences" compact={isMobile} style={fi(160)}>
            <Row
              label="Weight unit"
              desc="Used in your weight tracker and profile."
              compact={isMobile}
            >
              <PillGroup
                options={[{ label: 'kg', value: 'kg' as const }, { label: 'lbs', value: 'lbs' as const }]}
                value={settings.weightUnit}
                onChange={v => save({ weightUnit: v })}
              />
            </Row>
            <Row
              label="Weekly session goal"
              desc="How many workouts you're aiming for each week."
              compact={isMobile}
            >
              <PillGroup
                options={[3, 4, 5, 6].map(n => ({ label: String(n), value: n }))}
                value={settings.weeklyGoal}
                onChange={v => save({ weeklyGoal: v })}
              />
            </Row>
          </Section>

          {/* Account */}
          <Section title="Account" compact={isMobile} style={fi(240)}>
            <Row label="Profile" desc="View your stats and BMI." compact={isMobile}>
              <button
                onClick={() => router.push('/profile')}
                style={{
                  padding: '7px 16px', borderRadius: 8,
                  background: 'rgba(var(--fg-rgb),0.05)',
                  border: '1px solid rgba(var(--fg-rgb),0.08)',
                  color: 'var(--text)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}
              >
                View
              </button>
            </Row>
            <Row label="Edit profile" desc="Update your name, height, weight, and more." compact={isMobile}>
              <button
                onClick={() => router.push('/profile-setup')}
                style={{
                  padding: '7px 16px', borderRadius: 8,
                  background: 'rgba(var(--fg-rgb),0.05)',
                  border: '1px solid rgba(var(--fg-rgb),0.08)',
                  color: 'var(--text)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}
              >
                Edit
              </button>
            </Row>
          </Section>

          {/* Danger zone */}
          <Section title="Danger zone" compact={isMobile} style={fi(320)}>
            <Row label="Log out" desc="You'll be returned to the home screen." compact={isMobile}>
              <button
                onClick={async () => {
                  await fetch('http://localhost:5000/api/auth/logout', { method: 'POST', credentials: 'include' });
                  router.push('/');
                }}
                style={{
                  padding: '7px 16px', borderRadius: 8,
                  background: 'rgba(226,75,74,0.08)',
                  border: '1px solid rgba(226,75,74,0.2)',
                  color: '#E24B4A', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}
              >
                Log out
              </button>
            </Row>
            <Row
              label="Delete account"
              compact={isMobile}
              desc={confirmingDelete
                ? 'This permanently erases your profile, workouts, and weight history.'
                : 'Permanently remove your account and all data.'}
            >
              {confirmingDelete ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    disabled={deleting}
                    style={{
                      padding: '7px 16px', borderRadius: 8,
                      background: 'rgba(var(--fg-rgb),0.05)',
                      border: '1px solid rgba(var(--fg-rgb),0.08)',
                      color: 'var(--text)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    style={{
                      padding: '7px 16px', borderRadius: 8,
                      background: '#E24B4A',
                      border: '1px solid #E24B4A',
                      color: '#fff', fontSize: 13, fontWeight: 500,
                      cursor: deleting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {deleting ? 'Deleting…' : 'Yes, delete forever'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  style={{
                    padding: '7px 16px', borderRadius: 8,
                    background: 'rgba(226,75,74,0.08)',
                    border: '1px solid rgba(226,75,74,0.2)',
                    color: '#E24B4A', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              )}
            </Row>
          </Section>

        </div>
      </main>
    </div>
  );
}
