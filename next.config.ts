import type { NextConfig } from 'next';
import withPWA from '@ducanh2912/next-pwa';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

export default withPWA({
  dest: 'public',
  disable: false, // 개발 환경에서도 PWA 활성화
  register: true,
  skipWaiting: true,
})(nextConfig);
