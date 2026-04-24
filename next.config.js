/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export in production builds
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  // Only use basePath in production (for GitHub Pages)
  basePath: process.env.NODE_ENV === 'production' ? '/gov-web-performance' : '',
  images: {
    unoptimized: true,
  },
  // Disable TypeScript build errors if needed
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
