// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'build',  // Changed to 'build' to match CRA structure
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig