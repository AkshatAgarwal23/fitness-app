'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Avatar from '../components/Avatar';
import Navbar from '../components/Navbar';
import SidePanel from '../components/SidePanel';
import { useIsMobile } from '../hooks/useIsMobile';

interface UserProfile {
  name: string;
  email: string;
  age?: number;
  contact?: string;
  height?: number;
  heightUnit?: string;
  weight?: number;
  bmi?: number;
}

interface WeightEntry {
  _id: string;
  date: string;
  weight: number;
}

function BmiRing({ bmi }: { bmi: number }) {
  const [filled, setFilled] = useState(false);
  const r = 38;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(bmi / 40, 1);
  const finalOffset = circ * (1 - pct);

  useEffect(() => {
    const t = setTimeout(() => setFilled(true), 80);
    return () => clearTimeout(t);
  }, []);

  const color =
    bmi < 18.5 ? '#5B9EF5' :
    bmi < 25   ? 'var(--accent)' :
    bmi < 30   ? '#F5A623' :
                 '#E24B4A';
  const label =
    bmi < 18.5 ? 'Underweight' :
    bmi < 25   ? 'Normal'      :
    bmi < 30   ? 'Overweight'  :
                 'Obese';

  return (
    <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={r} fill="none" stroke="rgba(var(--fg-rgb),0.06)" strokeWidth={6} />
        <circle
          cx={50} cy={50} r={r} fill="none"
          stroke={color} strokeWidth={6}
          strokeDasharray={circ}
          strokeDashoffset={filled ? finalOffset : circ}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)',
            filter: `drop-shadow(0 0 6px ${color}80)`,
          }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.03em' }}>
          {bmi.toFixed(1)}
        </span>
        <span style={{ fontSize: 9, color, marginTop: 3, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
          {label}
        </span>
      </div>
    </div>
  );
}

function WeightChart({ logs }: { logs: WeightEntry[] }) {
  if (logs.length < 2) return null;
  const W = 400, H = 72;
  const pad = { l: 4, r: 4, t: 8, b: 4 };
  const weights = logs.map(l => l.weight);
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;
  const range = maxW - minW || 1;
  const n = logs.length;

  const x = (i: number) => pad.l + (i / (n - 1)) * (W - pad.l - pad.r);
  const y = (w: number) => H - pad.b - ((w - minW) / range) * (H - pad.t - pad.b);

  const pts = logs.map((l, i) => `${x(i)},${y(l.weight)}`).join(' ');
  const area = `${x(0)},${H} ${pts} ${x(n - 1)},${H}`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(var(--accent-rgb),0.25)" />
          <stop offset="100%" stopColor="rgba(var(--accent-rgb),0)" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#wg)" />
      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round" />
      {logs.map((l, i) => (
        <circle key={i}
          cx={x(i)} cy={y(l.weight)} r={i === n - 1 ? 3.5 : 2}
          fill={i === n - 1 ? 'var(--accent)' : 'rgba(var(--accent-rgb),0.45)'}
        />
      ))}
    </svg>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number | undefined }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid var(--surface-2)' }}>
      <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--text)' }}>{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [panelOpen, setPanelOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [weightLogs, setWeightLogs] = useState<WeightEntry[]>([]);
  const [newWeight, setNewWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/profile', { credentials: 'include' })
      .then(res => { if (res.status === 401) { router.replace('/login'); return null; } return res.json(); })
      .then(data => { if (data) setUser(data); })
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));

    fetch('http://localhost:5000/api/weight', { credentials: 'include' })
      .then(res => res.ok ? res.json() : [])
      .then(data => setWeightLogs(data ?? []))
      .catch(() => {});
  }, [router]);

  async function handleLogWeight(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(newWeight);
    if (!val || val < 20 || val > 400) return;
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ weight: val }),
      });
      if (res.ok) {
        const entry = await res.json();
        setWeightLogs(prev => {
          const filtered = prev.filter(l => l._id !== entry._id);
          return [...filtered, entry].slice(-30);
        });
        setNewWeight('');
      }
    } finally { setSaving(false); }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading…</p>
      </main>
    );
  }

  if (!user) return null;

  const heightDisplay = user.height ? `${user.height} ${user.heightUnit ?? 'cm'}` : undefined;
  const latestWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : null;
  const prevWeight = weightLogs.length > 1 ? weightLogs[weightLogs.length - 2].weight : null;
  const weightDelta = latestWeight !== null && prevWeight !== null ? latestWeight - prevWeight : null;

  return (
    <div className="min-h-screen flex flex-col">
    <Navbar userName={user.name} onMenuOpen={() => setPanelOpen(true)} />
      <SidePanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} />
    <main className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 400, pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(var(--accent-rgb),0.15) 0%, transparent 70%)',
      }} />

      <div style={{
        position: 'relative', width: '100%', maxWidth: 520,
        borderRadius: 16, overflow: 'hidden',
        background: 'rgba(var(--surface-rgb),0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(var(--fg-rgb),0.07)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(var(--fg-rgb),0.05)',
      }}>

        {/* Profile header */}
        <div style={{ padding: isMobile ? '24px 20px 20px' : '32px 32px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: isMobile ? 16 : 24 }}>
          <Avatar name={user.name} size={64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{user.name}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{user.email}</p>
          </div>
          {user.bmi ? <BmiRing bmi={user.bmi} /> : null}
        </div>

        {/* Info rows */}
        <div style={{ padding: isMobile ? '0 20px' : '0 32px' }}>
          <InfoRow label="Age" value={user.age} />
          <InfoRow label="Height" value={heightDisplay} />
          <InfoRow label="Weight" value={user.weight ? `${user.weight} kg` : undefined} />
          <InfoRow label="Contact" value={user.contact} />
        </div>

        {/* Weight logger */}
        <div style={{ padding: isMobile ? '16px 20px' : '20px 32px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Weight tracker</p>
              {latestWeight !== null && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.03em' }}>{latestWeight} kg</span>
                  {weightDelta !== null && (
                    <span style={{ fontSize: 12, color: weightDelta < 0 ? 'var(--accent)' : weightDelta > 0 ? '#E24B4A' : 'var(--text-muted)' }}>
                      {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Log weight form */}
            <form onSubmit={handleLogWeight} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                ref={inputRef}
                type="number"
                placeholder="kg"
                value={newWeight}
                onChange={e => setNewWeight(e.target.value)}
                min={20} max={400} step={0.1}
                style={{
                  width: 72, padding: '7px 10px', borderRadius: 8,
                  background: 'rgba(var(--fg-rgb),0.04)',
                  border: '1px solid rgba(var(--fg-rgb),0.1)',
                  color: 'var(--text)', fontSize: 13,
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={saving || !newWeight}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 14px', borderRadius: 8,
                  background: saving ? 'rgba(var(--accent-rgb),0.1)' : 'var(--accent)',
                  border: 'none', color: '#fff',
                  fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: !newWeight ? 0.5 : 1,
                }}
              >
                <Plus size={14} strokeWidth={2} />
                Log
              </button>
            </form>
          </div>

          {/* Chart */}
          {weightLogs.length >= 2 && (
            <div style={{
              borderRadius: 10, padding: '12px 8px 8px',
              background: 'rgba(var(--fg-rgb),0.02)',
              border: '1px solid rgba(var(--fg-rgb),0.05)',
              marginBottom: 2,
            }}>
              <WeightChart logs={weightLogs} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, padding: '0 4px' }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(weightLogs[0].date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(weightLogs[weightLogs.length - 1].date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          )}
          {weightLogs.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Log your weight daily to track your progress.</p>
          )}
          {weightLogs.length === 1 && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Log again tomorrow to start seeing your chart.</p>
          )}
        </div>

        {/* Edit button */}
        <div style={{ padding: isMobile ? '0 20px 24px' : '0 32px 28px', borderTop: '1px solid var(--border)' }}>
          <div style={{ paddingTop: 20 }}>
            <Link
              href="/profile-setup"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '11px 24px', borderRadius: 10,
                background: 'var(--surface-2)', color: 'var(--text)',
                border: '1px solid var(--border)',
                fontSize: 14, fontWeight: 500,
                textDecoration: 'none', width: '100%',
              }}
            >
              Edit profile
            </Link>
          </div>
        </div>
      </div>
    </main>
    </div>
  );
}
