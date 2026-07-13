'use client';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-[12px] font-medium tracking-wide text-[var(--text-secondary)] uppercase">
        {label}
      </label>
      <input
        id={inputId}
        className={`
          w-full px-4 py-3 rounded-[10px] text-[14px] text-[var(--text)]
          bg-[var(--surface-2)] placeholder-[var(--text-muted)] outline-none
          border transition-all
          ${error
            ? 'border-[#E24B4A] focus:border-[#E24B4A]'
            : 'border-[var(--border)] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(var(--accent-rgb),0.12)]'
          }
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-[12px] text-[#E24B4A]">{error}</p>}
    </div>
  );
}
