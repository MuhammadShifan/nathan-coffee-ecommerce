/**
 * Image URL Resolver Utility for Nathan Coffee
 *
 * Ensures product images and banners render reliably whether they are:
 * 1. External Cloud URLs (Cloudinary, AWS S3, Firebase, Imgur, etc.)
 * 2. Static bundled assets (/images/250g front.png, /images/hero-coffee.jpg, etc.)
 * 3. Server-uploaded files (/uploads/filename-*.jpg) served from the Render backend.
 */

const getBackendBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (import.meta.env.PROD) {
    return 'https://nathan-coffee-ecommerce.onrender.com';
  }
  return '';
};

/**
 * Resolves an image path/URL to a guaranteed accessible, loadable URL.
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
  const rawUrl =
    typeof imageSource === 'object' && imageSource?.url
      ? imageSource.url
      : String(imageSource);

  const trimmed = rawUrl.trim();
  if (!trimmed) return fallback;

  // 1. External URLs, data URIs, or object URLs (Cloudinary, S3, Firebase, blob)
  if (/^(https?:|\/\/|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  // 2. Ensure leading slash so paths never resolve relative to the current URL (/product/...)
  let normalized = trimmed;
  if (!normalized.startsWith('/')) {
    if (normalized.startsWith('images/') || normalized.startsWith('uploads/')) {
      normalized = `/${normalized}`;
    } else {
      normalized = `/images/${normalized}`;
    }
  }

  // 3. Dynamic uploads stored in /uploads/ route to backend in production
  if (normalized.startsWith('/uploads/')) {
    const backendBase = getBackendBaseUrl();
    return backendBase ? `${backendBase}${normalized}` : normalized;
  }

  // 4. All other static packaging images in /images/... are served directly by Vercel CDN
  return normalized;
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
