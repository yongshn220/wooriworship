/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com'
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/board/:teamId/serving-board',
        destination: '/board/:teamId/service-board',
        permanent: true,
      },
      {
        source: '/board/:teamId/worship-board',
        destination: '/board/:teamId/service-board',
        permanent: true,
      },
      {
        source: '/board/:teamId/worship',
        destination: '/board/:teamId/service-board',
        permanent: true,
      }
    ];
  },
};

export default nextConfig;
