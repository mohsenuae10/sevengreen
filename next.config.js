/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Image optimization domains
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'kcunskgjvmzrxenjblmk.supabase.co' },
      { protocol: 'https', hostname: 'ae01.alicdn.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Security & caching headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // Legacy path redirects (unprefixed → /ar/)
  async redirects() {
    return [
      { source: '/products', destination: '/ar/products', permanent: true },
      { source: '/cart', destination: '/ar/cart', permanent: true },
      { source: '/checkout', destination: '/ar/checkout', permanent: true },
      { source: '/about', destination: '/ar/about', permanent: true },
      { source: '/contact', destination: '/ar/contact', permanent: true },
      { source: '/faq', destination: '/ar/faq', permanent: true },
      { source: '/privacy-policy', destination: '/ar/privacy-policy', permanent: true },
      { source: '/terms-of-service', destination: '/ar/terms-of-service', permanent: true },
      { source: '/return-policy', destination: '/ar/return-policy', permanent: true },
      { source: '/shipping-policy', destination: '/ar/shipping-policy', permanent: true },
      { source: '/blog', destination: '/ar/blog', permanent: true },
      { source: '/blog/:slug', destination: '/ar/blog/:slug', permanent: true },
      { source: '/product/:slug', destination: '/ar/product/:slug', permanent: true },
      { source: '/category/:slug', destination: '/ar/category/:slug', permanent: true },
      { source: '/order-success/:id', destination: '/ar/order-success/:id', permanent: true },
    ];
  },

  // Transpile packages as needed
  transpilePackages: ['lucide-react'],

  // Webpack alias for @ → ./src
  webpack(config) {
    config.resolve.alias['@'] = require('path').resolve(__dirname, 'src');
    return config;
  },
};

module.exports = nextConfig;
