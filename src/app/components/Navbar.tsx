'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import Avatar from './Avatar';
import PixelFigure from './PixelFigure';

interface NavbarProps {
  userName?: string;
  userBmi?: number | null;
}

export default function Navbar({ userName = '', userBmi = null }: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    router.push('/');
  }

  return (
    <nav
      style={{
        width: '100%',
        padding: '0 20px',
        background: 'rgba(10,11,15,0.88)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '100%',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 68,
        }}
      >
        {/* Logo */}
        <Link
          href="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
          }}
        >
          <span style={{
            fontSize: 36,
            fontWeight: 500,
            letterSpacing: '-0.05em',
            color: '#EEEDF0',
            lineHeight: 1,
          }}>
            Forma
          </span>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#1D9E75',
            boxShadow: '0 0 10px 2px rgba(29,158,117,0.9)',
            display: 'inline-block',
            marginTop: 6,
            flexShrink: 0,
          }} />
        </Link>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

          {/* Pixel figure — links to profile, shows body shape based on BMI */}
          <Link
            href="/profile"
            title="View profile"
            style={{
              display: 'inline-flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: '4px 14px 0',
              borderRadius: 10,
              background: 'rgba(29,158,117,0.06)',
              border: '1px solid rgba(29,158,117,0.15)',
              textDecoration: 'none',
              height: 48,
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(29,158,117,0.12)';
              e.currentTarget.style.borderColor = 'rgba(29,158,117,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(29,158,117,0.06)';
              e.currentTarget.style.borderColor = 'rgba(29,158,117,0.15)';
            }}
          >
            <PixelFigure bmi={userBmi} />
          </Link>

          {/* Log out button */}
          <button
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 18px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#9A9CAA',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(226,75,74,0.1)';
              e.currentTarget.style.borderColor = 'rgba(226,75,74,0.3)';
              e.currentTarget.style.color = '#E24B4A';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#9A9CAA';
            }}
          >
            <LogOut size={15} strokeWidth={1.8} />
            Log out
          </button>

          {/* Divider */}
          <div style={{
            width: 1, height: 24,
            background: 'rgba(255,255,255,0.08)',
            margin: '0 6px',
            flexShrink: 0,
          }} />

          {/* Avatar */}
          {userName && (
            <Link href="/profile" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <Avatar name={userName} size={38} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
