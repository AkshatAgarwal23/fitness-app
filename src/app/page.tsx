'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Dumbbell, Zap, TrendingUp, Trophy, ArrowDown } from 'lucide-react';
import { useIsMobile } from './hooks/useIsMobile';

const FEATURES = [
  {
    Icon: Dumbbell,
    title: 'Adaptive workouts',
    desc: "Every day's plan adjusts based on your history, streak, and rest. Push when you're ready, recover when you need it.",
  },
  {
    Icon: Zap,
    title: 'Streak & consistency',
    desc: 'Animated streak bars show your intensity day by day. See exactly when you trained hard and when you rested.',
  },
  {
    Icon: TrendingUp,
    title: 'BMI & weight tracker',
    desc: 'Animated BMI ring updates as your stats change. Log your weight daily and watch the trend line build over time.',
  },
  {
    Icon: Trophy,
    title: 'Achievements',
    desc: 'Unlock badges as you hit milestones — first workout, 3-day streak, 10 sessions, and more waiting to be earned.',
  },
];

const TICKER_ITEMS = [
  'Adaptive workouts', 'Streak tracking', 'Achievements',
  'BMI ring', 'Weight logger', 'Weekly summary', 'Daily tips', 'Workout timer',
];

// Deterministic pseudo-random so server and client render identical stars
function seeded(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const STARS = Array.from({ length: 34 }, (_, i) => ({
  left: +(seeded(i, 1) * 100).toFixed(4),
  top: +(seeded(i, 2) * 100).toFixed(4),
  size: +(1 + seeded(i, 3) * 1.6).toFixed(4),
  driftDuration: +(60 + seeded(i, 4) * 80).toFixed(4),
  twinkleDuration: +(2.5 + seeded(i, 5) * 4).toFixed(4),
  delay: +(-(seeded(i, 6) * 140)).toFixed(4),
  green: seeded(i, 7) > 0.75,
}));

function FeatureCard({ Icon, title, desc }: { Icon: typeof Dumbbell; title: string; desc: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '28px 28px',
        borderRadius: 16,
        background: hovered ? 'rgba(var(--accent-rgb),0.06)' : 'var(--card-bg)',
        border: `1px solid ${hovered ? 'rgba(var(--accent-rgb),0.25)' : 'var(--card-border)'}`,
        boxShadow: hovered ? '0 0 24px rgba(var(--accent-rgb),0.18), 0 0 60px rgba(var(--accent-rgb),0.08)' : 'none',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: 'all 0.25s ease',
        cursor: 'default',
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 11, marginBottom: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(var(--accent-rgb),0.1)', border: '1px solid rgba(var(--accent-rgb),0.2)',
      }}>
        <Icon size={19} strokeWidth={1.8} color="var(--accent)" />
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
        {title}
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
        {desc}
      </p>
    </div>
  );
}

export default function LandingPage() {
  const [loginHover, setLoginHover] = useState(false);
  const [bottomHover, setBottomHover] = useState(false);
  const isMobile = useIsMobile();

  return (
    <main style={{ minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Aurora waves — fixed so they persist on scroll */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-40%', left: '-20%', width: '80%', height: '70%', background: 'radial-gradient(ellipse 90% 80% at 35% 100%, rgba(var(--aurora-green-rgb),0.22) 0%, rgba(var(--aurora-green2-rgb),0.08) 50%, transparent 100%)', filter: 'blur(80px)', borderRadius: '60% 40% 55% 45% / 55% 45% 55% 45%', animation: 'aurora1 17s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-35%', right: '-25%', width: '70%', height: '60%', background: 'radial-gradient(ellipse 90% 80% at 65% 100%, rgba(var(--aurora-blue-rgb),0.18) 0%, rgba(var(--aurora-blue2-rgb),0.07) 50%, transparent 100%)', filter: 'blur(90px)', borderRadius: '45% 55% 35% 65% / 50% 45% 55% 50%', animation: 'aurora2 22s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-25%', left: '15%', width: '65%', height: '45%', background: 'radial-gradient(ellipse at 50% 100%, rgba(var(--aurora-cyan-rgb),0.12) 0%, rgba(var(--aurora-cyan2-rgb),0.05) 55%, transparent 100%)', filter: 'blur(85px)', borderRadius: '50% 50% 45% 55% / 45% 55% 50% 50%', animation: 'aurora3 26s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-30%', left: '35%', width: '50%', height: '50%', background: 'radial-gradient(ellipse 80% 70% at 50% 100%, rgba(var(--aurora-green-rgb),0.08) 0%, rgba(var(--aurora-blue-rgb),0.05) 60%, transparent 100%)', filter: 'blur(100px)', borderRadius: '55% 45% 60% 40% / 50% 55% 45% 50%', animation: 'aurora4 31s ease-in-out infinite' }} />

        {/* Star field — slow upward drift + twinkle */}
        {STARS.map((s, i) => (
          <div
          
            key={i}
            style={{
              position: 'absolute',
              left: `${s.left}%`,
              top: `${s.top}%`,
              animation: `starDrift ${s.driftDuration}s linear infinite`,
              animationDelay: `${s.delay}s`,
            }}
          >
            <div style={{
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: s.green ? 'rgba(var(--accent-rgb),0.9)' : 'rgba(238,237,240,0.85)',
              boxShadow: s.green ? '0 0 6px rgba(var(--accent-rgb),0.6)' : '0 0 4px rgba(238,237,240,0.4)',
              animation: `starTwinkle ${s.twinkleDuration}s ease-in-out infinite`,
              animationDelay: `${s.delay}s`,
            }} />
          </div>
        ))}
      </div>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', position: 'relative', zIndex: 1 }}>

        {/* Glow orb */}
        <div style={{
          position: 'absolute', pointerEvents: 'none',
          width: 640, height: 640,
          background: 'radial-gradient(circle, rgba(var(--accent-rgb),0.15) 0%, rgba(var(--accent-rgb),0.04) 50%, transparent 70%)',
          filter: 'blur(90px)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
        }} />

        {/* Animated concentric rings — desktop only (too large for mobile) */}
        {!isMobile && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateY(-8%)', pointerEvents: 'none' }}>
            {[
              { size: 700, border: 'rgba(var(--accent-rgb),0.07)', duration: '7s',  delay: '0s'   },
              { size: 520, border: 'rgba(var(--accent-rgb),0.10)', duration: '5.5s', delay: '-2s'  },
              { size: 350, border: 'rgba(var(--accent-rgb),0.14)', duration: '4s',  delay: '-1s'  },
            ].map(({ size, border, duration, delay }, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: size, height: size, borderRadius: '50%',
                border: `1px solid ${border}`,
                animation: `ringBreath ${duration} ease-in-out infinite`,
                animationDelay: delay,
              }} />
            ))}
          </div>
        )}

        {/* Hero content */}
        <div className="fade-up" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 36, maxWidth: 580 }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 16px', borderRadius: 999,
            background: 'rgba(var(--accent-rgb),0.08)', border: '1px solid rgba(var(--accent-rgb),0.2)',
            color: 'var(--accent)', fontSize: 11, fontWeight: 500,
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px rgba(var(--accent-rgb),1)', display: 'inline-block' }} />
            Built for consistency
          </div>

          {/* Heading + tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <h1 style={{ fontSize: isMobile ? 68 : 104, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--text)', margin: 0 }}>
              Forma
            </h1>
            <p style={{ fontSize: isMobile ? 16 : 18, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 380, margin: 0 }}>
              Your body. Your pace.{' '}
              <span style={{ color: 'var(--text)' }}>Your form.</span>
            </p>
          </div>

          {/* CTA */}
          <Link
            href="/login"
            onMouseEnter={() => setLoginHover(true)}
            onMouseLeave={() => setLoginHover(false)}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '13px 44px', borderRadius: 10,
              background: 'var(--accent)', color: '#fff',
              fontSize: 14, fontWeight: 500, textDecoration: 'none',
              boxShadow: loginHover
                ? '0 0 50px rgba(var(--accent-rgb),0.65), 0 0 100px rgba(var(--accent-rgb),0.25)'
                : '0 0 30px rgba(var(--accent-rgb),0.4),  0 0  70px rgba(var(--accent-rgb),0.15)',
              transform: loginHover ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 0.22s ease',
            }}
          >
            Log in
          </Link>

          {/* Scroll hint */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.75 }}>{"What's inside"}</span>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(var(--accent-rgb),0.35)',
              background: 'rgba(var(--accent-rgb),0.08)',
              animation: 'arrowBounce 2s ease-in-out infinite',
            }}>
              <ArrowDown size={15} color="var(--accent)" strokeWidth={2} />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '80px 24px 100px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56 }}>

          {/* Section header */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>
              Everything you need
            </p>
            <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.03em', margin: '0 0 14px', lineHeight: 1.15 }}>
              Built to keep you moving
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto', lineHeight: 1.7 }}>
              Smart planning, honest tracking, and just enough motivation to make consistency feel natural.
            </p>
          </div>

          {/* Feature cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 14, width: '100%' }}>
            {FEATURES.map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>

          {/* Ticker */}
          <div style={{ width: '100%', overflow: 'hidden', maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)' }}>
            <div style={{ display: 'flex', gap: 0, animation: 'scrollLeft 28s linear infinite', width: 'max-content' }}>
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 0, whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 28px' }}>
                    {item}
                  </span>
                  <span style={{ color: 'var(--border)', fontSize: 10 }}>·</span>
                </span>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, transparent, rgba(var(--accent-rgb),0.3), transparent)' }} />
            <p style={{ fontSize: 26, fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.025em', margin: 0 }}>
              Ready to start?
            </p>
            <Link
              href="/signup"
              onMouseEnter={() => setBottomHover(true)}
              onMouseLeave={() => setBottomHover(false)}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: '13px 44px', borderRadius: 10,
                background: 'var(--accent)', color: '#fff',
                fontSize: 14, fontWeight: 500, textDecoration: 'none',
                boxShadow: bottomHover
                  ? '0 0 50px rgba(var(--accent-rgb),0.55)'
                  : '0 0 28px rgba(var(--accent-rgb),0.3)',
                transform: bottomHover ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'all 0.22s ease',
              }}
            >
              Create your profile
            </Link>
          </div>

        </div>
      </section>

    </main>
  );
}
