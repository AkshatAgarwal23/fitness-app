'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Avatar from '../components/Avatar';
import Navbar from '../components/Navbar';
import SidePanel from '../components/SidePanel';
import { useIsMobile } from '../hooks/useIsMobile';
import { useFadeIn } from '../hooks/useFadeIn';
import { getCached, setCached } from '../lib/cache';

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

  // Each tier carries an rgb triple too, so the glow can be built with a real
  // rgba() — interpolating `var(--accent)` into a hex alpha never renders.
  const tier =
    bmi < 18.5 ? { color: '#5B9EF5',       rgb: '91,158,245',      label: 'Underweight' } :
    bmi < 25   ? { color: 'var(--accent)', rgb: 'var(--accent-rgb)', label: 'Normal'    } :
    bmi < 30   ? { color: '#F5A623',       rgb: '245,166,35',      label: 'Overweight'  } :
                 { color: '#E24B4A',       rgb: '226,75,74',       label: 'Obese'       };
  const { color, label } = tier;

  // The heavier the reading, the brighter the ring burns. The blur is capped so
  // the light always fades to nothing before it reaches the card's clipped edge.
  const intensity = Math.min(Math.max((bmi - 15) / 25, 0), 1); // BMI 15 → 0, 40 → 1
  const glowBlur = 3 + intensity * 13;     // 3px → 16px
  const glowAlpha = 0.3 + intensity * 0.6; // 0.3 → 0.9

  return (
    <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
      {/* Canvas is oversized (and offset back) so the glow has room to fall off
          naturally — at exactly 100x100 the blur gets clipped into a square. */}
      <svg
        width={180}
        height={180}
        viewBox="-40 -40 180 180"
        style={{ position: 'absolute', top: -40, left: -40, overflow: 'visible', pointerEvents: 'none' }}
      >
        <circle cx={50} cy={50} r={r} fill="none" stroke="rgba(var(--fg-rgb),0.06)" strokeWidth={6} />
        <circle
          cx={50} cy={50} r={r} fill="none"
          stroke={color} strokeWidth={6}
          strokeDasharray={circ}
          strokeDashoffset={filled ? finalOffset : circ}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1), filter 1.4s ease',
            // Two stacked shadows: a tight bright core plus a wide soft bloom,
            // so the light falls off gradually instead of ending on an edge.
            filter: filled
              ? `drop-shadow(0 0 ${glowBlur * 0.5}px rgba(${tier.rgb},${glowAlpha})) drop-shadow(0 0 ${glowBlur}px rgba(${tier.rgb},${glowAlpha * 0.5}))`
              : `drop-shadow(0 0 0px rgba(${tier.rgb},0)) drop-shadow(0 0 0px rgba(${tier.rgb},0))`,
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

function InfoRow({ label, value, index = 0 }: { label: string; value: string | number | undefined; index?: number }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '13px 0', borderBottom: '1px solid var(--surface-2)',
      animation: 'slideInLeft 0.45s cubic-bezier(0.16,1,0.3,1) both',
      animationDelay: `${160 + index * 70}ms`,
    }}>
      <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--text)' }}>{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const fi = useFadeIn();
  const [panelOpen, setPanelOpen] = useState(false);
  const [user, setUser] = useState<UserProfile>(() => getCached<UserProfile>('profile') ?? { name: '', email: '' });
  const [weightLogs, setWeightLogs] = useState<WeightEntry[]>(() => getCached<WeightEntry[]>('weight') ?? []);
  const [newWeight, setNewWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/profile', { credentials: 'include' })
      .then(res => { if (res.status === 401) { router.replace('/login'); return null; } return res.json(); })
      .then(data => { if (data) { setUser(data); setCached('profile', data); } })
      .catch(() => router.replace('/login'));

    fetch('http://localhost:5000/api/weight', { credentials: 'include' })
      .then(res => res.ok ? res.json() : [])
      .then(data => { setWeightLogs(data ?? []); setCached('weight', data ?? []); })
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
          const next = [...filtered, entry].slice(-30);
          setCached('weight', next);
          return next;
        });
        setNewWeight('');
      }
    } finally { setSaving(false); }
  }

  const heightDisplay = user.height ? `${user.height} ${user.heightUnit ?? 'cm'}` : undefined;
  const latestWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : null;
  const prevWeight = weightLogs.length > 1 ? weightLogs[weightLogs.length - 2].weight : null;
  const weightDelta = latestWeight !== null && prevWeight !== null ? latestWeight - prevWeight : null;

  return (
    <div className="min-h-screen flex flex-col">
    <Navbar userName={user.name} onMenuOpen={() => setPanelOpen(true)} />
      <SidePanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} />
    <main className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden" style={isMobile ? { paddingBottom: 'calc(84px + env(safe-area-inset-bottom, 0px))' } : {}}>
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
        ...fi(0),
      }}>

        {/* Profile header */}
        <div style={{ padding: isMobile ? '24px 20px 20px' : '32px 32px 28px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 16 : 24 }}>
            <Avatar name={user.name} size={64} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</h2>
              {/* On desktop the email fits beside the ring; on mobile it moves
                  to its own full-width line below so it shows in full. */}
              {!isMobile && (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0', overflowWrap: 'anywhere' }}>{user.email}</p>
              )}
            </div>
            {user.bmi ? <BmiRing bmi={user.bmi} /> : null}
          </div>
          {isMobile && user.email && (
            <p style={{
              fontSize: 12, color: 'var(--text-muted)', margin: 0,
              overflowWrap: 'anywhere', lineHeight: 1.45,
            }}>
              {user.email}
            </p>
          )}
        </div>

        {/* Info rows */}
        <div style={{ padding: isMobile ? '0 20px' : '0 32px' }}>
          <InfoRow label="Age" value={user.age} index={0} />
          <InfoRow label="Height" value={heightDisplay} index={1} />
          <InfoRow label="Weight" value={user.weight ? `${user.weight} kg` : undefined} index={2} />
          <InfoRow label="Contact" value={user.contact} index={3} />
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
