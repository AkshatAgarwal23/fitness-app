'use client';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-[12px] font-medium tracking-wide text-[#7B7D8E] uppercase">
        {label}
      </label>
      <input
        id={inputId}
        className={`
          w-full px-4 py-3 rounded-[10px] text-[14px] text-[#EEEDF0]
          bg-[#1C1E28] placeholder-[#4A4C5A] outline-none
          border transition-all
          ${error
            ? 'border-[#E24B4A] focus:border-[#E24B4A]'
            : 'border-[#252730] focus:border-[#1D9E75] focus:shadow-[0_0_0_3px_rgba(29,158,117,0.12)]'
          }
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-[12px] text-[#E24B4A]">{error}</p>}
    </div>
  );
}
