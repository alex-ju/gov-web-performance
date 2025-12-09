/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export in production builds
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  // Only use basePath in production (for GitHub Pages)
  basePath: process.env.NODE_ENV === 'production' ? '/gov-web-performance' : '',
  images: {
    unoptimized: true,
  },
  // Disable TypeScript and ESLint build errors for faster development
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
