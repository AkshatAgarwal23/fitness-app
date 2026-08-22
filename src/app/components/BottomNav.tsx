'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, CheckCircle2, Trophy, User, Settings } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';

// Each tab carries its own signature icon animation (played on hover / when active).
const NAV_ITEMS = [
  { href: '/dashboard',    Icon: Home,          label: 'Home',     anim: 'navHome 0.6s ease'                      },
  { href: '/progress',     Icon: CheckCircle2,  label: 'Progress', anim: 'navProgress 0.55s ease-out' },
  { href: '/achievements', Icon: Trophy,         label: 'Awards',   anim: 'navTrophy 0.7s ease-in-out'             },
  { href: '/profile',      Icon: User,           label: 'Profile',  anim: 'gentleman 0.8s ease-in-out'             },
  { href: '/settings',     Icon: Settings,       label: 'Settings', anim: 'navSettings 0.7s cubic-bezier(0.5,0,0.2,1)' },
];

const SHOW_ON = new Set(['/dashboard', '/progress', '/achievements', '/profile', '/settings']);

function NavItem({ href, Icon, label, anim, active }: { href: string; Icon: typeof Home; label: string; anim: string; active: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
        padding: '12px 0 8px',
        textDecoration: 'none',
        color: active ? 'var(--accent)' : hovered ? 'var(--text-secondary)' : 'var(--text-muted)',
        transition: 'color 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* A-shape spotlight — a cone of green light falling on the active tab */}
      {active && (
        <span style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: 58,
          height: 52,
          transformOrigin: 'top center',
          transform: 'translateX(-50%)',
          clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)',
          background: 'linear-gradient(to bottom, rgba(var(--accent-rgb),0.55) 0%, rgba(var(--accent-rgb),0.16) 50%, rgba(var(--accent-rgb),0) 100%)',
          pointerEvents: 'none',
          animation: 'spotlightIn 0.42s cubic-bezier(0.16,1,0.3,1)',
        }} />
      )}

      <Icon
        size={22}
        strokeWidth={active ? 2 : 1.6}
        style={{
          filter: active ? 'drop-shadow(0 0 6px rgba(var(--accent-rgb),0.6))' : 'none',
          animation: (hovered || active) ? anim : 'none',
          transition: 'filter 0.2s ease',
        }}
      />
      <span style={{
        fontSize: 10,
        fontWeight: active ? 600 : 400,
        letterSpacing: '0.02em',
        transition: 'font-weight 0.2s ease',
      }}>
        {label}
      </span>
    </Link>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  if (!isMobile || !SHOW_ON.has(pathname)) return null;

  return (
    <nav className="bottom-nav" style={{
      bottom: 0, left: 0, right: 0,
      zIndex: 100,
      background: 'rgba(var(--bg-rgb), 0.82)',
      backdropFilter: 'blur(28px)',
      WebkitBackdropFilter: 'blur(28px)',
      borderTop: '1px solid rgba(var(--fg-rgb), 0.08)',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {NAV_ITEMS.map(({ href, Icon, label, anim }) => (
        <NavItem
          key={href}
          href={href}
          Icon={Icon}
          label={label}
          anim={anim}
          active={pathname === href}
        />
      ))}
    </nav>
  );
}
