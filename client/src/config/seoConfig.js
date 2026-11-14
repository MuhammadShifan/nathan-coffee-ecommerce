/**
 * Central SEO Configuration - Nathan Coffee
 * 
 * NOTE FOR CUSTOM DOMAIN:
 * When you purchase and connect your custom domain (e.g., https://nadhancoffee.com),
 * you DO NOT need to touch the codebase.
 * Simply set the VITE_SITE_URL environment variable in your client .env / deployment settings:
 * 
 *   VITE_SITE_URL=https://your-custom-domain.com
 * 
 * All canonical URLs, Open Graph tags, Twitter cards, and JSON-LD structured data
 * will automatically update to reflect your custom production domain.
 */

// Resolves the production site base URL from environment or fallback placeholder
const rawSiteUrl = (import.meta.env.VITE_SITE_URL || 'https://nadhancoffee.com').trim();
export const SITE_URL = rawSiteUrl.replace(/\/+$/, '');

/**
 * Resolves any relative or absolute path to a fully qualified URL
 * using the configured production domain.
 * 
 * @param {string} path - e.g. '/shop', 'images/hero.jpg', or full URL
 * @returns {string} Fully qualified production URL
 */
export const resolveUrl = (path = '') => {
  if (!path) return SITE_URL;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    // If it's already an absolute URL using another temporary domain, strip and re-anchor to SITE_URL
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
  // Brand & Business Details (Reused across all schema & metadata)
  business: {
    name: 'Nathan Coffee',
    legalName: 'Nathan Coffee Private Limited',
    alternateNames: [
      'Nathan Coffee',
      'Nathan Coffee',
      'Nathan Filter Coffee',
      'Nathan Coffee Thanjavur',
      'Nathan Coffee Thanjavur',
    ],
    tagline: 'Pure & Fresh Filter Coffee Powder from Thanjavur & Thanjavur • Since 1950',
    description:
      'Premier manufacturer and retailer of 100% Pure South Indian Filter Coffee Powder and traditional roasted blends in Thanjavur and Thanjavur.',
    founder: {
      name: 'Grandfather Nathan',
      jobTitle: 'Master Coffee Roaster & Founder',
    },
    foundingDate: '1950',
    telephone: '+91-6383805976',
    displayPhone: '+91 63838 05976',
    secondaryPhone: '+91-9443104462',
    whatsappNumber: '+916383805976',
    whatsappUrl: 'https://wa.me/916383805976',
    email: 'nathancoffeethanjavur.official@gmail.com',
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Credit Card, Debit Card, UPI, Net Banking, Cashfree',
    logoPath: '/images/logo.jpeg',
    heroImagePath: '/images/hero-coffee.jpg',
    addresses: [
      {
        branchName: 'Thanjavur Branch (Heritage Store & Roastery)',
        streetAddress: '2928, South Main Street, Near Canara Bank',
        landmark: ' Junction',
        addressLocality: 'Thanjavur',
        addressRegion: 'Tamil Nadu',
        postalCode: '613007',
        addressCountry: 'IN',
        geo: {
          latitude: '10.7870',
          longitude: '79.1378',
        },
      },
      {
        branchName: 'Thanjavur Hub & Roastery Dispatch Center',
        streetAddress: 'Avinashi Road / R.S. Puram',
        addressLocality: 'Thanjavur',
        addressRegion: 'Tamil Nadu',
        postalCode: '641002',
        addressCountry: 'IN',
        geo: {
          latitude: '11.0168',
          longitude: '76.9558',
        },
      },
    ],
    openingHours: [
      {
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    sameAs: [
      'https://www.facebook.com/nadhancoffee',
      'https://www.instagram.com/nadhancoffee',
      'https://wa.me/916383805976',
    ],
  },

  // Default Page Metadata
  defaults: {
    title: 'Nathan Coffee | Pure & Fresh Filter Coffee Powder from Thanjavur & Thanjavur',
    description:
      'Buy 100% Pure South Indian Filter Coffee Powder Online from Nathan Coffee. Freshly roasted in Thanjavur and Thanjavur. Rich aroma, traditional drum roast, fast delivery across India.',
    keywords:
      'coffee powder, Nathan coffee, nathan coffee, Nathan coffee, filter coffee powder, buy filter coffee powder online, Thanjavur coffee powder, thanjavur coffee powder, pure coffee powder, best coffee powder in tamil nadu, degree coffee powder, chicory coffee blend, south indian filter coffee powder',
    ogImage: '/images/hero-coffee.jpg',
    ogType: 'website',
  },
};

export default SEO_CONFIG;

