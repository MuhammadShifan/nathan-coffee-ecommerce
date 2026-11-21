
const getBackendBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (import.meta.env.PROD) {
    return 'https://nathan-coffee-ecommerce-tk06.onrender.com';
  }
  return '';
};

export const resolveProductImageUrl = (
  imageSource,
  fallback = '/images/250g front.png'
) => {
  if (!imageSource) return fallback;

  const rawUrl =
    typeof imageSource === 'object' && imageSource?.url
      ? imageSource.url
      : String(imageSource);

  const trimmed = rawUrl.trim();
  if (!trimmed) return fallback;

  if (/^(https?:|\/\/|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  let normalized = trimmed;
  if (!normalized.startsWith('/')) {
    if (
      normalized.startsWith('images/') ||
      normalized.startsWith('uploads/') ||
      normalized.startsWith('api/')
    ) {
      normalized = `/${normalized}`;
    } else {
      normalized = `/images/${normalized}`;
    }
  }

  if (normalized.startsWith('/uploads/') || normalized.startsWith('/api/images/')) {
    const backendBase = getBackendBaseUrl();
    return backendBase ? `${backendBase}${normalized}` : normalized;
  }

  return normalized;
};

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
