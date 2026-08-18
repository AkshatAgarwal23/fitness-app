'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Dumbbell, Clock, Flame } from 'lucide-react';
import Navbar from '../components/Navbar';
import SidePanel from '../components/SidePanel';
import { useIsMobile } from '../hooks/useIsMobile';

interface SessionEntry {
  _id: string;
  date: string;
  workoutName: string;
  muscleGroup: string;
  sets: number;
  estimatedTime: number;
  completed: boolean;
}

interface HistoryResponse {
  sessions: SessionEntry[];
  total: number;
  hasMore: boolean;
}

// ── Date helpers ─────────────────────────────────────────────────────────────

function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function weekKey(date: Date): string {
  return startOfWeek(date).toISOString();
}

function weekLabel(isoKey: string): string {
  const thisWeekKey  = weekKey(new Date());
  const lastWeekDate = new Date();
  lastWeekDate.setDate(lastWeekDate.getDate() - 7);
  const lastWeekKey  = weekKey(lastWeekDate);

  if (isoKey === thisWeekKey)  return 'This week';
  if (isoKey === lastWeekKey)  return 'Last week';

  const monday = new Date(isoKey);
  return `Week of ${monday.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

// ── Group sessions by week ────────────────────────────────────────────────────

interface WeekGroup {
  key: string;
  label: string;
  sessions: SessionEntry[];
}

function groupByWeek(sessions: SessionEntry[]): WeekGroup[] {
  const map = new Map<string, SessionEntry[]>();
  for (const s of sessions) {
    const k = weekKey(new Date(s.date));
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(s);
  }
  return Array.from(map.entries()).map(([key, sessions]) => ({
    key,
    label: weekLabel(key),
    sessions,
  }));
}

// ── Components ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '56px 24px',
      borderRadius: 12,
      background: 'var(--card-bg)',
      border: '1px solid var(--card-border)',
      backdropFilter: 'blur(24px)',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12, margin: '0 auto 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(var(--accent-rgb),0.1)',
        border: '1px solid rgba(var(--accent-rgb),0.2)',
      }}>
        <Dumbbell size={22} strokeWidth={1.8} color="var(--accent)" />
      </div>
      <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', margin: '0 0 6px' }}>
        No workouts yet — start today!
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
        Your completed sessions will appear here.
      </p>
    </div>
  );
}

function SessionCard({ session }: { session: SessionEntry }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      gap: 16,
      padding: '16px 20px',
      borderRadius: 12,
      background: 'var(--card-bg)',
      border: '1px solid var(--card-border)',
      backdropFilter: 'blur(24px)',
    }}>
      {/* Left: date + workout info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 5px' }}>
          {formatDate(session.date)}
        </p>
        <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
          {session.workoutName}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
            <Flame size={12} strokeWidth={1.8} color="var(--accent)" />
            {session.sets} sets
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
            <Clock size={12} strokeWidth={1.8} color="var(--accent)" />
            {session.estimatedTime} min
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {session.muscleGroup}
          </span>
        </div>
      </div>

      {/* Right: completed badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
        padding: '4px 10px', borderRadius: 999,
        background: 'rgba(var(--accent-rgb),0.1)',
        border: '1px solid rgba(var(--accent-rgb),0.2)',
      }}>
        <CheckCircle2 size={12} strokeWidth={2} color="var(--accent)" />
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--accent)' }}>Completed</span>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [panelOpen, setPanelOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [groups, setGroups] = useState<WeekGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch user name for navbar
  useEffect(() => {
    fetch('http://localhost:5000/api/profile', { credentials: 'include' })
      .then(res => { if (res.status === 401) { router.replace('/login'); return null; } return res.json(); })
      .then(data => { if (data) setUserName(data.name ?? ''); })
      .catch(() => router.replace('/login'));
  }, [router]);

  // Fetch first page
  useEffect(() => {
    fetch('http://localhost:5000/api/sessions/history?page=1&limit=10', { credentials: 'include' })
      .then(res => {
        if (res.status === 401) { router.replace('/login'); return null; }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<HistoryResponse>;
      })
      .then(data => {
        if (data) {
          setGroups(groupByWeek(data.sessions));
          setTotal(data.total);
          setHasMore(data.hasMore);
          setPage(1);
        }
      })
      .catch(err => console.error('Progress fetch error:', err))
      .finally(() => setLoading(false));
  }, [router]);

  async function loadMore() {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(
        `http://localhost:5000/api/sessions/history?page=${nextPage}&limit=10`,
        { credentials: 'include' }
      );
      if (!res.ok) return;
      const data: HistoryResponse = await res.json();
      // Merge new sessions into existing week groups
      setGroups(prev => {
        const merged = [...prev.flatMap(g => g.sessions), ...data.sessions];
        return groupByWeek(merged);
      });
      setHasMore(data.hasMore);
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading…</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userName={userName} onMenuOpen={() => setPanelOpen(true)} />
      <SidePanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} />

      <main style={{ flex: 1, padding: isMobile ? '24px 16px 60px' : '40px 24px 80px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Page header */}
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: 'var(--text)', margin: '0 0 4px', letterSpacing: '-0.025em' }}>
              Progress log
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              {total === 0 ? 'No sessions yet.' : `${total} completed session${total === 1 ? '' : 's'} total.`}
            </p>
          </div>

          {/* Empty state */}
          {groups.length === 0 && <EmptyState />}

          {/* Week groups */}
          {groups.map(group => (
            <div key={group.key} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Week label */}
              <p style={{
                fontSize: 11, fontWeight: 500, color: 'var(--text-muted)',
                margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {group.label}
              </p>
              {/* Session cards */}
              {group.sessions.map(session => (
                <SessionCard key={session._id} session={session} />
              ))}
            </div>
          ))}

          {/* Load more */}
          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={loadMore}
                disabled={loadingMore}
                style={{
                  padding: '10px 28px', borderRadius: 8,
                  background: 'transparent',
                  border: '1px solid rgba(var(--fg-rgb),0.15)',
                  color: 'var(--text-secondary)',
                  fontSize: 13, fontWeight: 500,
                  cursor: loadingMore ? 'not-allowed' : 'pointer',
                  opacity: loadingMore ? 0.6 : 1,
                  transition: 'all 0.18s ease',
                }}
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
