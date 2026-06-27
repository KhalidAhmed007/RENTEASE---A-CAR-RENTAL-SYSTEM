'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useWatch } from 'react-hook-form';
import { Lock, ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { useResetPassword } from '@/hooks/useAuth';

// ─── Validation ───────────────────────────────────────────────────────────────

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetForm = z.infer<typeof resetSchema>;

// ─── Animation variants ───────────────────────────────────────────────────────

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.33, ease: 'easeOut' as const } },
};

// ─── Invalid-token screen ─────────────────────────────────────────────────────

function InvalidToken() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="text-center"
      role="alert"
    >
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
        <AlertTriangle className="h-8 w-8 text-amber-600" aria-hidden="true" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Link expired or invalid</h1>
      <p className="mb-8 text-sm text-slate-500">
        This password reset link is no longer valid. Please request a new one.
      </p>
      <Link
        href="/forgot-password"
        className="inline-flex items-center justify-center h-11 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        Request a new link
      </Link>
    </motion.div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="text-center"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
        <ShieldCheck className="h-8 w-8 text-emerald-600" aria-hidden="true" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-slate-900">Password updated!</h2>
      <p className="mb-8 text-sm text-slate-500">
        Your password has been reset successfully. Redirecting you to login…
      </p>
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Go to login now
      </Link>
    </motion.div>
  );
}

// ─── Inner form (reads ?token= → needs Suspense) ─────────────────────────────

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { resetPassword, isLoading, error, success, setError } = useResetPassword();

  const { register, handleSubmit, control, formState: { errors } } =
    useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' });

  const onSubmit = (data: ResetForm) => {
    if (!token) return;
    resetPassword(token, data.password);
  };

  if (!token) return <InvalidToken />;

  return (
    <AnimatePresence mode="wait">
      {success ? (
        <SuccessCard key="success" />
      ) : (
        <motion.div key="form" variants={container} initial="hidden" animate="show">

          <motion.div variants={item}>
            <Link
              href="/login"
              className="mb-8 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to login
            </Link>
          </motion.div>

          <motion.div variants={item} className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Set a new password
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Choose a strong password you haven&apos;t used before.
            </p>
          </motion.div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
            aria-label="Reset password form"
          >
            <motion.div variants={item}>
              <Input
                label="New password"
                type="password"
                id="password"
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                autoComplete="new-password"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
              <PasswordStrength password={passwordValue} />
            </motion.div>

            <motion.div variants={item}>
              <Input
                label="Confirm new password"
                type="password"
                id="confirmPassword"
                placeholder="Re-enter your new password"
                autoComplete="new-password"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </motion.div>

            <motion.div variants={item}>
              <FormAlert type="error" message={error} onDismiss={() => setError('')} />
            </motion.div>

            <motion.div variants={item}>
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full h-11 text-base"
                aria-label="Reset password"
              >
                Reset Password
              </Button>
            </motion.div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-100" />}>
      <ResetForm />
    </Suspense>
  );
}
