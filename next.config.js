/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      { source: '/booking', destination: '/booking/route-selection', permanent: false },
      // Legacy/short-lived paths from the old React Router setup
      { source: '/route-selection', destination: '/booking/route-selection', permanent: true },
      { source: '/vehicle-selection', destination: '/booking/vehicle-selection', permanent: true },
      { source: '/confirmation', destination: '/booking/confirm', permanent: true },
      { source: '/admin/routes/new', destination: '/admin/routes/create', permanent: true },
    ];
  },

  async rewrites() {
    return [
      { source: '/sitemap.xml', destination: '/api/sitemap.xml' },
      { source: '/sitemap/:page.xml', destination: '/api/sitemap/:page.xml' },
    ];
  },
};

module.exports = nextConfig;
