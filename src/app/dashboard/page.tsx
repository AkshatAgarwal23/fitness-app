'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Clock, Dumbbell, CheckCircle2, Sun, Sunset, Moon, Zap, TrendingUp, Shield, Heart, Target, Timer, Star, Trophy, BarChart2, CalendarCheck, Lock, Activity, Award, Calendar, RotateCcw } from 'lucide-react';
import Navbar from '../components/Navbar';
import SidePanel from '../components/SidePanel';
import Toast, { ToastItem } from '../components/Toast';
import { useIsMobile } from '../hooks/useIsMobile';
import { useFadeIn } from '../hooks/useFadeIn';
import { getCached, setCached } from '../lib/cache';

interface StreakDay {
  day: string;
  status: 'active' | 'today' | 'missed' | 'future';
  sets: number;
  estimatedTime: number;
}

interface TodaySession {
  _id: string;
  workoutName: string;
  muscleGroup: string;
  sets: number;
  estimatedTime: number;
  completed: boolean;
}

interface DashboardData {
  firstName: string;
  todaySession: TodaySession;
  streakDays: StreakDay[];
  currentStreak: number;
  sessionsThisWeek: number;
  totalSessions: number;
  lastWorkout: string | null;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const SUGGESTIONS: Record<string, string[]> = {
  'Full body':              ['Warm up with 5 min light cardio before starting.', 'Focus on form over speed — quality beats quantity.', 'Rest 60–90 sec between sets to recover fully.'],
  'Chest, shoulders, arms': ['Start with compound movements like push-ups or bench press.', 'Keep your core tight throughout every rep.', 'Don\'t flare your elbows — keep them at 45° on chest work.'],
  'Legs, glutes':           ['Stretch your hip flexors before squatting.', 'Drive through your heels on all leg presses and squats.', 'Go slow on the way down — the eccentric phase builds more muscle.'],
  'Core, cardio':           ['Engage your core on every rep — breathe out on effort.', 'Add 10 min steady-state cardio at the end if energy allows.', 'Planks beat crunches — hold position over rep count.'],
  'Back, biceps':           ['Pull with your elbows, not your hands — feel the lats working.', 'Keep your spine neutral on all rows and deadlifts.', 'Supinate your wrist at the top of every curl for full contraction.'],
  'Quads, hamstrings':      ['Warm up your knees with light leg extensions first.', 'Hamstring curls before heavy squats to activate the posterior chain.', 'Don\'t let your knees cave inward on any movement.'],
  'Stretching, mobility':   ['Hold each stretch for at least 30 seconds — don\'t rush.', 'Focus on deep breathing to release tension in tight muscles.', 'Hip flexors and shoulders are most commonly tight — prioritise those.'],
  'Recovery':               ['Stay hydrated — aim for 8+ glasses today.', 'A short 20 min walk is fine and actually helps recovery.', 'Sleep is when your muscles actually grow — prioritise rest tonight.'],
};

function getSuggestions(muscleGroup: string, lastWorkout: string | null, streak: number): string[] {
  const base = SUGGESTIONS[muscleGroup] ?? SUGGESTIONS['Full body'];
  const tips = [...base];
  if (streak >= 3) tips.push(`You're on a ${streak} day streak — stay consistent but listen to your body.`);
  if (lastWorkout) tips.push(`Yesterday was ${lastWorkout} — make sure that muscle group has recovered.`);
  return tips.slice(0, 3);
}

function getTimeOfDay(): { greeting: string; Icon: typeof Sun } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12)  return { greeting: 'Good morning',   Icon: Sun };
  if (hour >= 12 && hour < 18) return { greeting: 'Good afternoon', Icon: Sun };
  if (hour >= 18 && hour < 21) return { greeting: 'Good evening',   Icon: Sunset };
  return { greeting: 'Good night', Icon: Moon };
}

const EXERCISES: Record<string, { name: string; detail: string }[]> = {
  'Full body':              [{ name: 'Push-ups', detail: '3 × 12' }, { name: 'Squats', detail: '3 × 15' }, { name: 'Dumbbell rows', detail: '3 × 12' }, { name: 'Lunges', detail: '3 × 10 each' }, { name: 'Plank', detail: '3 × 30 sec' }],
  'Chest, shoulders, arms': [{ name: 'Bench press', detail: '3 × 12' }, { name: 'Shoulder press', detail: '3 × 12' }, { name: 'Tricep dips', detail: '3 × 12' }, { name: 'Bicep curls', detail: '3 × 12' }, { name: 'Lateral raises', detail: '3 × 15' }],
  'Legs, glutes':           [{ name: 'Squats', detail: '4 × 15' }, { name: 'Glute bridges', detail: '3 × 15' }, { name: 'Lunges', detail: '3 × 12 each' }, { name: 'Leg press', detail: '3 × 12' }, { name: 'Calf raises', detail: '3 × 20' }],
  'Core, cardio':           [{ name: 'Plank', detail: '4 × 45 sec' }, { name: 'Crunches', detail: '4 × 20' }, { name: 'Mountain climbers', detail: '4 × 30 sec' }, { name: 'Russian twists', detail: '4 × 20' }, { name: 'Jumping jacks', detail: '4 × 30 sec' }],
  'Back, biceps':           [{ name: 'Pull-ups', detail: '3 × 8' }, { name: 'Dumbbell rows', detail: '3 × 12' }, { name: 'Lat pulldown', detail: '3 × 12' }, { name: 'Bicep curls', detail: '3 × 12' }, { name: 'Hammer curls', detail: '3 × 12' }],
  'Quads, hamstrings':      [{ name: 'Squats', detail: '4 × 12' }, { name: 'Romanian deadlift', detail: '3 × 10' }, { name: 'Hamstring curls', detail: '4 × 12' }, { name: 'Quad extensions', detail: '3 × 15' }, { name: 'Step-ups', detail: '3 × 12 each' }],
  'Stretching, mobility':   [{ name: 'Hip flexor stretch', detail: '3 × 30 sec' }, { name: 'Shoulder stretch', detail: '3 × 30 sec' }, { name: 'Hamstring stretch', detail: '3 × 30 sec' }, { name: 'Cat-cow', detail: '2 × 10' }, { name: "Child's pose", detail: '2 × 60 sec' }],
};

interface AchievementData {
  id: string;
  name: string;
  desc: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

interface StatsData {
  bestSetTime: number | null;
  bestSetWorkoutName: string | null;
  sessionsThisMonth: number;
  sessionsLastMonth: number;
  consistencyScore: number;
}

const ACHIEVEMENT_ICONS: Record<string, typeof Star> = {
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

const card = {
  borderRadius: 16,
  background: 'var(--card-bg)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid var(--card-border)',
  boxShadow: 'inset 0 1px 0 rgba(var(--fg-rgb),0.05)',
} as React.CSSProperties;

export default function DashboardPage() {
  const router = useRouter();
  const [weeklyGoal, setWeeklyGoal] = useState(() => getCached<{ weeklyGoal: number }>('profile')?.weeklyGoal ?? 3);
  const [data, setData] = useState<DashboardData | null>(() => getCached<DashboardData>('dashboard'));
  const [panelOpen, setPanelOpen] = useState(false);
  const [started, setStarted] = useState(() => getCached<DashboardData>('dashboard')?.todaySession?.completed ?? false);
  const [completing, setCompleting] = useState(false);
  const [done, setDone] = useState(() => getCached<DashboardData>('dashboard')?.todaySession?.completed ?? false);
  const [tipIndex, setTipIndex] = useState(0);
  const [tipFading, setTipFading] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [displayStreak, setDisplayStreak] = useState(0);
  const [displaySessions, setDisplaySessions] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [currentSet, setCurrentSet] = useState(0);
  const [completedSets, setCompletedSets] = useState<number[]>([]);
  const [setSeconds, setSetSeconds] = useState(0);
  const [resting, setResting] = useState(false);
  const [restCountdown, setRestCountdown] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const setTimerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [achievements, setAchievements] = useState<AchievementData[]>(() => getCached<AchievementData[]>('achievements') ?? []);
  const [statsData, setStatsData] = useState<StatsData | null>(() => getCached<StatsData>('stats'));
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const isMobile = useIsMobile();
  const fi = useFadeIn();
  const { greeting, Icon: TimeIcon } = getTimeOfDay();
  const TIP_DURATION = 4000;
  const tips = data ? getSuggestions(data.todaySession.muscleGroup, data.lastWorkout, data.currentStreak) : [];

  useEffect(() => {
    if (tips.length <= 1) return;
    const interval = setInterval(() => {
      setTipFading(true);
      setTimeout(() => {
        setTipIndex(prev => (prev + 1) % tips.length);
        setTipFading(false);
      }, 380);
    }, TIP_DURATION);
    return () => clearInterval(interval);
  }, [tips.length]);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/profile',      { credentials: 'include' }),
      fetch('http://localhost:5000/api/dashboard',    { credentials: 'include' }),
      fetch('http://localhost:5000/api/achievements', { credentials: 'include' }),
      fetch('http://localhost:5000/api/stats',        { credentials: 'include' }),
    ]).then(async ([pRes, dRes, aRes, sRes]) => {
      if (pRes.status === 401 || dRes.status === 401) { router.replace('/login'); return; }
      const [p, d, a, s] = await Promise.all([pRes.json(), dRes.json(), aRes.json(), sRes.json()]);
      if (p) { setWeeklyGoal(p.weeklyGoal ?? 3); setCached('profile', p); }
      if (d) {
        setData(d);
        setCached('dashboard', d);
        if (d.todaySession?.completed) { setDone(true); setStarted(true); }
      }
      if (a) { setAchievements(a); setCached('achievements', a); }
      if (s) { setStatsData(s); setCached('stats', s); }
    }).catch(() => router.replace('/login'));
  }, [router]);

  // Count-up animation for streak and sessions
  useEffect(() => {
    if (!data) return;
    const target = data.currentStreak;
    const targetS = data.sessionsThisWeek;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayStreak(Math.min(i * Math.ceil(target / 20), target));
      setDisplaySessions(Math.min(i * Math.ceil(targetS / 20), targetS));
      if (i >= 20) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.currentStreak, data?.sessionsThisWeek]);

  // Overall workout timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  // Per-set timer
  useEffect(() => {
    if (currentSet > 0 && !resting && !done) {
      setTimerRef.current = setInterval(() => setSetSeconds(s => s + 1), 1000);
    } else {
      if (setTimerRef.current) clearInterval(setTimerRef.current);
    }
    return () => { if (setTimerRef.current) clearInterval(setTimerRef.current); };
  }, [currentSet, resting, done]);

  // Rest countdown
  useEffect(() => {
    if (!resting) return;
    restTimerRef.current = setInterval(() => {
      setRestCountdown(prev => {
        if (prev <= 1) { clearInterval(restTimerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (restTimerRef.current) clearInterval(restTimerRef.current); };
  }, [resting]);

  function completeSet() {
    if (setTimerRef.current) clearInterval(setTimerRef.current);
    setCompletedSets(prev => [...prev, setSeconds]);
    setSetSeconds(0);
    setResting(true);
    setRestCountdown(60);
  }

  function startNextSet() {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setResting(false);
    setCurrentSet(prev => prev + 1);
    setSetSeconds(0);
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  async function handleComplete() {
    setCompleting(true);
    try {
      const res = await fetch('http://localhost:5000/api/session/complete', { method: 'POST', credentials: 'include' });
      if (res.ok) {
        const body = await res.json();
        setDone(true);
        setTimerRunning(false);
        setData(prev => prev ? {
          ...prev,
          currentStreak: prev.currentStreak + 1,
          sessionsThisWeek: prev.sessionsThisWeek + 1,
          todaySession: { ...prev.todaySession, completed: true },
          streakDays: prev.streakDays.map(d => d.status === 'today' ? { ...d, status: 'active' as const } : d),
        } : prev);

        // Show toasts for newly unlocked achievements
        if (body.newAchievements?.length > 0) {
          const newToasts: ToastItem[] = body.newAchievements.map((a: { id: string; name: string }) => ({
            id: `${a.id}-${Date.now()}`,
            achievementName: a.name,
          }));
          setToasts(prev => [...prev, ...newToasts]);
          // Refresh achievements list
          fetch('http://localhost:5000/api/achievements', { credentials: 'include' })
            .then(r => r.json())
            .then((data: AchievementData[]) => { setAchievements(data); setCached('achievements', data); })
            .catch(() => {});
        }

        // Confetti burst — canvas can't resolve CSS variables, so read the
        // current theme's actual color values first
        const confetti = (await import('canvas-confetti')).default;
        const cs = getComputedStyle(document.documentElement);
        const c = (v: string) => cs.getPropertyValue(v).trim();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: [c('--accent'), c('--accent-3'), c('--text'), c('--accent-deep')] });
        setTimeout(() => confetti({ particleCount: 60, spread: 60, origin: { y: 0.4 }, colors: [c('--accent'), c('--accent-3')] }), 300);
      }
    } finally { setCompleting(false); }
  }

  const isRest = data?.todaySession?.workoutName === 'Rest day';

  return (
    <div className="min-h-screen flex flex-col">

      {/* Aurora waves */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {/* Band 1 — rich teal-green, bottom-left anchor */}
        <div style={{
          position: 'absolute', bottom: '-35%', left: '-20%',
          width: '80%', height: '70%',
          background: 'radial-gradient(ellipse 90% 80% at 35% 100%, rgba(var(--aurora-green-rgb),0.30) 0%, rgba(var(--aurora-green2-rgb),0.14) 40%, transparent 100%)',
          filter: 'blur(55px)',
          borderRadius: '60% 40% 55% 45% / 55% 45% 55% 45%',
          animation: 'aurora1 17s ease-in-out infinite',
        }} />
        {/* Band 2 — deep blue, bottom-right */}
        <div style={{
          position: 'absolute', bottom: '-28%', right: '-25%',
          width: '70%', height: '62%',
          background: 'radial-gradient(ellipse 90% 80% at 65% 100%, rgba(var(--aurora-blue-rgb),0.24) 0%, rgba(var(--aurora-blue2-rgb),0.12) 45%, transparent 100%)',
          filter: 'blur(70px)',
          borderRadius: '45% 55% 35% 65% / 50% 45% 55% 50%',
          animation: 'aurora2 22s ease-in-out infinite',
        }} />
        {/* Band 3 — dark teal-cyan, centre blend */}
        <div style={{
          position: 'absolute', bottom: '-15%', left: '12%',
          width: '68%', height: '48%',
          background: 'radial-gradient(ellipse at 50% 100%, rgba(var(--aurora-cyan-rgb),0.18) 0%, rgba(var(--aurora-cyan2-rgb),0.09) 50%, transparent 100%)',
          filter: 'blur(65px)',
          borderRadius: '50% 50% 45% 55% / 45% 55% 50% 50%',
          animation: 'aurora3 26s ease-in-out infinite',
        }} />
        {/* Band 4 — transition bridge between teal and blue */}
        <div style={{
          position: 'absolute', bottom: '-22%', left: '30%',
          width: '52%', height: '52%',
          background: 'radial-gradient(ellipse 80% 70% at 50% 100%, rgba(var(--aurora-green-rgb),0.10) 0%, rgba(var(--aurora-blue-rgb),0.07) 60%, transparent 100%)',
          filter: 'blur(80px)',
          borderRadius: '55% 45% 60% 40% / 50% 55% 45% 50%',
          animation: 'aurora4 31s ease-in-out infinite',
        }} />
        {/* Vignette — keeps top and sides dark */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, var(--bg) 0%, transparent 35%, transparent 65%, var(--bg) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--bg) 0%, transparent 20%, transparent 80%, var(--bg) 100%)' }} />
      </div>


      <Navbar onMenuOpen={() => setPanelOpen(true)} />
      <SidePanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} />
      <Toast toasts={toasts} onDismiss={dismissToast} />

      <main style={{ flex: 1, padding: isMobile ? '20px 16px 60px' : '36px 24px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Greeting + top-right stats */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: isMobile ? 12 : 16, flexWrap: 'wrap', ...fi(0) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <TimeIcon size={26} strokeWidth={1.6} color="var(--accent)" />
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.2 }}>
                  {greeting}{data?.firstName ? `, ${data.firstName}` : ''}
                </h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '3px 0 0' }}>
                  {isRest ? "Rest day — recovery is part of the plan." : "Here's your plan for today."}
                </p>
              </div>
            </div>

            {/* Stat chips */}
            <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 18px', borderRadius: 12,
                background: 'var(--card-bg)',
                border: '1px solid rgba(var(--fg-rgb),0.08)',
                backdropFilter: 'blur(24px)',
              }}>
                <TrendingUp size={16} strokeWidth={1.8} color="var(--accent)" />
                <div>
                  <p style={{ fontSize: 26, fontWeight: 600, color: 'var(--text)', margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {displaySessions}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0' }}>Sessions this week</p>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 18px', borderRadius: 12,
                background: 'var(--card-bg)',
                border: '1px solid rgba(var(--fg-rgb),0.08)',
                backdropFilter: 'blur(24px)',
              }}>
                <Dumbbell size={16} strokeWidth={1.8} color="var(--accent)" />
                <div>
                  <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', margin: 0, lineHeight: 1.2, maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {data?.lastWorkout ?? '—'}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0' }}>Last workout</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bento grid */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>

            {/* TODAY'S WORKOUT — spans full width */}
            <div style={{
              ...card,
              ...fi(100),
              gridColumn: '1 / -1',
              padding: 22,
              position: 'relative',
              background: isRest
                ? 'var(--card-bg)'
                : 'var(--workout-bg)',
              border: isRest
                ? '1px solid var(--card-border)'
                : '1px solid var(--workout-border)',
            }}>
              {/* Background watermark icon — clipped to its own layer */}
              {!isRest && (
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 16, pointerEvents: 'none' }}>
                  <Dumbbell
                    size={140} strokeWidth={0.5} color="rgba(var(--accent-rgb),0.07)"
                    style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%) rotate(-20deg)' }}
                  />
                </div>
              )}

              <div style={{ position: 'relative' }}>
                {/* Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: isRest ? 'var(--text-muted)' : 'var(--accent)',
                  }}>
                    {isRest ? 'Today' : "Today's workout"}
                  </span>
                  {!isRest && (
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 20,
                      background: 'rgba(var(--accent-rgb),0.15)', color: 'var(--accent)',
                      border: '1px solid rgba(var(--accent-rgb),0.2)',
                    }}>
                      {data?.todaySession?.muscleGroup}
                    </span>
                  )}
                </div>

                {/* Workout name */}
                <h2 style={{
                  fontSize: isRest ? 20 : 24, fontWeight: 500,
                  color: 'var(--text)', margin: '0 0 6px',
                  letterSpacing: '-0.03em', lineHeight: 1.1,
                }}>
                  {isRest ? 'Rest day' : data?.todaySession?.workoutName}
                </h2>

                {isRest ? (
                  <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: '0 0 0', lineHeight: 1.7, maxWidth: 500 }}>
                    Recovery is as important as training. Sleep well, stay hydrated, and come back stronger tomorrow.
                  </p>
                ) : (
                  <>
                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 0, margin: '12px 0 16px', flexWrap: 'wrap' }}>
                      {/* Sets — editable */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: isMobile ? 14 : 20, borderRight: '1px solid rgba(var(--fg-rgb),0.07)' }}>
                        <Flame size={15} strokeWidth={1.8} color="var(--accent)" />
                        <div>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sets</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button
                              onClick={async () => {
                                const next = Math.max(1, (data?.todaySession?.sets ?? 3) - 1);
                                if (next < completedSets.length) return;
                                setData(prev => prev ? { ...prev, todaySession: { ...prev.todaySession, sets: next } } : prev);
                                await fetch('http://localhost:5000/api/session/sets', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ sets: next }) });
                              }}
                              style={{ width: 22, height: 22, borderRadius: 5, border: '1px solid rgba(var(--fg-rgb),0.1)', background: 'rgba(var(--fg-rgb),0.05)', color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                            >−</button>
                            <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', margin: 0, minWidth: 18, textAlign: 'center', letterSpacing: '-0.02em' }}>{data?.todaySession?.sets}</p>
                            <button
                              onClick={async () => {
                                const next = Math.min(10, (data?.todaySession?.sets ?? 3) + 1);
                                setData(prev => prev ? { ...prev, todaySession: { ...prev.todaySession, sets: next } } : prev);
                                await fetch('http://localhost:5000/api/session/sets', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ sets: next }) });
                              }}
                              style={{ width: 22, height: 22, borderRadius: 5, border: '1px solid rgba(var(--fg-rgb),0.1)', background: 'rgba(var(--fg-rgb),0.05)', color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                            >+</button>
                          </div>
                        </div>
                      </div>

                      {/* Duration + Intensity */}
                      {[
                        { icon: Clock, label: 'Duration', value: `${data?.todaySession?.estimatedTime} min` },
                        { icon: Dumbbell, label: 'Intensity', value: '10–12 reps' },
                      ].map(({ icon: Icon, label, value }, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: isMobile ? '6px 14px 0' : '0 20px',
                          borderRight: (!isMobile && i === 0) ? '1px solid rgba(var(--fg-rgb),0.07)' : 'none',
                        }}>
                          <Icon size={17} strokeWidth={1.8} color="var(--accent)" />
                          <div>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                            <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Exercise list toggle */}
                    {(() => {
                      const exercises = EXERCISES[data?.todaySession?.muscleGroup ?? ''] ?? [];
                      if (exercises.length === 0) return null;
                      return (
                        <div style={{ marginBottom: 16 }}>
                          <button
                            onClick={() => setExpanded(v => !v)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              fontSize: 12, fontWeight: 500, color: 'var(--accent)',
                              background: 'none', border: 'none', padding: 0,
                              cursor: 'pointer', letterSpacing: '0.01em',
                            }}
                          >
                            <span style={{
                              display: 'inline-block',
                              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease',
                              fontSize: 11,
                            }}>▶</span>
                            {expanded ? 'Hide exercises' : 'Show exercises'}
                          </button>

                          <div style={{
                            overflow: 'hidden',
                            maxHeight: expanded ? `${exercises.length * 56 + 20}px` : '0px',
                            transition: 'max-height 0.35s cubic-bezier(0.16,1,0.3,1)',
                          }}>
                            <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {exercises.map((ex, i) => (
                                <div key={i} style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                  padding: '8px 14px', borderRadius: 8,
                                  background: 'rgba(var(--fg-rgb),0.03)',
                                  border: '1px solid rgba(var(--fg-rgb),0.06)',
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{
                                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                                      background: 'rgba(var(--accent-rgb),0.12)',
                                      border: '1px solid rgba(var(--accent-rgb),0.2)',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: 10, color: 'var(--accent)', fontWeight: 600,
                                    }}>
                                      {i + 1}
                                    </span>
                                    <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 450 }}>{ex.name}</span>
                                  </div>
                                  <span style={{
                                    fontSize: 12, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums',
                                    background: 'rgba(var(--fg-rgb),0.04)', padding: '2px 8px', borderRadius: 6,
                                  }}>
                                    {ex.detail}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Rotating tip */}
                    {tips.length > 0 && !done && (() => {
                      const tipIcons = [Target, Shield, Heart];
                      const tipLabels = ['Form', 'Recovery', 'Mindset'];
                      const TipIcon = tipIcons[tipIndex % 3] ?? Target;
                      const tip = tips[tipIndex];
                      return (
                        <div style={{ marginBottom: 18, height: 44 }}>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 10, height: '100%',
                            opacity: tipFading ? 0 : 1,
                            transform: tipFading ? 'translateY(-5px)' : 'translateY(0)',
                            transition: 'opacity 0.38s ease, transform 0.38s ease',
                          }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                              background: 'rgba(var(--accent-rgb),0.12)',
                              border: '1px solid rgba(var(--accent-rgb),0.2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <TipIcon size={14} strokeWidth={1.8} color="var(--accent)" />
                            </div>
                            <div>
                              <p style={{ fontSize: 10, color: 'var(--accent)', margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                {tipLabels[tipIndex % 3]}
                              </p>
                              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{tip}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Set tracker / CTA */}
                    {done ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--accent)', fontSize: 14, padding: '10px 20px', borderRadius: 10, background: 'rgba(var(--accent-rgb),0.1)', border: '1px solid rgba(var(--accent-rgb),0.2)' }}>
                        <CheckCircle2 size={18} strokeWidth={1.8} />
                        Great work! {completedSets.length} sets in {formatTime(timerSeconds)}.
                      </div>
                    ) : !started ? (
                      <button onClick={() => { setStarted(true); setTimerRunning(true); setCurrentSet(1); setSetSeconds(0); }} style={{
                        padding: '12px 28px', borderRadius: 10, border: 'none',
                        background: 'var(--accent)', color: '#fff',
                        fontSize: 14, fontWeight: 500, cursor: 'pointer',
                        letterSpacing: '0.01em',
                      }}>
                        Start workout
                      </button>
                    ) : (() => {
                      const totalSets = data?.todaySession?.sets ?? 3;
                      const allSetsComplete = completedSets.length >= totalSets;

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                          {/* Progress dots + overall timer */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {Array.from({ length: totalSets }).map((_, i) => (
                                <div key={i} style={{
                                  width: i < completedSets.length ? 22 : 8,
                                  height: 8, borderRadius: 4,
                                  background: i < completedSets.length ? 'var(--accent)' : i === completedSets.length ? 'rgba(var(--accent-rgb),0.4)' : 'rgba(var(--fg-rgb),0.1)',
                                  transition: 'all 0.3s ease',
                                }} />
                              ))}
                              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>
                                {completedSets.length} / {totalSets} sets
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 12 }}>
                              <Timer size={12} strokeWidth={1.8} />
                              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatTime(timerSeconds)}</span>
                            </div>
                          </div>

                          {resting ? (
                            /* Rest state */
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, background: 'rgba(var(--fg-rgb),0.03)', border: '1px solid rgba(var(--fg-rgb),0.07)' }}>
                              <div style={{ textAlign: 'center', minWidth: 64 }}>
                                <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rest</p>
                                <span style={{ fontSize: 24, fontWeight: 600, color: restCountdown > 10 ? 'var(--text)' : '#F5A623', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                                  {formatTime(restCountdown)}
                                </span>
                              </div>
                              <div style={{ width: 1, height: 36, background: 'rgba(var(--fg-rgb),0.07)', flexShrink: 0 }} />
                              {allSetsComplete ? (
                                <button onClick={handleComplete} disabled={completing} style={{
                                  flex: 1, padding: '10px 0', borderRadius: 10,
                                  background: 'var(--accent)', color: '#fff',
                                  fontSize: 13, fontWeight: 500, border: 'none', cursor: completing ? 'not-allowed' : 'pointer',
                                }}>
                                  {completing ? 'Saving…' : 'Finish workout'}
                                </button>
                              ) : (
                                <button onClick={startNextSet} style={{
                                  flex: 1, padding: '10px 0', borderRadius: 10,
                                  background: 'rgba(var(--accent-rgb),0.12)', color: 'var(--accent)',
                                  fontSize: 13, fontWeight: 500, border: '1px solid rgba(var(--accent-rgb),0.25)', cursor: 'pointer',
                                }}>
                                  Start set {completedSets.length + 1} →
                                </button>
                              )}
                            </div>
                          ) : (
                            /* Active set state */
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, background: 'rgba(var(--accent-rgb),0.05)', border: '1px solid rgba(var(--accent-rgb),0.15)' }}>
                              <div style={{ textAlign: 'center', minWidth: 64 }}>
                                <p style={{ fontSize: 10, color: 'var(--accent)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Set {currentSet}</p>
                                <span style={{ fontSize: 24, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                                  {formatTime(setSeconds)}
                                </span>
                              </div>
                              <div style={{ width: 1, height: 36, background: 'rgba(var(--fg-rgb),0.07)', flexShrink: 0 }} />
                              <button onClick={completeSet} style={{
                                flex: 1, padding: '10px 0', borderRadius: 10,
                                background: 'rgba(var(--accent-rgb),0.12)', color: 'var(--accent)',
                                fontSize: 13, fontWeight: 500, border: '1px solid rgba(var(--accent-rgb),0.25)', cursor: 'pointer',
                              }}>
                                Complete set ✓
                              </button>
                            </div>
                          )}

                          {/* Completed set history */}
                          {completedSets.length > 0 && (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {completedSets.map((s, i) => (
                                <div key={i} style={{
                                  display: 'flex', alignItems: 'center', gap: 5,
                                  padding: '4px 10px', borderRadius: 6,
                                  background: 'rgba(var(--accent-rgb),0.08)',
                                  border: '1px solid rgba(var(--accent-rgb),0.15)',
                                }}>
                                  <CheckCircle2 size={11} strokeWidth={2} color="var(--accent)" />
                                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                                    Set {i + 1} · {formatTime(s)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>

            {/* STREAK CARD */}
            <div style={{ ...card, ...fi(200), padding: isMobile ? 20 : 28, gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: isMobile ? 20 : 40, flexWrap: 'wrap' }}>

              {/* Left: streak count */}
              <div style={{ flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Zap size={14} strokeWidth={1.8} color="var(--accent)" />
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Current streak</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 56, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.05em', lineHeight: 1 }}>
                    {displayStreak}
                  </span>
                  <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>days</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 0' }}>
                  {(data?.currentStreak ?? 0) > 0 ? 'Keep it going!' : "Complete today's workout to start."}
                </p>
              </div>

              {/* Divider — hidden on mobile when cards stack vertically */}
              {!isMobile && <div style={{ width: 1, height: 80, background: 'rgba(var(--fg-rgb),0.07)', flexShrink: 0 }} />}

              {/* Right: animated day bars */}
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 64 }}>
                  {(data?.streakDays ?? []).map((d, i) => {
                    const active = d.status === 'active';
                    const today  = d.status === 'today';
                    const missed = d.status === 'missed';

                    // Intensity score: sets × time, normalized to 35–100%
                    // Min workout: 2×20=40, Max: 5×35=175
                    const score = d.sets * d.estimatedTime;
                    const normalized = score > 0
                      ? Math.round(35 + ((score - 40) / (175 - 40)) * 65)
                      : 0;
                    const clampedH = Math.min(100, Math.max(35, normalized));

                    const barH = active ? `${clampedH}%` : today ? '50%' : missed ? '18%' : '12%';
                    const bg = active
                      ? 'var(--bar)'
                      : today
                      ? 'rgba(var(--bar-rgb),0.35)'
                      : 'rgba(var(--fg-rgb),0.07)';
                    const glow = active ? '0 0 10px rgba(var(--bar-rgb),0.5)' : 'none';
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{
                          width: '100%', borderRadius: 4,
                          height: barH,
                          background: bg,
                          boxShadow: glow,
                          transition: 'height 0.6s cubic-bezier(0.16,1,0.3,1)',
                          animation: active ? 'pulse-glow 2.5s ease-in-out infinite' : 'none',
                        }} />
                        <span style={{ fontSize: 10, color: active || today ? 'var(--bar)' : 'var(--text-muted)', letterSpacing: '0.04em' }}>
                          {DAY_LABELS[i]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* WEEKLY SUMMARY */}
            {(() => {
              const activedays = (data?.streakDays ?? []).filter(d => d.status === 'active' || d.status === 'today').length;
              const totalTime = (data?.streakDays ?? []).filter(d => d.status === 'active').reduce((sum, d) => sum + d.estimatedTime, 0);
              const sessions = data?.sessionsThisWeek ?? 0;
              const stats = [
                { Icon: CalendarCheck, label: 'Days active', value: `${activedays}` },
                { Icon: BarChart2,     label: 'Sessions',    value: `${sessions} / ${weeklyGoal}`  },
                { Icon: Clock,         label: 'Est. time',   value: `${totalTime} min` },
              ];
              return (
                <div style={{ ...card, ...fi(300), padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 18 }}>
                    <TrendingUp size={13} strokeWidth={1.8} color="var(--accent)" />
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>This week</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {stats.map(({ Icon, label, value }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Icon size={13} strokeWidth={1.8} color="var(--text-muted)" />
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  {/* Mini week bar */}
                  <div style={{ display: 'flex', gap: 4, marginTop: 20 }}>
                    {(data?.streakDays ?? []).map((d, i) => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 2,
                        background: d.status === 'active' ? 'var(--bar)' : d.status === 'today' ? 'rgba(var(--bar-rgb),0.3)' : 'rgba(var(--fg-rgb),0.06)' }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    {['M','T','W','T','F','S','S'].map((l, i) => (
                      <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--text-muted)' }}>{l}</span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* ACTIVITY STATS */}
            <div style={{ ...card, ...fi(380), padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 18 }}>
                <Activity size={13} strokeWidth={1.8} color="var(--accent)" />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Activity stats</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Best session */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Timer size={13} strokeWidth={1.8} color="var(--text-muted)" />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Best session</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                      {statsData?.bestSetTime != null ? `${statsData.bestSetTime} min` : '—'}
                    </span>
                    {statsData?.bestSetWorkoutName && (
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '1px 0 0', maxWidth: 120, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {statsData.bestSetWorkoutName}
                      </p>
                    )}
                  </div>
                </div>
                {/* Sessions this month */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalendarCheck size={13} strokeWidth={1.8} color="var(--text-muted)" />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>This month</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                      {statsData?.sessionsThisMonth ?? '—'}
                    </span>
                    {statsData?.sessionsLastMonth != null && statsData.sessionsLastMonth > 0 && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        vs {statsData.sessionsLastMonth} last
                      </span>
                    )}
                  </div>
                </div>
                {/* Consistency score */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Zap size={13} strokeWidth={1.8} color="var(--text-muted)" />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Consistency</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                      {statsData != null ? `${statsData.consistencyScore}%` : '—'}
                    </span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'rgba(var(--fg-rgb),0.07)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 2, background: 'var(--accent)',
                      width: `${statsData?.consistencyScore ?? 0}%`,
                      transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
                    }} />
                  </div>
                </div>
              </div>
            </div>

            {/* ACHIEVEMENTS */}
            <div style={{ ...card, ...fi(460), padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Trophy size={13} strokeWidth={1.8} color="var(--accent)" />
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Achievements</p>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {achievements.filter(a => a.unlocked).length} / {achievements.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {achievements.slice(0, 6).map(a => {
                  const Icon = ACHIEVEMENT_ICONS[a.id] ?? Star;
                  return (
                    <div key={a.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '8px 12px', borderRadius: 10,
                      background: a.unlocked ? 'rgba(var(--accent-rgb),0.07)' : 'rgba(var(--fg-rgb),0.02)',
                      border: `1px solid ${a.unlocked ? 'rgba(var(--accent-rgb),0.18)' : 'rgba(var(--fg-rgb),0.05)'}`,
                      opacity: a.unlocked ? 1 : 0.45,
                      transition: 'all 0.2s ease',
                    }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: a.unlocked ? 'rgba(var(--accent-rgb),0.15)' : 'rgba(var(--fg-rgb),0.04)',
                        border: `1px solid ${a.unlocked ? 'rgba(var(--accent-rgb),0.25)' : 'rgba(var(--fg-rgb),0.07)'}`,
                      }}>
                        {a.unlocked
                          ? <Icon size={14} strokeWidth={1.8} color="var(--accent)" />
                          : <Lock size={12} strokeWidth={1.8} color="var(--text-muted)" />
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 500, color: a.unlocked ? 'var(--text)' : 'var(--text-secondary)', margin: 0 }}>{a.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '1px 0 0' }}>{a.desc}</p>
                      </div>
                      {a.unlocked && (
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, boxShadow: '0 0 6px rgba(var(--accent-rgb),0.8)' }} />
                      )}
                    </div>
                  );
                })}
              </div>
              {achievements.length > 6 && (
                <a href="/achievements" style={{
                  display: 'block', marginTop: 12, textAlign: 'center',
                  fontSize: 12, color: 'var(--accent)', textDecoration: 'none',
                  padding: '8px 0', borderRadius: 8,
                  background: 'rgba(var(--accent-rgb),0.07)',
                  border: '1px solid rgba(var(--accent-rgb),0.15)',
                }}>
                  View all achievements →
                </a>
              )}
            </div>

          </div>


        </div>
      </main>
    </div>
  );
}
