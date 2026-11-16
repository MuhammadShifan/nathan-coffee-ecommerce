/**
 * Image URL Resolver Utility for Nathan Coffee
 *
 * Ensures product images and banners render reliably whether they are:
 * 1. External Cloud URLs (Cloudinary, AWS S3, Firebase, Imgur, etc.)
 * 2. Static bundled assets (/images/250g front.png, /images/hero-coffee.jpg, etc.)
 * 3. Server-uploaded files (/images/filename-*.jpg or /uploads/filename-*.jpg)
 *    served from the Render backend or proxied via Vercel rewrites.
 */

const getBackendBaseUrl = () => {
  // If explicitly configured via Vite env
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  // If in production on Vercel / custom domain, point to live Render backend
  if (import.meta.env.PROD) {
    return 'https://nathan-coffee-ecommerce.onrender.com';
  }
  // In local development, default to local Express port 5001 or let Vite proxy handle it
  return '';
};

// Known bundled static public images shipped in client/public/images
const BUNDLED_STATIC_IMAGES = new Set([
  '/images/250g front.png',
  '/images/250g back.png',
  '/images/250g front.jpg',
  '/images/250g back.jpg',
  '/images/500g fornt.png',
  '/images/500g back.png',
  '/images/500g fornt.jpg',
  '/images/500g back.jpg',
  '/images/chicory powder.jpg',
  '/images/chicory-powder.jpg',
  '/images/hero-coffee.jpg',
  '/images/hero coffee.jpg',
  '/images/grandfather photo.jpg',
  '/images/logo.png',
  '/images/logo.jpeg',
  '/images/logo.avif',
  '/images/newLogo.png',
]);

/**
 * Resolves an image path/URL to a guaranteed accessible URL.
 *
 * @param {string|object} imageSource - The raw image string, URL, or image object from DB.
 * @param {string} fallback - The default fallback image if missing or invalid.
 * @returns {string} Fully resolved image URL.
 */
export const resolveProductImageUrl = (
  imageSource,
  fallback = '/images/250g front.png'
) => {
  if (!imageSource) return fallback;

  // Handle object shaped like { url: '...' }
  const rawUrl = typeof imageSource === 'object' && imageSource?.url
    ? imageSource.url
    : String(imageSource);

  const trimmed = rawUrl.trim();
  if (!trimmed) return fallback;

  // 1. External URLs, data URIs, or object URLs (Cloudinary, S3, Firebase, blob)
  if (/^(https?:|\/\/|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  // 2. Known static assets bundled directly in Vercel public/images
  if (BUNDLED_STATIC_IMAGES.has(trimmed)) {
    return trimmed;
  }

  // 3. Newly uploaded backend files (e.g. /images/upload-*.jpg or /uploads/*.jpg)
  const backendBase = getBackendBaseUrl();
  if (backendBase) {
    if (trimmed.startsWith('/')) {
      return `${backendBase}${trimmed}`;
    }
    return `${backendBase}/${trimmed}`;
  }

  // Fallback to relative URL (handled by Vite proxy in dev or Vercel rewrite)
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

/**
 * Checks if an image URL is a generic uncustomized default placeholder.
 */
export const isDefaultPlaceholderImage = (url) => {
  if (!url || typeof url !== 'string') return true;
  const lower = url.toLowerCase().trim();
  return (
    lower === '' ||
    lower.includes('250g front.png') ||
    lower.includes('250g front.jpg') ||
    lower.includes('default')
  );
};

export default resolveProductImageUrl;

