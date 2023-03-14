/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: false,
  },
  webpack: (config, { buildId, dev }) => {
    config.resolve.symlinks = false
    return config
  },
}

module.exports = nextConfig
