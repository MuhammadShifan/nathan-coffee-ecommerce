/**
 * Central SEO Configuration - Backend (Node/Express)
 * 
 * NOTE FOR CUSTOM DOMAIN:
 * When you purchase and connect your custom domain (e.g., https://nadhancoffee.com),
 * you DO NOT need to touch this file.
 * Simply update the SITE_URL environment variable in your server .env / Render / host settings:
 * 
 *   SITE_URL=https://your-custom-domain.com
 * 
 * sitemap.xml and robots.txt will automatically output the dynamic production URLs.
 */

const rawSiteUrl = (process.env.SITE_URL || process.env.CLIENT_URL || 'https://nadhancoffee.com').trim();
export const SITE_URL = rawSiteUrl.replace(/\/+$/, '');

/**
 * Resolves any relative path to a fully qualified production URL
 * 
 * @param {string} path - e.g. '/shop', '/sitemap.xml'
 * @returns {string} Fully qualified production URL
 */
export const resolveUrl = (path = '') => {
  if (!path) return SITE_URL;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const parsed = new URL(path);
      return `${SITE_URL}${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch (e) {
      return path;
    }
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
};

export const SEO_CONFIG = {
  business: {
    name: 'Nathan Coffee',
    legalName: 'Nathan Coffee Private Limited',
    phone: '+91-6383805976',
    email: 'nathancoffeethanjavur.official@gmail.com',
    primaryAddress: '2928, South Main Street, Near Canara Bank, Thanjavur, Tamil Nadu - 613007, India',
    secondaryAddress: 'Avinashi Road / R.S. Puram, Thanjavur, Tamil Nadu - 641002, India',
  },

  // Public indexable static routes for sitemap.xml
  staticPages: [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/shop', changefreq: 'daily', priority: '0.9' },
    { url: '/about', changefreq: 'weekly', priority: '0.8' },
    { url: '/contact', changefreq: 'monthly', priority: '0.8' },
    { url: '/policy/privacy', changefreq: 'monthly', priority: '0.4' },
    { url: '/policy/terms', changefreq: 'monthly', priority: '0.4' },
    { url: '/policy/shipping', changefreq: 'monthly', priority: '0.5' },
    { url: '/policy/cancellation-refund', changefreq: 'monthly', priority: '0.5' },
  ],

  // Robots.txt configuration
  robots: {
    disallow: [
      '/admin/',
      '/api/admin/',
      '/checkout',
      '/order-success/',
      '/my-orders',
    ],
    allow: ['/'],
  },
};

export default SEO_CONFIG;

