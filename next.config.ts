import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['vm-next-js-vercel-project.vusercontent.net'],

  // ── Images ────────────────────────────────────────────────────────────────
  // Serve WebP/AVIF automatically; allow Blob store domain for thumbnails.
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
    // Stale cached images are served while Next.js re-optimises in background
    minimumCacheTTL: 3600,
  },

  // ── HTTP response headers ─────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Prevent MIME-sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Basic Permissions Policy — disable dangerous APIs we don't use
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()',
          },
          // Content Security Policy (permissive but structurally sound — tighten per-env in prod)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-eval in dev
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
              "media-src 'self' blob: https://*.public.blob.vercel-storage.com",
              "connect-src 'self' https://*.vercel-storage.com https://*.googleapis.com https://identitytoolkit.googleapis.com",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
      // Immutable cache for Next.js static assets
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  // ── Turbopack — split heavy charting library into its own chunk ─────────────
  turbopack: {
    resolveAlias: {},
  },
}

export default nextConfig
