'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CheckCircle2, Trophy, User, Settings } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';

const NAV_ITEMS = [
  { href: '/dashboard',    Icon: Home,          label: 'Home'     },
  { href: '/progress',     Icon: CheckCircle2,  label: 'Progress' },
  { href: '/achievements', Icon: Trophy,         label: 'Awards'   },
  { href: '/profile',      Icon: User,           label: 'Profile'  },
  { href: '/settings',     Icon: Settings,       label: 'Settings' },
];

const SHOW_ON = new Set(['/dashboard', '/progress', '/achievements', '/profile', '/settings']);

export default function BottomNav() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  if (!isMobile || !SHOW_ON.has(pathname)) return null;

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      zIndex: 100,
      background: 'rgba(var(--bg-rgb), 0.92)',
      backdropFilter: 'blur(28px)',
      WebkitBackdropFilter: 'blur(28px)',
      borderTop: '1px solid rgba(var(--fg-rgb), 0.08)',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {NAV_ITEMS.map(({ href, Icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '10px 0 8px',
              textDecoration: 'none',
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'color 0.18s ease',
              position: 'relative',
            }}
          >
            {/* Active indicator pill */}
            {active && (
              <span style={{
                position: 'absolute',
                top: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: 28, height: 2,
                borderRadius: '0 0 2px 2px',
                background: 'var(--accent)',
                boxShadow: '0 0 8px rgba(var(--accent-rgb), 0.7)',
              }} />
            )}
            <Icon
              size={22}
              strokeWidth={active ? 2 : 1.6}
              style={{ transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
            />
            <span style={{
              fontSize: 10,
              fontWeight: active ? 600 : 400,
              letterSpacing: '0.02em',
            }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
