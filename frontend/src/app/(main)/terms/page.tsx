import type { Metadata } from 'next';
import Link from 'next/link';
import { Car, ArrowLeft, Shield, FileText, AlertTriangle, CreditCard, Scale, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | RentEase',
  description: 'Read the Terms of Service for RentEase — your trusted car rental platform in India.',
};

const sections = [
  {
    id: 'acceptance',
    icon: FileText,
    title: '1. Acceptance of Terms',
    content: `By accessing or using the RentEase platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service. These Terms apply to all visitors, users, and others who access or use the Service.`,
  },
  {
    id: 'eligibility',
    icon: Shield,
    title: '2. Eligibility',
    content: `To use RentEase, you must:
• Be at least 21 years of age
• Hold a valid driver's license issued by a recognized authority
• Have a minimum of 1 year of active driving experience
• Provide accurate and complete registration information
• Not have been previously suspended or removed from the Service

We reserve the right to refuse service to anyone who does not meet these eligibility requirements.`,
  },
  {
    id: 'booking',
    icon: CreditCard,
    title: '3. Bookings & Payments',
    content: `All bookings made through RentEase are subject to vehicle availability. Once confirmed, your booking constitutes a binding agreement.

Payment Terms:
• Full payment or a deposit may be required at the time of booking
• Accepted methods include major credit/debit cards and UPI
• All prices are displayed in Indian Rupees (INR) inclusive of applicable taxes
• A security deposit may be held until the vehicle is returned in satisfactory condition

Cancellation Policy:
• Cancellations made 48+ hours before pickup: Full refund
• Cancellations made 24–48 hours before pickup: 50% refund
• Cancellations made less than 24 hours before pickup: No refund`,
  },
  {
    id: 'vehicle-use',
    icon: Car,
    title: '4. Vehicle Use',
    content: `When using a vehicle rented through RentEase, you agree to:
• Use the vehicle only for lawful purposes
• Not sublet or transfer the vehicle to any third party
• Not drive the vehicle outside the agreed geographic region without prior written approval
• Not use the vehicle for racing, off-roading (unless permitted), or any illegal activity
• Return the vehicle in the same condition as received, accounting for normal wear and tear
• Report any accidents, damage, or theft to RentEase immediately

Fuel Policy: Vehicles must be returned with the same fuel level as at pickup. Fuel shortfall charges apply.`,
  },
  {
    id: 'liability',
    icon: AlertTriangle,
    title: '5. Liability & Insurance',
    content: `RentEase maintains third-party liability insurance on all vehicles in its fleet. However:

• You are responsible for any damage to the vehicle caused by negligence or misuse
• Comprehensive insurance coverage is available as an optional add-on
• RentEase is not liable for any loss, theft, or damage to personal belongings left in the vehicle
• Our total liability shall not exceed the amount paid by you for the specific rental transaction

By accepting these Terms, you acknowledge that you drive at your own risk and that RentEase is not responsible for accidents beyond the scope of the applicable insurance policy.`,
  },
  {
    id: 'dispute',
    icon: Scale,
    title: '6. Dispute Resolution',
    content: `Any dispute arising from these Terms shall first be attempted to be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to binding arbitration in accordance with the laws of India.

These Terms are governed by and construed in accordance with the laws of India, and you submit to the exclusive jurisdiction of the courts of Bangalore, Karnataka.`,
  },
  {
    id: 'contact',
    icon: Phone,
    title: '7. Contact Us',
    content: `If you have any questions about these Terms, please contact us:

RentEase Support Team
Email: legal@rentease.in
Phone: +91 80 1234 5678
Address: 123 MG Road, Indiranagar, Bangalore — 560038, Karnataka, India

Our support team is available 24/7 to assist you.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Terms of Service</h1>
          <p className="text-slate-400 text-sm">
            Last updated: <time dateTime="2024-01-01">January 1, 2024</time>
          </p>
          <p className="mt-4 text-slate-300 max-w-2xl leading-relaxed">
            Please read these Terms carefully before using the RentEase platform. By creating an account or making a
            booking, you agree to be legally bound by these Terms.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
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
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
                    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
            By using RentEase, you acknowledge that you have read and understood these Terms of Service.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
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
