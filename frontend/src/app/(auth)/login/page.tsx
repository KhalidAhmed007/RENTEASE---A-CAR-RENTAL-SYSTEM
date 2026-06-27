'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, type Variants } from 'framer-motion';
import { Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { useLogin } from '@/hooks/useAuth';

// ─── Validation ──────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type LoginForm = z.infer<typeof loginSchema>;

// ─── Animation variants ───────────────────────────────────────────────────────

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

// ─── Inner form (needs Suspense because it uses useSearchParams) ──────────────

function LoginForm() {
  const { login, isLoading, error, setError } = useLogin();
  const { register, handleSubmit, formState: { errors } } =
    useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';

  return (
    <motion.div variants={container} initial="hidden" animate="show">

      <motion.div variants={item} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sign in to access your account and bookings.
        </p>
      </motion.div>

      {/* Registration success banner */}
      {justRegistered && (
        <motion.div
          variants={item}
          className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="text-sm text-emerald-800">
            Account created successfully! Please sign in below.
          </p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(login)} className="space-y-5" noValidate aria-label="Login form">

        <motion.div variants={item}>
          <Input
            label="Email address"
            type="email"
            id="email"
            placeholder="you@example.com"
            autoComplete="email"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />
        </motion.div>

        <motion.div variants={item}>
          <Input
            label="Password"
            type="password"
            id="password"
            placeholder="Your password"
            autoComplete="current-password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            {...register('password')}
          />
        </motion.div>

        <motion.div variants={item} className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Forgot password?
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <FormAlert type="error" message={error} onDismiss={() => setError('')} />
        </motion.div>

        <motion.div variants={item}>
          <Button type="submit" isLoading={isLoading} className="w-full h-11 text-base gap-2">
            Sign In
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </motion.div>
      </form>

      <motion.div variants={item} className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs text-slate-400">
          <span className="bg-slate-50 px-3">New to RentEase?</span>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Link
          href="/signup"
          className="flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
        >
          Create an account
        </Link>
      </motion.div>
    </motion.div>
  );
}

// ─── Page (wraps form in Suspense for useSearchParams) ───────────────────────

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-100" />}>
      <LoginForm />
    </Suspense>
  );
}
