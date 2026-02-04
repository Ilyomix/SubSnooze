import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', '@/components'],
  },
  images: {
    remotePatterns: [
      // Google Favicons API (fallback)
      {
        protocol: 'https',
        hostname: 'www.google.com',
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
      // Catch-all for favicon.ico files (many domains)
      {
        protocol: 'https',
        hostname: '*.com',
      },
    ],
  },
};

export default nextConfig;
