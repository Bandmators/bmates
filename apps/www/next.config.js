/* eslint-disable */
const { withContentlayer } = require('next-contentlayer');

const isProduction = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: isProduction ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  basePath: '/bmates',
};

module.exports = withContentlayer(nextConfig);
