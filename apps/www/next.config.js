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
};

module.exports = withContentlayer(nextConfig);
