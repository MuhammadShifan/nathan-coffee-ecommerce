
const rawSiteUrl = (import.meta.env.VITE_SITE_URL || 'https://nathancoffeethanjavur.com').trim();
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
    alternateNames: [
      'Nathan Coffee',
      'Nathan Coffee',
      'Nathan Filter Coffee',
      'Nathan Coffee Thanjavur',
      'Nathan Coffee Thanjavur',
    ],
    tagline: 'Pure & Fresh Filter Coffee Powder from Thanjavur • Since 1950',
    description:
      'Premier manufacturer and retailer of 100% Pure South Indian Filter Coffee Powder and traditional roasted blends in Thanjavur.',
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
    logoPath: '/Nlogo.jpg',
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

  defaults: {
    title: 'Nathan Coffee | Pure & Fresh Filter Coffee Powder from Thanjavur',
    description:
      'Buy 100% Pure South Indian Filter Coffee Powder Online from Nathan Coffee. Freshly roasted in Thanjavur. Rich aroma, traditional drum roast, fast delivery across India.',
    keywords:
      'coffee powder, Nathan coffee, nathan coffee, Nathan coffee, filter coffee powder, buy filter coffee powder online, Thanjavur coffee powder, thanjavur coffee powder, pure coffee powder, best coffee powder in tamil nadu, degree coffee powder, chicory coffee blend, south indian filter coffee powder',
    ogImage: '/images/hero-coffee.jpg',
    ogType: 'website',
  },
};

export default SEO_CONFIG;

