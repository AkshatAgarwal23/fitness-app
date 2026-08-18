'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { X, LayoutDashboard, Home, User, Settings, DoorOpen, DoorClosed, ClipboardList, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';

const NAV_ROUTES = ['/dashboard', '/settings', '/profile', '/progress', '/achievements'];

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function PanelLink({
  href, label, onClose, renderIcon, active,
}: {
  href: string;
  label: string;
  onClose: () => void;
  renderIcon: (hovered: boolean) => React.ReactNode;
  active: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={href} onClick={onClose} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 24px', textDecoration: 'none',
      color: active ? 'var(--accent)' : 'var(--text)',
      fontSize: 15, position: 'relative',
      background: active
        ? 'rgba(var(--accent-rgb),0.08)'
        : hovered ? 'rgba(var(--fg-rgb),0.04)' : 'transparent',
      transition: 'background 0.15s, color 0.15s',
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Active indicator bar on the left */}
      {active && (
        <div style={{
          position: 'absolute', left: 0, top: '20%', bottom: '20%',
          width: 3, borderRadius: '0 3px 3px 0',
          background: 'var(--accent)',
          boxShadow: '0 0 8px rgba(var(--accent-rgb),0.6)',
        }} />
      )}
      {renderIcon(hovered || active)}
      {label}
    </Link>
  );
}

export default function SidePanel({ isOpen, onClose }: SidePanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [logoutHovered, setLogoutHovered] = useState(false);

  // Prefetch all routes the moment the panel opens so clicking feels instant
  useEffect(() => {
    if (isOpen) {
      NAV_ROUTES.forEach(route => router.prefetch(route));
    }
  }, [isOpen, router]);

  async function handleLogout() {
    await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    router.push('/');
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 260,
        background: 'rgba(var(--surface-rgb),0.97)',
        borderLeft: '1px solid rgba(var(--fg-rgb),0.08)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        zIndex: 101,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.18s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 20px 24px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', padding: 4, display: 'flex', alignItems: 'center',
            }}
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* Home — the dashboard grid assembles itself into a house */}
          <PanelLink href="/dashboard" label="Home" onClose={onClose} active={pathname === '/dashboard'} renderIcon={hovered => (
            <span style={{ position: 'relative', width: 18, height: 18, display: 'inline-block', flexShrink: 0 }}>
              <LayoutDashboard size={18} strokeWidth={1.8} color="var(--text-secondary)" style={{
                position: 'absolute', inset: 0,
                opacity: hovered ? 0 : 1,
                transform: hovered ? 'scale(0.7) rotate(-14deg)' : 'scale(1) rotate(0deg)',
                transition: 'opacity 0.35s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)',
              }} />
              <Home size={18} strokeWidth={1.8} color="var(--accent)" style={{
                position: 'absolute', inset: 0,
                opacity: hovered ? 1 : 0,
                transform: hovered ? 'scale(1) rotate(0deg)' : 'scale(0.7) rotate(14deg)',
                transition: 'opacity 0.35s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)',
              }} />
            </span>
          )} />

          {/* Settings — the gear rolls in place like a wheel */}
          <PanelLink href="/settings" label="Settings" onClose={onClose} active={pathname === '/settings'} renderIcon={hovered => (
            <Settings size={18} strokeWidth={1.8} color={hovered ? 'var(--accent)' : 'var(--text-secondary)'} style={{
              flexShrink: 0,
              transform: hovered ? 'rotate(360deg)' : 'rotate(0deg)',
              transition: 'transform 1s cubic-bezier(0.22,1,0.36,1), color 0.3s ease',
            }} />
          )} />

          {/* My profile — he straightens up his outfit like a gentleman.
              key remounts the icon on hover so the animation always replays */}
          <PanelLink href="/profile" label="My profile" onClose={onClose} active={pathname === '/profile'} renderIcon={hovered => (
            <User key={hovered ? 'tidy' : 'idle'} size={18} strokeWidth={1.8}
              color={hovered ? 'var(--accent)' : 'var(--text-secondary)'} style={{
              flexShrink: 0,
              transformOrigin: '50% 85%',
              animation: hovered ? 'gentleman 0.9s both' : 'none',
              transition: 'color 0.3s ease',
            }} />
          )} />

          {/* Progress log — clipboard fades out, checkmark draws itself on hover */}
          <PanelLink href="/progress" label="Progress log" onClose={onClose} active={pathname === '/progress'} renderIcon={hovered => (
            <span style={{ position: 'relative', width: 18, height: 18, display: 'inline-block', flexShrink: 0 }}>
              <ClipboardList size={18} strokeWidth={1.8} color="var(--text-secondary)" style={{
                position: 'absolute', inset: 0,
                opacity: hovered ? 0 : 1,
                transform: hovered ? 'scale(0.8)' : 'scale(1)',
                transition: 'opacity 0.2s ease, transform 0.25s ease',
              }} />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                style={{ position: 'absolute', inset: 0, opacity: hovered ? 1 : 0, transition: 'opacity 0.2s ease' }}>
                <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="1.8"
                  style={{
                    strokeDasharray: 63,
                    strokeDashoffset: hovered ? 0 : 63,
                    transition: 'stroke-dashoffset 0.38s cubic-bezier(0.22,1,0.36,1)',
                  } as React.CSSProperties}
                />
                <path d="M7.5 12l3 3L17 8.5" stroke="var(--accent)" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{
                    strokeDasharray: 14,
                    strokeDashoffset: hovered ? 0 : 14,
                    transition: 'stroke-dashoffset 0.3s cubic-bezier(0.22,1,0.36,1) 0.22s',
                  } as React.CSSProperties}
                />
              </svg>
            </span>
          )} />

          {/* Achievements — flakes burst from the trophy on hover */}
          <PanelLink href="/achievements" label="Achievements" onClose={onClose} active={pathname === '/achievements'} renderIcon={hovered => (
            // Outer span is 48×48 centred on the 18×18 icon so particles
            // aren't clipped when they travel outward
            <span style={{
              position: 'relative', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center',
              width: 48, height: 48,
              margin: '-15px',
              flexShrink: 0, overflow: 'visible',
            }}>
              <Trophy size={18} strokeWidth={1.8}
                color={hovered ? 'var(--accent)' : 'var(--text-secondary)'}
                style={{
                  transform: hovered ? 'scale(1.2)' : 'scale(1)',
                  transition: 'color 0.3s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1)',
                  flexShrink: 0,
                  zIndex: 1,
                }}
              />
              {[
                { anim: 'tp-up',    delay: 0,    size: 5, round: true  },
                { anim: 'tp-up2',   delay: 0.05, size: 4, round: false },
                { anim: 'tp-ul',    delay: 0.03, size: 5, round: false },
                { anim: 'tp-ur',    delay: 0.03, size: 5, round: false },
                { anim: 'tp-ul2',   delay: 0.08, size: 4, round: true  },
                { anim: 'tp-ur2',   delay: 0.08, size: 4, round: true  },
                { anim: 'tp-left',  delay: 0.06, size: 4, round: true  },
                { anim: 'tp-right', delay: 0.06, size: 4, round: true  },
                { anim: 'tp-ul',    delay: 0.13, size: 3, round: false },
                { anim: 'tp-ur',    delay: 0.13, size: 3, round: false },
              ].map((p, i) => (
                <span key={i} style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  width: p.size, height: p.size,
                  marginTop: -p.size / 2, marginLeft: -p.size / 2,
                  borderRadius: p.round ? '50%' : '1px',
                  background: i % 3 === 0 ? 'var(--accent)' : i % 3 === 1 ? '#6ee7c7' : '#fff',
                  transform: 'rotate(45deg)',
                  animation: hovered
                    ? `${p.anim} 0.65s cubic-bezier(0.15,0.8,0.3,1) ${p.delay}s both`
                    : 'none',
                  pointerEvents: 'none',
                }} />
              ))}
            </span>
          )} />
        </nav>

        {/* Divider + Log out */}
        <div style={{ borderTop: '1px solid rgba(var(--fg-rgb),0.06)', paddingTop: 12 }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 24px', border: 'none',
              cursor: 'pointer', color: '#E24B4A', fontSize: 15, textAlign: 'left',
              background: logoutHovered ? 'rgba(226,75,74,0.06)' : 'transparent',
              transition: 'background 0.15s',
            }}
            onMouseEnter={() => setLogoutHovered(true)}
            onMouseLeave={() => setLogoutHovered(false)}
          >
            {/* The open door swings shut on hover */}
            <span style={{ position: 'relative', width: 18, height: 18, display: 'inline-block', flexShrink: 0 }}>
              <DoorOpen size={18} strokeWidth={1.8} style={{
                position: 'absolute', inset: 0,
                opacity: logoutHovered ? 0 : 1,
                transform: logoutHovered ? 'scaleX(0.75)' : 'scaleX(1)',
                transformOrigin: '20% 50%',
                transition: 'opacity 0.4s cubic-bezier(0.22,1,0.36,1) 0.05s, transform 0.45s cubic-bezier(0.22,1,0.36,1)',
              }} />
              <DoorClosed size={18} strokeWidth={1.8} style={{
                position: 'absolute', inset: 0,
                opacity: logoutHovered ? 1 : 0,
                transform: logoutHovered ? 'scaleX(1)' : 'scaleX(0.85)',
                transformOrigin: '20% 50%',
                transition: 'opacity 0.4s cubic-bezier(0.22,1,0.36,1) 0.1s, transform 0.45s cubic-bezier(0.22,1,0.36,1) 0.1s',
              }} />
            </span>
            Log out
          </button>
        </div>
      </div>
      <style>{`
        @keyframes tp-up    { 0% { transform: translate(0,0) scale(1.2); opacity:1; } 100% { transform: translate(0,-28px) scale(0); opacity:0; } }
        @keyframes tp-up2   { 0% { transform: translate(0,0) scale(1.2); opacity:1; } 100% { transform: translate(4px,-24px) scale(0); opacity:0; } }
        @keyframes tp-ul    { 0% { transform: translate(0,0) scale(1.2); opacity:1; } 100% { transform: translate(-22px,-20px) scale(0); opacity:0; } }
        @keyframes tp-ur    { 0% { transform: translate(0,0) scale(1.2); opacity:1; } 100% { transform: translate(22px,-20px) scale(0); opacity:0; } }
        @keyframes tp-left  { 0% { transform: translate(0,0) scale(1.2); opacity:1; } 100% { transform: translate(-26px,-4px) scale(0); opacity:0; } }
        @keyframes tp-right { 0% { transform: translate(0,0) scale(1.2); opacity:1; } 100% { transform: translate(26px,-4px) scale(0); opacity:0; } }
        @keyframes tp-ul2   { 0% { transform: translate(0,0) scale(1.2); opacity:1; } 100% { transform: translate(-14px,-26px) scale(0); opacity:0; } }
        @keyframes tp-ur2   { 0% { transform: translate(0,0) scale(1.2); opacity:1; } 100% { transform: translate(14px,-26px) scale(0); opacity:0; } }
      `}</style>
    </>
  );
}
