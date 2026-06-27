'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { ArrowLeft, Mail, MailCheck } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { useForgotPassword } from '@/hooks/useAuth';

// ─── Validation ───────────────────────────────────────────────────────────────

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
type ForgotForm = z.infer<typeof schema>;

// ─── Animation variants ───────────────────────────────────────────────────────

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.33, ease: 'easeOut' as const } },
};

// ─── Success state ────────────────────────────────────────────────────────────

function SuccessCard({ email }: { email: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="text-center"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
        <MailCheck className="h-8 w-8 text-blue-600" aria-hidden="true" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-slate-900">Check your inbox</h2>
      <p className="mb-1 text-sm text-slate-500">
        We sent a reset link to
      </p>
      <p className="mb-6 text-sm font-semibold text-slate-800 break-all">{email}</p>
      <p className="mb-8 text-xs text-slate-400">
        Didn&apos;t receive it? Check your spam folder or{' '}
        <button
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:underline font-medium"
        >
          try again
        </button>
        .
      </p>
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to login
      </Link>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading, error, success, setError } = useForgotPassword();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotForm>({ resolver: zodResolver(schema) });

  const onSubmit = (data: ForgotForm) => forgotPassword(data.email);

  return (
    <AnimatePresence mode="wait">
      {success ? (
        <SuccessCard key="success" email={getValues('email')} />
      ) : (
        <motion.div key="form" variants={container} initial="hidden" animate="show">

          {/* Back link */}
          <motion.div variants={item}>
            <Link
              href="/login"
              className="mb-8 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to login
            </Link>
          </motion.div>

          {/* Heading */}
          <motion.div variants={item} className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Forgot your password?
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              No worries — enter your email and we&apos;ll send you a reset link.
            </p>
          </motion.div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
            aria-label="Forgot password form"
          >
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
              <FormAlert type="error" message={error} onDismiss={() => setError('')} />
            </motion.div>

            <motion.div variants={item}>
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full h-11 text-base"
                aria-label="Send reset link"
              >
                Send Reset Link
              </Button>
            </motion.div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
