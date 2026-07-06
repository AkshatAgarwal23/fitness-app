import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">

      {/* Blurred teal glow orb — the main visual element */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 520,
          height: 520,
          background: 'radial-gradient(circle, rgba(29,158,117,0.28) 0%, rgba(29,158,117,0.08) 50%, transparent 70%)',
          filter: 'blur(72px)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -58%)',
        }}
      />

      {/* Concentric decorative rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: 'translateY(-8%)' }}>
        {[680, 500, 340].map((size, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              border: `1px solid rgba(29, 158, 117, ${0.07 - i * 0.02})`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center text-center gap-10 max-w-xl fade-up">

        {/* Pill badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 16px',
            borderRadius: 999,
            background: 'rgba(29,158,117,0.08)',
            border: '1px solid rgba(29,158,117,0.2)',
            color: '#1D9E75',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#1D9E75',
              boxShadow: '0 0 8px rgba(29,158,117,1)',
              display: 'inline-block',
            }}
          />
          Your fitness journey starts here
        </div>

        {/* Hero heading */}
        <div className="flex flex-col items-center gap-5">
          <h1
            style={{
              fontSize: 96,
              fontWeight: 500,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              color: '#EEEDF0',
            }}
          >
            Forma
          </h1>
          <p style={{ fontSize: 19, color: '#7B7D8E', lineHeight: 1.6, maxWidth: 380 }}>
            Your body. Your pace.{' '}
            <span style={{ color: '#EEEDF0' }}>Your form.</span>
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '13px 32px',
              borderRadius: 10,
              background: '#1D9E75',
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              boxShadow: '0 0 40px rgba(29,158,117,0.55), 0 0 80px rgba(29,158,117,0.2)',
              transition: 'all 0.2s',
            }}
          >
            Get started
          </Link>
          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '13px 32px',
              borderRadius: 10,
              background: 'rgba(28,30,40,0.7)',
              color: '#EEEDF0',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.2s',
            }}
          >
            Log in
          </Link>
        </div>

        {/* Feature tags */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {['BMI tracking', 'Fitness profile', 'Daily workouts'].map((f, i) => (
            <span
              key={i}
              style={{
                padding: '4px 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#4A4C5A',
                fontSize: 12,
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
