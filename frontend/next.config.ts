import type { NextConfig } from "next";

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  API routing strategy
 * ──────────────────────────────────────────────────────────────────────────────
 *
 *  The frontend ALWAYS calls  /api/v1/*  (relative path).
 *  Next.js rewrites that to the Express backend in BOTH dev and production.
 *
 *  LOCAL DEV:
 *    No env var needed. Falls back to http://localhost:5000.
 *    Cookies work because both browser and backend are on localhost.
 *
 *  PRODUCTION (Vercel + Render):
 *    In the Vercel dashboard (Settings → Environment Variables) add:
 *      BACKEND_URL = https://your-backend-name.onrender.com
 *    (This is NOT NEXT_PUBLIC — it stays server-side only and is safe to expose)
 *
 *    Vercel proxies /api/v1/* → Render server-side.
 *    The browser only ever talks to the Vercel domain, so cookies are
 *    SAME-ORIGIN — no SameSite=None, no cross-domain cookie issues.
 * ──────────────────────────────────────────────────────────────────────────────
 */

const BACKEND_URL = process.env.BACKEND_URL?.trim() || "http://localhost:5000";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },

  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
