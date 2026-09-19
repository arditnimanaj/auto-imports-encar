import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Encar serves every listing photo from this one host.
    remotePatterns: [{ protocol: 'https', hostname: 'ci.encar.com' }],
  },
};

export default nextConfig;
