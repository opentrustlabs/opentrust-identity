import type { NextConfig } from "next";

// Minimal CSP applied at the app level.
// script-src, style-src, connect-src, font-src, img-src are intentionally
// omitted here — configure those in your nginx/Apache reverse proxy where
// you can tune them without rebuilding the image.
const CONTENT_SECURITY_POLICY = `
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'none';
  form-action 'self';
`;

const nextConfig: NextConfig = {
  
  /* config options here */  
  logging: false,
  transpilePackages: ['mui-tel-input'],
  allowedDevOrigins: ["localhost"],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  output: "standalone",
  async headers () {
    return [
        {
            source: '/(.*)',
            headers: [
              {
                key: 'Content-Security-Policy',
                value: CONTENT_SECURITY_POLICY.replace(/\n/g, ''),
              },
            ],
          }
    ]
  }
  

};

export default nextConfig;
