'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
}

interface StrengthLevel {
  label: string;
  color: string;
  textColor: string;
}

const levels: StrengthLevel[] = [
  { label: 'Very weak',   color: 'bg-red-500',      textColor: 'text-red-600'    },
  { label: 'Weak',        color: 'bg-orange-500',   textColor: 'text-orange-600' },
  { label: 'Fair',        color: 'bg-yellow-500',   textColor: 'text-yellow-600' },
  { label: 'Good',        color: 'bg-lime-500',     textColor: 'text-lime-600'   },
  { label: 'Strong',      color: 'bg-green-500',    textColor: 'text-green-600'  },
];

function calcScore(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8)            s++;
  if (pw.length >= 12)           s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^A-Za-z0-9]/.test(pw))  s++;
  // clamp to [1, 5] when non-empty
  return Math.min(Math.max(s, 1), 5);
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const score = useMemo(() => calcScore(password), [password]);
  const level = levels[score - 1];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5" aria-live="polite" aria-label={`Password strength: ${level.label}`}>
      {/* Bar segments */}
      <div className="flex gap-1" role="presentation">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i < score ? level.color : 'bg-slate-200'
            )}
          />
        ))}
      </div>

      {/* Label */}
      <p className="text-xs text-slate-500">
        Strength:{' '}
        <span className={cn('font-semibold', level.textColor)}>{level.label}</span>
      </p>
    </div>
  );
}
