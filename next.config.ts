import type { NextConfig } from "next";

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

const nextConfig: NextConfig = {
  
  /* config options here */  
  logging: false,
  transpilePackages: ['mui-tel-input'],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  }
//   async headers () {
//     return [
//         {
//             source: '/(.*)',
//             headers: [
//               {
//                 key: 'Content-Security-Policy',
//                 value: cspHeader.replace(/\n/g, ''),
//               },
//             ],
//           }
//     ]
//   }
  

};

export default nextConfig;
