'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../components/Input';
import Button from '../components/Button';
import BMIBadge from '../components/BMIBadge';

function calcBMI(height: string, heightUnit: 'cm' | 'ft', weight: string): number | null {
  const h = parseFloat(height);
  const w = parseFloat(weight);
  if (!h || !w || h <= 0 || w <= 0) return null;
  const heightCm = heightUnit === 'ft' ? h * 30.48 : h;
  const heightM = heightCm / 100;
  return w / (heightM * heightM);
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [serverError, setServerError] = useState('');

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [contact, setContact] = useState('');
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weight, setWeight] = useState('');

  const bmi = calcBMI(height, heightUnit, weight);

  useEffect(() => {
    fetch('http://localhost:5000/api/profile', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) { router.replace('/login'); return null; }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setName(data.name || '');
          if (data.age) setAge(String(data.age));
          if (data.contact) setContact(data.contact);
          if (data.height) setHeight(String(data.height));
          if (data.heightUnit) setHeightUnit(data.heightUnit);
          if (data.weight) setWeight(String(data.weight));
        }
      })
      .catch(() => router.replace('/login'))
      .finally(() => setAuthChecking(false));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setServerError('');
    try {
      const res = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          age: age ? Number(age) : undefined,
          contact,
          height: height ? Number(height) : undefined,
          heightUnit,
          weight: weight ? Number(weight) : undefined,
          bmi: bmi !== null ? Math.round(bmi * 10) / 10 : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.message || 'Something went wrong.'); return; }
      router.push('/profile');
    } catch {
      setServerError('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  }

  if (authChecking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[14px]" style={{ color: '#4A4C5A' }}>Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(29,158,117,0.15) 0%, transparent 70%)' }}
      />

      <div
        className="relative w-full max-w-[500px] rounded-[16px] p-8 flex flex-col gap-7"
        style={{
          background: 'rgba(13,15,22,0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        <div>
          <h2 className="text-[20px] font-medium tracking-[-0.02em]" style={{ color: '#EEEDF0' }}>
            Set up your profile
          </h2>
          <p className="text-[13px] mt-1" style={{ color: '#7B7D8E' }}>
            Tell us about yourself so we can personalise your experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input label="Full name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <Input label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 25" min="1" max="120" />
          <Input label="Contact number" type="tel" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="e.g. +91 98765 43210" />

          {/* Height with toggle */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium tracking-wide uppercase" style={{ color: '#7B7D8E' }}>
                Height
              </label>
              <div className="flex gap-1">
                {(['cm', 'ft'] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setHeightUnit(unit)}
                    className="px-3 py-1 rounded-full text-[12px] font-medium transition-all cursor-pointer"
                    style={
                      heightUnit === unit
                        ? { background: '#1D9E75', color: '#fff' }
                        : { background: '#1C1E28', color: '#7B7D8E', border: '1px solid #252730' }
                    }
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder={heightUnit === 'cm' ? 'e.g. 175' : 'e.g. 5.9'}
              step={heightUnit === 'ft' ? '0.1' : '1'}
              min="0"
              className="w-full px-4 py-3 rounded-[10px] text-[14px] outline-none border transition-all"
              style={{
                background: '#1C1E28',
                color: '#EEEDF0',
                borderColor: '#252730',
              }}
            />
          </div>

          <Input label="Weight (kg)" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 70" step="0.1" min="0" />

          {/* Live BMI */}
          {bmi !== null && (
            <div className="flex flex-col gap-2">
              <p className="text-[12px] uppercase tracking-wide" style={{ color: '#4A4C5A' }}>Your BMI</p>
              <BMIBadge bmi={bmi} />
            </div>
          )}

          {serverError && <p className="text-[13px] text-[#E24B4A]">{serverError}</p>}

          <Button type="submit" variant="accent" fullWidth loading={loading}>
            Save profile
          </Button>
        </form>
      </div>
    </main>
  );
}

