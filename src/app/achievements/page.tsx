'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Star, Flame, Zap, Shield, Dumbbell, TrendingUp, Lock, Sun, Moon, Calendar, RotateCcw, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import SidePanel from '../components/SidePanel';
import { useIsMobile } from '../hooks/useIsMobile';
import { useFadeIn } from '../hooks/useFadeIn';
import { getCached, setCached } from '../lib/cache';

interface AchievementData {
  id: string;
  name: string;
  desc: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

const ICON_MAP: Record<string, typeof Star> = {
  first:          Star,
  streak3:        Flame,
  streak5:        Flame,
  streak7:        Shield,
  streak14:       Shield,
  streak30:       Zap,
  sessions5:      Dumbbell,
  sessions10:     Dumbbell,
  sessions25:     TrendingUp,
  sessions50:     Trophy,
  sessions75:     Award,
  sessions100:    Award,
  earlybird:      Sun,
  nightowl:       Moon,
  weekendwarrior: Calendar,
  comeback:       RotateCcw,
};

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const card: React.CSSProperties = {
  borderRadius: 16,
  background: 'var(--card-bg)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid var(--card-border)',
  boxShadow: 'inset 0 1px 0 rgba(var(--fg-rgb),0.05)',
};

function AchievementCard({ a, index }: { a: AchievementData; index: number }) {
  const [hovered, setHovered] = useState(false);
  const Icon = ICON_MAP[a.id] ?? Star;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...card,
        padding: '18px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
        opacity: a.unlocked ? 1 : 0.45,
        animation: 'fadeSlideIn 0.5s ease both',
        animationDelay: `${Math.min(index * 40, 500)}ms`,
        background: a.unlocked
          ? 'linear-gradient(135deg, rgba(var(--accent-rgb),0.06) 0%, var(--card-bg) 60%)'
          : 'var(--card-bg)',
        border: a.unlocked
          ? `1px solid rgba(var(--accent-rgb),${hovered ? 0.35 : 0.18})`
          : '1px solid var(--card-border)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered && a.unlocked
          ? '0 8px 24px rgba(0,0,0,0.2), 0 0 20px rgba(var(--accent-rgb),0.12)'
          : 'inset 0 1px 0 rgba(var(--fg-rgb),0.05)',
        transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease, border-color 0.25s ease, opacity 0.2s ease',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: a.unlocked ? 'rgba(var(--accent-rgb),0.15)' : 'rgba(var(--fg-rgb),0.04)',
        border: `1px solid ${a.unlocked ? 'rgba(var(--accent-rgb),0.25)' : 'rgba(var(--fg-rgb),0.07)'}`,
        position: 'relative',
        transform: hovered && a.unlocked ? 'scale(1.08) rotate(-6deg)' : 'scale(1) rotate(0deg)',
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {a.unlocked ? (
          <Icon size={20} strokeWidth={1.6} color="var(--accent)" />
        ) : (
          <Lock size={16} strokeWidth={1.6} color="var(--text-muted)" />
        )}
        {a.unlocked && (
          <div style={{
            position: 'absolute', top: -3, right: -3,
            width: 10, height: 10, borderRadius: '50%',
            background: 'var(--accent)',
            boxShadow: '0 0 8px rgba(var(--accent-rgb),0.8)',
            border: '2px solid var(--bg)',
            animation: hovered ? 'softPulse 1.2s ease-in-out infinite' : 'none',
          }} />
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: a.unlocked ? 'var(--text)' : 'var(--text-secondary)', margin: 0 }}>{a.name}</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0', lineHeight: 1.4 }}>{a.desc}</p>
        {a.unlocked && a.unlockedAt && (
          <p style={{ fontSize: 11, color: 'var(--accent)', margin: '6px 0 0', fontWeight: 500 }}>
            Unlocked {formatDate(a.unlockedAt)}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [panelOpen, setPanelOpen] = useState(false);
  const [achievements, setAchievements] = useState<AchievementData[]>(() => getCached<AchievementData[]>('achievements') ?? []);
  const fi = useFadeIn();

  useEffect(() => {
    fetch('http://localhost:5000/api/achievements', { credentials: 'include' })
      .then(res => {
        if (res.status === 401) { router.replace('/login'); return null; }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<AchievementData[]>;
      })
      .then(data => { if (data) { setAchievements(data); setCached('achievements', data); } })
      .catch(err => console.error('Achievements fetch error:', err));
  }, [router]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const total = achievements.length;

  return (
    <div className="min-h-screen flex flex-col">

      {/* Aurora waves */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', bottom: '-35%', left: '-20%',
          width: '80%', height: '70%',
          background: 'radial-gradient(ellipse 90% 80% at 35% 100%, rgba(var(--aurora-green-rgb),0.30) 0%, rgba(var(--aurora-green2-rgb),0.14) 40%, transparent 100%)',
          filter: 'blur(55px)',
          borderRadius: '60% 40% 55% 45% / 55% 45% 55% 45%',
          animation: 'aurora1 17s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-28%', right: '-25%',
          width: '70%', height: '62%',
          background: 'radial-gradient(ellipse 90% 80% at 65% 100%, rgba(var(--aurora-blue-rgb),0.24) 0%, rgba(var(--aurora-blue2-rgb),0.12) 45%, transparent 100%)',
          filter: 'blur(70px)',
          borderRadius: '45% 55% 35% 65% / 50% 45% 55% 50%',
          animation: 'aurora2 22s ease-in-out infinite',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, var(--bg) 0%, transparent 35%, transparent 65%, var(--bg) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--bg) 0%, transparent 20%, transparent 80%, var(--bg) 100%)' }} />
      </div>

      <Navbar onMenuOpen={() => setPanelOpen(true)} />
      <SidePanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} />

      <main style={{ flex: 1, padding: isMobile ? '20px 16px 60px' : '36px 24px 60px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Header */}
          <div style={{ ...fi(0) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Trophy size={22} strokeWidth={1.6} color="var(--accent)" />
              <h1 style={{ fontSize: 26, fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.03em', margin: 0 }}>
                Achievements
              </h1>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
              {unlockedCount} of {total} unlocked
            </p>
            {/* Progress bar */}
            <div style={{ marginTop: 12, height: 4, borderRadius: 2, background: 'rgba(var(--fg-rgb),0.07)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: 'var(--accent)',
                width: total > 0 ? `${(unlockedCount / total) * 100}%` : '0%',
                transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
              }} />
            </div>
          </div>

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: 14,
            ...fi(80),
          }}>
            {achievements.map((a, i) => (
              <AchievementCard key={a.id} a={a} index={i} />
            ))}
          </div>

        </div>
      </main>

    </div>
  );
}
