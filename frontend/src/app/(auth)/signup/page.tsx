'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, type Variants } from 'framer-motion';
import { useWatch } from 'react-hook-form';
import { User, Mail, Phone, CreditCard, Lock, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { useRegister } from '@/hooks/useAuth';

// ─── Validation schema ───────────────────────────────────────────────────────

const signupSchema = z
  .object({
    firstName:      z.string().min(2, 'First name must be at least 2 characters'),
    lastName:       z.string().min(2, 'Last name must be at least 2 characters'),
    email:          z.string().email('Please enter a valid email address'),
    phoneNumber:    z.string().min(7, 'Enter a valid phone number'),
    licenseNumber:  z.string().min(4, 'Enter a valid license number'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    terms: z.literal(true, {
      message: 'You must accept the terms to continue',
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupForm = z.infer<typeof signupSchema>;

// ─── Animation variants ───────────────────────────────────────────────────────

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' as const } },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const { register: registerUser, isLoading, error, setError } = useRegister();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  // Watch password for the strength meter
  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' });

  const onSubmit = (data: SignupForm) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, terms, ...payload } = data;
    registerUser(payload);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">

      {/* Heading */}
      <motion.div variants={item} className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Get started — booking takes less than 2 minutes.
        </p>
      </motion.div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
        aria-label="Sign up form"
      >
        {/* Name row */}
        <motion.div variants={item} className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            id="firstName"
            placeholder="John"
            autoComplete="given-name"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last name"
            id="lastName"
            placeholder="Doe"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </motion.div>

        {/* Email */}
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

        {/* Phone */}
        <motion.div variants={item}>
          <Input
            label="Phone number"
            type="tel"
            id="phoneNumber"
            placeholder="+1 555 000 0000"
            autoComplete="tel"
            leftIcon={<Phone className="h-4 w-4" />}
            error={errors.phoneNumber?.message}
            {...register('phoneNumber')}
          />
        </motion.div>

        {/* License */}
        <motion.div variants={item}>
          <Input
            label="Driver's license number"
            id="licenseNumber"
            placeholder="DL-XXXXXX"
            leftIcon={<CreditCard className="h-4 w-4" />}
            error={errors.licenseNumber?.message}
            {...register('licenseNumber')}
          />
        </motion.div>

        {/* Password + strength */}
        <motion.div variants={item}>
          <Input
            label="Password"
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

        {/* Confirm password */}
        <motion.div variants={item}>
          <Input
            label="Confirm password"
            type="password"
            id="confirmPassword"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </motion.div>

        {/* Terms */}
        <motion.div variants={item}>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              id="terms"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
              {...register('terms')}
            />
            <span className="text-sm text-slate-600 leading-relaxed">
              I agree to the{' '}
              <Link href="/terms" className="font-medium text-blue-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="font-medium text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms && (
            <p role="alert" className="mt-1.5 text-xs text-red-600">
              {errors.terms.message}
            </p>
          )}
        </motion.div>

        {/* Server error */}
        <motion.div variants={item}>
          <FormAlert type="error" message={error} onDismiss={() => setError('')} />
        </motion.div>

        {/* Submit */}
        <motion.div variants={item}>
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full h-11 text-base gap-2"
            aria-label="Create account"
          >
            Create Account
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </motion.div>
      </form>

      {/* Login link */}
      <motion.div variants={item} className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-blue-600 hover:underline transition-colors"
        >
          Sign in
        </Link>
      </motion.div>
    </motion.div>
  );
}
