import axios from 'axios';

/**
 * Robust token retrieval helpers from localStorage
 */
export const getAdminToken = () => {
  try {
    const directToken = localStorage.getItem('nadhan_admin_token') || localStorage.getItem('admin_token');
    if (directToken && directToken.trim()) return directToken.trim();

    const adminInfo = localStorage.getItem('nadhan_admin_info');
    if (adminInfo) {
      const parsed = JSON.parse(adminInfo);
      if (parsed?.token && typeof parsed.token === 'string') {
        return parsed.token.trim();
      }
    }
  } catch (e) {
    console.warn('Failed to retrieve admin token from localStorage:', e);
  }
  return null;
};

export const getUserToken = () => {
  try {
    const token = localStorage.getItem('nadhan_user_token');
    if (token && token.trim()) return token.trim();

    const userInfo = localStorage.getItem('nadhan_user_info');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      if (parsed?.token && typeof parsed.token === 'string') {
        return parsed.token.trim();
      }
    }
  } catch (e) {
    console.warn('Failed to retrieve user token from localStorage:', e);
  }
  return null;
};

// Create main Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Global Request Interceptor
 * Automatically attaches the appropriate JWT token to the Authorization header
 */
api.interceptors.request.use(
  (config) => {
    const adminToken = getAdminToken();
    const userToken = getUserToken();

    const url = config.url || '';
    const method = (config.method || 'GET').toUpperCase();

    // Check if the current browser page is an Admin view
    const isAdminPage =
      typeof window !== 'undefined' &&
      window.location &&
      window.location.pathname.startsWith('/admin');

    // Check if endpoint is specifically customer-only
    const isCustomerOnlyEndpoint =
      url.includes('/api/orders/my-orders') ||
      url.includes('/api/auth/me') ||
      url.includes('/api/auth/profile');

    // Check if endpoint is Admin-oriented
    const isAdminEndpoint =
      url.includes('/api/admin') ||
      url.includes('/api/orders/stats') ||
      url === '/api/orders' ||
      url.startsWith('/api/orders?') ||
      url.includes('/api/orders/all') ||
      url.includes('/api/upload') ||
      (url.includes('/api/contact') && method !== 'POST') ||
      (url.includes('/api/products') && method !== 'GET') ||
      isAdminPage;

    // 1. If admin endpoint or on admin page: prioritize Admin Token
    if (isAdminEndpoint && !isCustomerOnlyEndpoint) {
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
        return config;
      }
    }

    // 2. If customer endpoint: prioritize User Token
    if (isCustomerOnlyEndpoint) {
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
        return config;
      }
    }

    // 3. General fallback: attach admin token if available, otherwise user token
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Global Response Interceptor
 * Gracefully handles 401 / 403 unauthorized responses
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // If an admin call returns 401/403, check if we need to clean stale admin token
    if (status === 401 || status === 403) {
      const isAdminPage =
        typeof window !== 'undefined' &&
        window.location &&
        window.location.pathname.startsWith('/admin') &&
        window.location.pathname !== '/admin/login';

      if (isAdminPage && (url.includes('/api/admin') || url.includes('/api/orders'))) {
        console.warn(`[API Auth Warning] 401 Unauthorized for ${url}. Stale or missing admin token.`);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
