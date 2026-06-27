'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Lock, Shield, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api/axios';
import { useAuthStore } from '@/lib/store/authStore';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName:  z.string().min(2, 'Last name must be at least 2 characters'),
  phoneNumber: z.string().min(7, 'Enter a valid phone number'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword:     z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileForm   = z.infer<typeof profileSchema>;
type PasswordForm  = z.infer<typeof passwordSchema>;

// ─── Reusable field component ─────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function TextInput({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors
        ${error ? 'border-red-300 bg-red-50 focus:border-red-500' : 'border-slate-200 bg-white focus:border-blue-500'}
      `}
    />
  );
}

// ─── Profile Section ──────────────────────────────────────────────────────────

function ProfileSection() {
  const { user, login, accessToken } = useAuthStore();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const [profile, setProfile] = useState<{ firstName: string; lastName: string; email: string; phoneNumber: string; licenseNumber: string; role: string } | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    api.get('/users/me').then(res => {
      const u = res.data.data;
      setProfile(u);
      reset({ firstName: u.firstName, lastName: u.lastName, phoneNumber: u.phoneNumber });
    }).catch(() => {});
  }, [reset]);

  const onSubmit = async (data: ProfileForm) => {
    setStatus('loading');
    try {
      const res = await api.patch('/users/me', data);
      const updated = res.data.data;
      // Sync auth store with new name
      if (user && accessToken) {
        login({ ...user, firstName: updated.firstName }, accessToken);
      }
      setStatus('success');
      setMsg('Profile updated successfully!');
    } catch (e: unknown) {
      setStatus('error');
      setMsg((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Update failed.');
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
          <User className="h-4.5 w-4.5 text-blue-600" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Personal Information</h2>
          <p className="text-xs text-slate-500">Update your display name and phone number</p>
        </div>
      </div>

      {profile && (
        <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
          <div><span className="font-medium text-slate-700">Email:</span> {profile.email}</div>
          <div><span className="font-medium text-slate-700">License:</span> {profile.licenseNumber}</div>
          <div><span className="font-medium text-slate-700">Role:</span> <span className="capitalize">{profile.role}</span></div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name" error={errors.firstName?.message}>
            <TextInput {...register('firstName')} error={errors.firstName?.message} placeholder="First name" />
          </Field>
          <Field label="Last Name" error={errors.lastName?.message}>
            <TextInput {...register('lastName')} error={errors.lastName?.message} placeholder="Last name" />
          </Field>
        </div>
        <Field label="Phone Number" error={errors.phoneNumber?.message}>
          <TextInput {...register('phoneNumber')} error={errors.phoneNumber?.message} placeholder="+1 234 567 8900" type="tel" />
        </Field>

        {status === 'success' && (
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {msg}
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="h-4 w-4 shrink-0" /> {msg}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={status === 'loading'}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
          >
            {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save Changes
          </button>
        </div>
      </form>
    </section>
  );
}

// ─── Password Section ─────────────────────────────────────────────────────────

function PasswordSection() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState({ current: false, new: false, confirm: false });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordForm) => {
    setStatus('loading');
    try {
      await api.patch('/users/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setStatus('success');
      setMsg('Password changed successfully!');
      reset();
    } catch (e: unknown) {
      setStatus('error');
      setMsg((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update password.');
    }
  };



  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
          <Lock className="h-4.5 w-4.5 text-amber-600" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Change Password</h2>
          <p className="text-xs text-slate-500">Use a strong, unique password</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Current Password" error={errors.currentPassword?.message}>
          <div className="relative">
            <TextInput {...register('currentPassword')} type={show.current ? 'text' : 'password'} error={errors.currentPassword?.message} placeholder="Your current password" />
            <button type="button" onClick={() => setShow(s => ({ ...s, current: !s.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {show.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
        <Field label="New Password" error={errors.newPassword?.message}>
          <div className="relative">
            <TextInput {...register('newPassword')} type={show.new ? 'text' : 'password'} error={errors.newPassword?.message} placeholder="At least 8 characters" />
            <button type="button" onClick={() => setShow(s => ({ ...s, new: !s.new }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {show.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
        <Field label="Confirm New Password" error={errors.confirmPassword?.message}>
          <div className="relative">
            <TextInput {...register('confirmPassword')} type={show.confirm ? 'text' : 'password'} error={errors.confirmPassword?.message} placeholder="Repeat your new password" />
            <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {show.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        {status === 'success' && (
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {msg}
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="h-4 w-4 shrink-0" /> {msg}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={status === 'loading'}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
          >
            {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Update Password
          </button>
        </div>
      </form>
    </section>
  );
}

// ─── Account Security Info ────────────────────────────────────────────────────

function SecuritySection() {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Shield className="h-4.5 w-4.5 text-emerald-600" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Account Security</h2>
          <p className="text-xs text-slate-500">Your account protection details</p>
        </div>
      </div>
      <div className="space-y-3">
        {[
          { label: 'Two-Factor Authentication', value: 'Not enabled', badge: 'Coming Soon', badgeColor: 'bg-slate-100 text-slate-500' },
          { label: 'Session Tokens', value: 'JWT with 15-min access + 7-day refresh', badge: 'Active', badgeColor: 'bg-emerald-100 text-emerald-700' },
          { label: 'Data Encryption', value: 'Passwords hashed with bcrypt (10 rounds)', badge: 'Enabled', badgeColor: 'bg-blue-100 text-blue-700' },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-slate-800">{item.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.value}</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.badgeColor}`}>{item.badge}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1.5">Manage your account preferences and security.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-5"
      >
        <ProfileSection />
        <PasswordSection />
        <SecuritySection />
      </motion.div>
    </div>
  );
}
