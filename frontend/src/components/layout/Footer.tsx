'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Car, Mail, Phone, MapPin, ArrowUpRight, ShieldCheck, Heart, Sparkles,
  Send, CheckCircle2
} from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 5000);
    }
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400">
      {/* Upper Footer: Newsletter Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-900/40 text-blue-400 border border-blue-800/40">
              <Sparkles className="h-3 w-3" /> Exclusive Updates
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Get the latest updates on premium fleet & offers
            </h3>
            <p className="text-sm text-slate-400 max-w-md">
              Subscribe to the RentEase newsletter and stay informed about new additions, seasonal discounts, and curated road trips.
            </p>
          </div>
          <div className="lg:col-span-6">
            <form onSubmit={handleSubscribe} className="relative max-w-md lg:ml-auto">
              {subscribed ? (
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-sm font-semibold animate-pulse">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                  Thank you! You&apos;ve subscribed successfully.
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md hover:shadow-blue-900/30 transition-all active:scale-[0.98]"
                  >
                    Subscribe <Send className="h-4 w-4" />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Middle Footer: Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand & Socials Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-white text-xl">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span>RentEase</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              RentEase is a premium car rental platform designed to bring you the best-in-class driving experiences. Rent clean, fully-serviced luxury and standard vehicles at competitive rates.
            </p>
            {/* Value Badges */}
            <div className="flex flex-wrap gap-4 items-center pt-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" /> Secure Payments
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Heart className="h-4.5 w-4.5 text-rose-500 fill-rose-500/20" /> 24/7 Support
              </span>
            </div>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {[
                {
                  icon: () => (
                    <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                  href: '#',
                  label: 'X (formerly Twitter)'
                },
                {
                  icon: () => (
                    <svg className="h-4.5 w-4.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  ),
                  href: '#',
                  label: 'Instagram'
                },
                {
                  icon: () => (
                    <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  ),
                  href: '#',
                  label: 'LinkedIn'
                },
                {
                  icon: () => (
                    <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                  ),
                  href: '#',
                  label: 'GitHub'
                }
              ].map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-blue-600 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Browse Cars', href: '/cars' },
                { label: 'Special Offers', href: '/cars?category=luxury' },
                { label: 'Wishlist', href: '/dashboard/wishlist' },
                { label: 'My Bookings', href: '/dashboard/bookings' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1 group">
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Portal Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Services</h4>
            <ul className="space-y-3">
              {[
                { label: 'Premium Fleet', href: '/cars' },
                { label: 'Electric Vehicles', href: '/cars?category=electric' },
                { label: 'SUV Fleet', href: '/cars?category=suv' },
                { label: 'Help & FAQ', href: '/dashboard/settings' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1 group">
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-slate-400">
                <MapPin className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                <span>MG Road, Bangalore, Karnataka, India</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-400">
                <Phone className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                <span>+91 80 4930 2000</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-400">
                <Mail className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                <span>support@rentease.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Copyright & Legal */}
      <div className="bg-slate-950/80 py-8 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center md:text-left">
            © {new Date().getFullYear()} RentEase Private Limited. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Refund Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
