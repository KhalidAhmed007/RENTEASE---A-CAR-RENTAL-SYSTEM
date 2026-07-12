import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Database, Share2, Lock, UserX, Bell, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | RentEase',
  description: 'Learn how RentEase collects, uses, and protects your personal information.',
};

const sections = [
  {
    id: 'information-collected',
    icon: Database,
    title: '1. Information We Collect',
    content: `We collect information that you provide directly to us and information generated through your use of the Service.

Information You Provide:
• Full name, email address, phone number, and profile photo
• Driver's license number and a copy of the license
• Payment information (processed securely via our payment partners)
• Booking history, preferences, and reviews

Information Collected Automatically:
• IP address, browser type, and operating system
• Pages visited, time spent on pages, and referring URLs
• Device identifiers and location data (with your permission)
• Cookies and similar tracking technologies`,
  },
  {
    id: 'how-we-use',
    icon: Eye,
    title: '2. How We Use Your Information',
    content: `We use the information we collect to:
• Process bookings, payments, and refunds
• Verify your identity and driver's license
• Communicate with you about your bookings and account
• Send promotional offers, newsletters, and service updates (you may opt out at any time)
• Improve our platform, services, and user experience
• Detect and prevent fraud, abuse, and security incidents
• Comply with legal obligations and enforce our Terms of Service
• Respond to your questions and provide customer support`,
  },
  {
    id: 'data-sharing',
    icon: Share2,
    title: '3. Information Sharing',
    content: `We do not sell your personal data. We may share your information with:

Service Providers: Trusted third parties who assist us in operating the platform (payment processors, cloud infrastructure, analytics, email service providers). These providers are contractually bound to protect your data.

Car Owners & Fleet Partners: Relevant booking details are shared with vehicle owners to facilitate your rental.

Legal Requirements: We may disclose information when required by law, regulation, or valid legal process, or to protect the rights, property, and safety of RentEase, its users, or the public.

Business Transfers: In the event of a merger, acquisition, or sale of assets, user data may be transferred. We will notify you before your information is subject to a different privacy policy.`,
  },
  {
    id: 'data-security',
    icon: Lock,
    title: '4. Data Security',
    content: `We implement industry-standard technical and organizational measures to protect your personal information:

• All data is encrypted in transit using TLS 1.2+
• Sensitive data (passwords, payment details) is encrypted at rest
• Access to personal data is restricted to authorized employees on a need-to-know basis
• We conduct regular security audits and penetration testing
• Our payment processing partners are PCI DSS Level 1 certified

While we strive to protect your data, no security system is impenetrable. We encourage you to use strong, unique passwords and to notify us immediately of any suspected unauthorized access to your account.`,
  },
  {
    id: 'your-rights',
    icon: UserX,
    title: '5. Your Rights & Choices',
    content: `You have the following rights regarding your personal information:

• Access: Request a copy of the personal data we hold about you
• Correction: Update or correct inaccurate personal information
• Deletion: Request deletion of your account and associated data (subject to legal retention requirements)
• Portability: Receive your data in a structured, machine-readable format
• Opt-Out: Unsubscribe from marketing communications at any time
• Objection: Object to certain types of data processing

To exercise any of these rights, contact us at privacy@rentease.in. We will respond within 30 days.`,
  },
  {
    id: 'cookies',
    icon: Bell,
    title: '6. Cookies & Tracking',
    content: `We use cookies and similar technologies to:
• Keep you logged in across sessions
• Remember your preferences and settings
• Analyze platform usage and performance
• Deliver relevant advertisements (where applicable)

You can control cookies through your browser settings. Disabling certain cookies may affect the functionality of our platform.

Types of cookies we use:
• Essential: Required for the platform to function
• Analytical: Help us understand how the platform is used
• Preference: Remember your settings and choices
• Marketing: Used to show relevant ads (can be disabled)`,
  },
  {
    id: 'retention',
    icon: Database,
    title: '7. Data Retention',
    content: `We retain your personal data for as long as your account is active or as needed to provide the Service. Specifically:

• Account data: Retained for the duration of your account plus 3 years
• Booking records: Retained for 7 years for tax and legal compliance
• Payment records: Retained as required by financial regulations
• Support communications: Retained for 2 years

After the retention period, data is securely deleted or anonymized.`,
  },
  {
    id: 'contact-privacy',
    icon: FileText,
    title: '8. Contact & Updates',
    content: `We may update this Privacy Policy periodically. We will notify you of significant changes via email or a prominent notice on the platform at least 14 days before the changes take effect.

Privacy Officer:
Email: privacy@rentease.in
Phone: +91 80 1234 5678
Address: 123 MG Road, Indiranagar, Bangalore — 560038, Karnataka, India

For general support:
Email: support@rentease.in
Available 24/7`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">
            Last updated: <time dateTime="2024-01-01">January 1, 2024</time>
          </p>
          <p className="mt-4 text-slate-300 max-w-2xl leading-relaxed">
            Your privacy matters to us. This policy explains what information we collect, how we use it, and the choices
            you have regarding your data when you use RentEase.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Highlight box */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 mb-10">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Our commitment to you</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                We do not sell your personal data. We collect only what we need, protect it rigorously, and give you
                control over how it is used.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Nav */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 mb-10 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Table of Contents</h2>
          <ul className="space-y-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <section
                key={section.id}
                id={section.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm scroll-mt-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                    <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{section.title}</h2>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </section>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Questions? Reach out to our Privacy Officer at{' '}
            <a href="mailto:privacy@rentease.in" className="text-blue-600 hover:underline">
              privacy@rentease.in
            </a>
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <Link href="/" className="text-blue-600 hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
