import type { NextConfig } from "next";

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  API routing strategy
 * ──────────────────────────────────────────────────────────────────────────────
 *  DEVELOPMENT (local):
 *    .env.local  →  NEXT_PUBLIC_API_URL=/api/v1   (relative path)
 *    The rewrite below proxies  /api/v1/*  →  localhost:5000/api/v1/*
 *    Cookies work because both the browser and backend are on localhost.
 *
 *  PRODUCTION (Vercel + Render):
 *    On your Vercel project  (Settings → Environment Variables)  add:
 *      NEXT_PUBLIC_API_URL = https://<your-backend>.onrender.com/api/v1
 *    axios will call Render directly — the rewrite block is skipped entirely.
 *    No extra "BACKEND_URL" variable is needed on Vercel.
 * ──────────────────────────────────────────────────────────────────────────────
 */

// If NEXT_PUBLIC_API_URL starts with "http" it's an absolute URL → production.
// If it's relative (e.g. "/api/v1") or unset → development, use the rewrite.
const isDev = !process.env.NEXT_PUBLIC_API_URL?.startsWith("http");
const DEV_BACKEND_URL = "http://localhost:5000";

const nextConfig: NextConfig = {
  // Fix: multiple lockfiles detected warning (monorepo layout)
  turbopack: {
    root: __dirname,
  },

  async rewrites() {
    // In production, axios calls the Render URL directly — skip the rewrite.
    if (!isDev) return [];

    return [
      {
        source: "/api/v1/:path*",
        destination: `${DEV_BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },

  images: {
    // Allow local static images (from /public) to bypass the optimizer.
    // This is the most reliable option during development.
    unoptimized: true,
    remotePatterns: [
      {
        // Cloudinary — primary car image host (res.cloudinary.com/<cloud>/...)
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        // Cloudinary alternate subdomain pattern
        protocol: "https",
        hostname: "*.cloudinary.com",
      },
      {
        // Cloudinary image delivery CDN
        protocol: "https",
        hostname: "images.cloudinary.com",
      },
      {
        // Unsplash — verified high-quality public domain car images
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // localhost — for any locally-served images during development
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
