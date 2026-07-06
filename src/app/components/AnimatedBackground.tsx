'use client';

// Elevation profile — one tile = 800px wide, 120px tall viewbox
// Points form a natural-looking rolling terrain (hill, descent, flat, climb, etc.)
const TILE = `M 0,90 C 60,88 100,70 160,55 C 220,40 260,30 320,28 C 380,26 400,45 440,60 C 480,75 500,80 540,65 C 580,50 620,20 680,15 C 720,12 760,30 800,90`;

function buildTerrain(): string {
  return Array.from({ length: 4 }, (_, i) =>
    TILE.replace(/(-?\d+(?:\.\d+)?),(\d+(?:\.\d+)?)/g, (_, x, y) =>
      `${parseFloat(x) + i * 800},${y}`
    )
  ).join(' ');
}

// Close the filled area below the terrain line
function buildFill(): string {
  const terrain = buildTerrain();
  return `${terrain} L 3200,120 L 0,120 Z`;
}

const terrainPath = buildTerrain();
const fillPath = buildFill();

export default function AnimatedBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>

      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(29,158,117,0.45) 1.5px, transparent 1.5px)',
        backgroundSize: '28px 28px',
        maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 40%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 40%, transparent 100%)',
      }} />

      {/* Orb 1 — large, top-left */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(29,158,117,0.18) 0%, rgba(29,158,117,0.05) 50%, transparent 70%)',
        filter: 'blur(80px)', top: '-150px', left: '-100px',
        animation: 'drift1 18s ease-in-out infinite',
      }} />

      {/* Orb 2 — medium, bottom-right */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(29,158,117,0.14) 0%, rgba(29,158,117,0.04) 50%, transparent 70%)',
        filter: 'blur(90px)', bottom: '-100px', right: '-80px',
        animation: 'drift2 22s ease-in-out infinite',
      }} />

      {/* Orb 3 — small, center-right */}
      <div style={{
        position: 'absolute', width: 340, height: 340, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(29,158,117,0.12) 0%, transparent 70%)',
        filter: 'blur(60px)', top: '40%', right: '20%',
        animation: 'drift3 14s ease-in-out infinite',
      }} />

      {/* Orb 4 — tiny, bottom-left */}
      <div style={{
        position: 'absolute', width: 250, height: 250, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(29,158,117,0.1) 0%, transparent 70%)',
        filter: 'blur(50px)', bottom: '15%', left: '10%',
        animation: 'drift1 26s ease-in-out infinite reverse',
      }} />

      {/* Elevation terrain */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        width: '200%',
        animation: 'scrollLeft 20s linear infinite',
      }}>
        <svg width="3200" height="120" viewBox="0 0 3200 120" preserveAspectRatio="none" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="terrainFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(29,158,117,0.12)" />
              <stop offset="100%" stopColor="rgba(29,158,117,0.03)" />
            </linearGradient>
            <linearGradient id="terrainFade" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="white" stopOpacity="0" />
              <stop offset="6%"   stopColor="white" stopOpacity="1" />
              <stop offset="94%"  stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <mask id="terrainMask">
              <rect width="3200" height="120" fill="url(#terrainFade)" />
            </mask>
            <filter id="terrainGlow" x="-5%" y="-80%" width="110%" height="260%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {/* Filled area under the line */}
          <path d={fillPath} fill="url(#terrainFill)" mask="url(#terrainMask)" />
          {/* Glowing line on top */}
          <path d={terrainPath} fill="none" stroke="rgba(29,158,117,0.3)" strokeWidth="3"
            mask="url(#terrainMask)" filter="url(#terrainGlow)" />
          <path d={terrainPath} fill="none" stroke="rgba(29,158,117,0.65)" strokeWidth="1.5"
            mask="url(#terrainMask)" />
        </svg>
      </div>

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
      }} />
    </div>
  );
}
