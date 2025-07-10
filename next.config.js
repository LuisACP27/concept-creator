/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/concept-creator' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/concept-creator' : '',
}

module.exports = nextConfig 