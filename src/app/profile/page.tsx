'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Avatar from '../components/Avatar';
import BMIBadge from '../components/BMIBadge';

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

function InfoRow({ label, value }: { label: string; value: string | number | undefined }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div
      className="flex items-center justify-between py-3.5"
      style={{ borderBottom: '1px solid #1C1E28' }}
    >
      <span className="text-[12px] uppercase tracking-wide font-medium" style={{ color: '#4A4C5A' }}>
        {label}
      </span>
      <span className="text-[14px]" style={{ color: '#EEEDF0' }}>
        {value}
      </span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/profile', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) { router.replace('/login'); return null; }
        return res.json();
      })
      .then((data) => { if (data) setUser(data); })
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

  if (!user) return null;

  const heightDisplay = user.height ? `${user.height} ${user.heightUnit ?? 'cm'}` : undefined;

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(29,158,117,0.15) 0%, transparent 70%)' }}
      />

      <div
        className="relative w-full max-w-[460px] rounded-[16px] overflow-hidden"
        style={{
          background: 'rgba(13,15,22,0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Profile header */}
        <div
          className="px-8 py-8 flex flex-col items-center gap-4 text-center"
          style={{ borderBottom: '1px solid #252730' }}
        >
          <Avatar name={user.name} size={64} />
          <div className="flex flex-col gap-1">
            <h2 className="text-[20px] font-medium tracking-[-0.02em]" style={{ color: '#EEEDF0' }}>
              {user.name}
            </h2>
            <p className="text-[13px]" style={{ color: '#4A4C5A' }}>{user.email}</p>
          </div>
          {user.bmi && <BMIBadge bmi={user.bmi} />}
        </div>

        {/* Info rows */}
        <div className="px-8 py-2">
          <InfoRow label="Age" value={user.age} />
          <InfoRow label="Height" value={heightDisplay} />
          <InfoRow label="Weight" value={user.weight ? `${user.weight} kg` : undefined} />
          <InfoRow label="Contact" value={user.contact} />
        </div>

        {/* Edit button */}
        <div className="px-8 py-6" style={{ borderTop: '1px solid #252730' }}>
          <Link
            href="/profile-setup"
            className="w-full inline-flex items-center justify-center px-6 py-3 rounded-[10px] text-[14px] font-medium transition-all"
            style={{
              background: '#1C1E28',
              color: '#EEEDF0',
              border: '1px solid #252730',
            }}
          >
            Edit profile
          </Link>
        </div>
      </div>
    </main>
  );
}

