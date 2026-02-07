import type { NextConfig } from "next";

// CSP directives — Supabase URL is injected at build time via env var
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const isDev = process.env.NODE_ENV === "development";
const cspDirectives = [
  "default-src 'self'",
  // Next.js requires 'unsafe-inline' and 'unsafe-eval' (dev) for its scripts;
  // in production 'unsafe-eval' is not needed but 'unsafe-inline' is (inline script tags).
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://apis.google.com https://js.stripe.com https://us-assets.i.posthog.com`,
  // Tailwind injects styles via <style> tags — 'unsafe-inline' required
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' https://fonts.gstatic.com`,
  `img-src 'self' data: blob: https:`,
  `connect-src 'self' ${supabaseUrl} https://*.supabase.co wss://*.supabase.co https://fcm.googleapis.com https://firebaseinstallations.googleapis.com https://accounts.google.com https://api.stripe.com https://*.ingest.sentry.io https://us.i.posthog.com https://us-assets.i.posthog.com`,
  "frame-src https://accounts.google.com https://js.stripe.com https://hooks.stripe.com",
  "worker-src 'self'",
  "manifest-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

// CORS: Restrict to own origin + Supabase
const allowedOrigins = [
  supabaseUrl,
  "https://subsnooze.com",
  "https://www.subsnooze.com",
].filter(Boolean).join(", ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspDirectives },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Access-Control-Allow-Origin", value: allowedOrigins },
  { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
  { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-Requested-With" },
  { key: "Access-Control-Max-Age", value: "86400" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: process.env.DOCKER_BUILD === "1" ? "standalone" : undefined,
  experimental: {
    optimizePackageImports: ['lucide-react', '@/components'],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      // Google Favicons API (fallback)
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/s2/favicons/**',
      },
      // Wikimedia/Wikipedia logos
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      // Netflix
      {
        protocol: 'https',
        hostname: 'assets.nflxext.com',
      },
      // Spotify
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      // Disney+
      {
        protocol: 'https',
        hostname: 'cnbl-cdn.bamgrid.com',
      },
      // YouTube
      {
        protocol: 'https',
        hostname: 'www.youtube.com',
      },
      // Amazon
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      // Apple
      {
        protocol: 'https',
        hostname: 'www.apple.com',
      },
      {
        protocol: 'https',
        hostname: 'tv.apple.com',
      },
      // Max/HBO
      {
        protocol: 'https',
        hostname: 'play-lh.googleusercontent.com',
      },
      // Hulu
      {
        protocol: 'https',
        hostname: 'assetshuluimcom-a.akamaihd.net',
      },
      // Adobe
      {
        protocol: 'https',
        hostname: 'www.adobe.com',
      },
      // Microsoft
      {
        protocol: 'https',
        hostname: 'img-prod-cms-rt-microsoft-com.akamaized.net',
      },
      // Figma
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      // GitHub
      {
        protocol: 'https',
        hostname: 'github.githubassets.com',
      },
      // Slack
      {
        protocol: 'https',
        hostname: 'a.slack-edge.com',
      },
      // Dropbox
      {
        protocol: 'https',
        hostname: 'cfl.dropboxstatic.com',
      },
      // Google services
      {
        protocol: 'https',
        hostname: 'www.gstatic.com',
      },
      // NordVPN
      {
        protocol: 'https',
        hostname: 's1.nordcdn.com',
      },
      // Canva
      {
        protocol: 'https',
        hostname: 'static.canva.com',
      },
      // Duolingo
      {
        protocol: 'https',
        hostname: 'd35aaqx5ub95lt.cloudfront.net',
      },
      // LinkedIn
      {
        protocol: 'https',
        hostname: 'content.linkedin.com',
      },
      // Coursera
      {
        protocol: 'https',
        hostname: 'd3njjcbhbojbot.cloudfront.net',
      },
      // Paramount
      {
        protocol: 'https',
        hostname: 'wwwimage-us.pplusstatic.com',
      },
      // Crunchyroll
      {
        protocol: 'https',
        hostname: 'static.crunchyroll.com',
      },
      // Deezer
      {
        protocol: 'https',
        hostname: 'e-cdns-files.dzcdn.net',
      },
      // 1Password
      {
        protocol: 'https',
        hostname: '1password.com',
      },
      // Grammarly
      {
        protocol: 'https',
        hostname: 'static.grammarly.com',
      },
      // Medium
      {
        protocol: 'https',
        hostname: 'miro.medium.com',
      },
      // Twitch
      {
        protocol: 'https',
        hostname: 'static.twitchcdn.net',
      },
    ],
  },
};

export default nextConfig;
