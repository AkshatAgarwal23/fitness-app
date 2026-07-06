type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese';

function getCategory(bmi: number | null): BMICategory {
  if (!bmi) return 'normal';
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

// shoulder width, torso width (SVG units, viewBox is 64 wide, center=32)
const SHAPES: Record<BMICategory, { sw: number; tw: number }> = {
  underweight: { sw: 16, tw: 10 },
  normal:      { sw: 24, tw: 18 },
  overweight:  { sw: 34, tw: 28 },
  obese:       { sw: 44, tw: 38 },
};

const LABELS: Record<BMICategory, string> = {
  underweight: 'Underweight',
  normal:      'Normal',
  overweight:  'Overweight',
  obese:       'Obese',
};

const CX = 32;

export default function PixelFigure({ bmi }: { bmi: number | null }) {
  const cat = getCategory(bmi);
  const { sw, tw } = SHAPES[cat];
  const legW = Math.max(4, Math.floor((tw - 6) / 2));

  return (
    <div title={bmi ? `BMI ${Math.round(bmi * 10) / 10} · ${LABELS[cat]}` : 'Profile'}>
      <svg
        viewBox="0 0 64 88"
        width="26"
        height="34"
        style={{ imageRendering: 'pixelated', display: 'block' }}
      >
        <defs>
          <filter id="figGlow" x="-40%" y="-20%" width="180%" height="140%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g fill="rgba(29,158,117,0.88)" filter="url(#figGlow)">
          {/* Head */}
          <rect x={CX - 12} y={0}  width={24} height={20} />
          {/* Neck */}
          <rect x={CX - 4}  y={20} width={8}  height={4}  />
          {/* Shoulders */}
          <rect x={CX - sw / 2} y={24} width={sw} height={8} />
          {/* Torso */}
          <rect x={CX - tw / 2} y={32} width={tw} height={20} />
          {/* Hips */}
          <rect x={CX - tw / 2} y={52} width={tw} height={8} />
          {/* Left leg */}
          <rect x={CX - tw / 2}          y={60} width={legW} height={28} />
          {/* Right leg */}
          <rect x={CX - tw / 2 + legW + 6} y={60} width={legW} height={28} />
        </g>
      </svg>
    </div>
  );
}
