import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Encar photos are served straight from ci.encar.com at the size we ask for
  // (see imageUrl in lib/encar-shared), so they bypass next/image entirely.
  // Routing them through the optimiser would add a server round-trip per image
  // for no gain -- the catalogue is far too large for the cache to help.
};

export default nextConfig;
