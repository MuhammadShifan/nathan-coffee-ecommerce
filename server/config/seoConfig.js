
const rawSiteUrl = (process.env.SITE_URL || process.env.CLIENT_URL || 'https://nathancoffeethanjavur.com').trim();
export const SITE_URL = rawSiteUrl.replace(/\/+$/, '');

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

