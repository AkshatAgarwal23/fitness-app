'use client';

import Link from 'next/link';
import { useState } from 'react';
import Avatar from './Avatar';

interface NavbarProps {
  userName?: string;
  onMenuOpen?: () => void;
}

function MenuButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  // Bars rest at staggered widths, then snap full, spread apart and tint on hover
  const bars = [
    { width: 20, hoverWidth: 20, delay: 0 },
    { width: 14, hoverWidth: 20, delay: 40 },
    { width: 17, hoverWidth: 20, delay: 80 },
  ];
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Open menu"
      style={{
        background: hovered ? 'rgba(var(--accent-rgb),0.08)' : 'none',
        border: 'none', cursor: 'pointer', padding: 9, marginLeft: 4,
        borderRadius: 9,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
        gap: hovered ? 5.5 : 4,
        transition: 'gap 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease',
      }}
    >
      {bars.map((b, i) => (
        <span key={i} style={{
          display: 'block', height: 2, borderRadius: 2,
          width: hovered ? b.hoverWidth : b.width,
          background: hovered ? 'var(--accent)' : 'var(--text-secondary)',
          boxShadow: hovered ? '0 0 6px rgba(var(--accent-rgb),0.5)' : 'none',
          transition: `width 0.25s cubic-bezier(0.34,1.56,0.64,1) ${b.delay}ms, background 0.2s ease, box-shadow 0.2s ease`,
        }} />
      ))}
    </button>
  );
}

export default function Navbar({ userName = '', onMenuOpen }: NavbarProps) {
  return (
    <nav
      style={{
        width: '100%',
        padding: '0 20px',
        background: 'rgba(var(--bg-rgb),0.88)',
        borderBottom: '1px solid rgba(var(--fg-rgb),0.06)',
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
            color: 'var(--text)',
            lineHeight: 1,
          }}>
            Forma
          </span>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--accent)',
            boxShadow: '0 0 10px 2px rgba(var(--accent-rgb),0.9)',
            display: 'inline-block',
            marginTop: 6,
            flexShrink: 0,
          }} />
        </Link>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

          {/* Avatar */}
          {userName && (
            <Link href="/profile" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <Avatar name={userName} size={38} />
            </Link>
          )}

          {/* Hamburger — only shown on dashboard */}
          {onMenuOpen && <MenuButton onClick={onMenuOpen} />}
        </div>
      </div>
    </nav>
  );
}
