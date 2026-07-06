interface BMIBadgeProps {
  bmi: number | null;
}

function getCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export default function BMIBadge({ bmi }: BMIBadgeProps) {
  if (bmi === null || isNaN(bmi) || !isFinite(bmi)) return null;

  const rounded = Math.round(bmi * 10) / 10;
  const category = getCategory(rounded);

  return (
    <span
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-medium"
      style={{
        background: 'rgba(29, 158, 117, 0.12)',
        color: '#1D9E75',
        border: '1px solid rgba(29, 158, 117, 0.25)',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: '#1D9E75', boxShadow: '0 0 6px rgba(29,158,117,0.8)' }}
      />
      BMI {rounded} · {category}
    </span>
  );
}
