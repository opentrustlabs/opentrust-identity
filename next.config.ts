import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// const cspHeader = `
//     default-src 'self';
//     script-src 'self' 'unsafe-eval' 'unsafe-inline';
//     style-src 'self' 'unsafe-inline';
//     img-src 'self' blob: data:;
//     font-src 'self';
//     object-src 'none';
//     base-uri 'self';
//     form-action 'self';
//     frame-ancestors 'none';
//     upgrade-insecure-requests;
// `

const CONTENT_SECURITY_POLICY = isDev
  ? `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      connect-src 'self';
      img-src 'self' https:;
    `
  : `
      default-src 'self';
      script-src 'self';
      style-src 'self';     
      img-src 'self' https:; 
      connect-src 'self';
      font-src 'self';
      object-src 'none';
      base-uri 'self';
      frame-ancestors 'none';
      form-action 'self';
      upgrade-insecure-requests;
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
