'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userBmi, setUserBmi] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/profile', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) { router.replace('/login'); return null; }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setUserName(data.name || '');
          setUserBmi(data.bmi ?? null);
        }
      })
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[14px]" style={{ color: '#4A4C5A' }}>Loading…</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userName={userName} userBmi={userBmi} />

      <main className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(29,158,117,0.15) 0%, transparent 70%)' }}
        />

        <div
          className="relative w-full max-w-[440px] rounded-[16px] p-8 flex flex-col items-center gap-4 text-center"
          style={{
            background: 'rgba(13,15,22,0.75)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.2)' }}
          >
            <span style={{ fontSize: 20 }}>⚡</span>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-[20px] font-medium tracking-[-0.02em]" style={{ color: '#EEEDF0' }}>
              Dashboard coming soon
            </h2>
            <p className="text-[14px] leading-relaxed" style={{ color: '#7B7D8E' }}>
              Phase 2 will bring your daily workouts, streak tracker, and adaptive suggestions.
            </p>
          </div>
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-medium"
            style={{
              background: 'rgba(29,158,117,0.08)',
              color: '#1D9E75',
              border: '1px solid rgba(29,158,117,0.15)',
            }}
          >
            Phase 2 in progress
          </div>
        </div>
      </main>
    </div>
  );
}

