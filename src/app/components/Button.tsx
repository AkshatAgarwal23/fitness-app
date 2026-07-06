'use client';

import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'ghost' | 'accent';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[10px] text-[14px] font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<Variant, string> = {
    accent:
      'bg-[#1D9E75] text-white hover:bg-[#22b584]',
    primary:
      'bg-[#1C1E28] text-[#EEEDF0] border border-[#252730] hover:border-[#3a3c4a] hover:bg-[#22253A]',
    ghost:
      'text-[#7B7D8E] hover:text-[#EEEDF0] hover:bg-[#1C1E28]',
  };

  const accentGlow =
    variant === 'accent'
      ? 'shadow-[0_0_24px_rgba(29,158,117,0.35)]'
      : '';

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${accentGlow} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}
