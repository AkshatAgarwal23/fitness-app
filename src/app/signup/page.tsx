'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '../components/Input';
import Button from '../components/Button';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setServerError('');
  }

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'At least 6 characters';
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.message || 'Something went wrong.');
        return;
      }
      router.push('/profile-setup');
    } catch {
      setServerError('Could not connect to the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(var(--accent-rgb),0.15) 0%, transparent 70%)' }}
      />

      <div
        className="relative w-full max-w-[420px] rounded-[16px] p-8 flex flex-col gap-7"
        style={{
          background: 'rgba(var(--surface-rgb),0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(var(--fg-rgb),0.07)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(var(--fg-rgb),0.05)',
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <span
            className="text-[22px] font-medium tracking-[-0.02em]"
            style={{ color: 'var(--text)' }}
          >
            Forma
          </span>
          <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
            Create your account to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="Full name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            error={errors.name}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            error={errors.email}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            error={errors.password}
          />

          {serverError && (
            <p className="text-[13px] text-[#E24B4A]">{serverError}</p>
          )}

          <Button type="submit" variant="accent" fullWidth loading={loading} className="mt-1">
            Create account
          </Button>
        </form>

        <div
          className="h-px w-full"
          style={{ background: 'var(--border)' }}
        />

        <p className="text-[13px] text-center" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--accent)] hover:text-[var(--accent-2)] transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

