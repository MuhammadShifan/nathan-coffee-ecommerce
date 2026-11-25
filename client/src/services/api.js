import axios from 'axios';
import { safeLocalStorage, safeSessionStorage } from '../utils/storage';

export const getAdminToken = () => {
  try {
    const localTokens = [
      safeLocalStorage.getItem('Nathan_admin_token'),
      safeLocalStorage.getItem('admin_token'),
      safeLocalStorage.getItem('adminToken'),
    ];
    for (const t of localTokens) {
      if (t && typeof t === 'string' && t.trim()) {
        return t.trim().replace(/^Bearer\s+/i, '');
      }
    }

    const adminInfoKeys = ['Nathan_admin_info', 'admin_info', 'admin'];
    for (const key of adminInfoKeys) {
      const info = safeLocalStorage.getItem(key);
      if (info) {
        const parsed = JSON.parse(info);
        const token = parsed?.token || parsed?.data?.token || parsed?.accessToken;
        if (token && typeof token === 'string' && token.trim()) {
          return token.trim().replace(/^Bearer\s+/i, '');
        }
      }
    }

    const sessionToken =
      safeSessionStorage.getItem('Nathan_admin_token') ||
      safeSessionStorage.getItem('admin_token');
    if (sessionToken && sessionToken.trim()) {
      return sessionToken.trim().replace(/^Bearer\s+/i, '');
    }
  } catch (e) {
    console.warn('Failed to retrieve admin token:', e);
  }
  return null;
};

export const getUserToken = () => {
  try {
    const localTokens = [
      safeLocalStorage.getItem('Nathan_user_token'),
      safeLocalStorage.getItem('user_token'),
    ];
    for (const t of localTokens) {
      if (t && typeof t === 'string' && t.trim()) {
        return t.trim().replace(/^Bearer\s+/i, '');
      }
    }

    const userInfo = safeLocalStorage.getItem('Nathan_user_info');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      const token = parsed?.token || parsed?.data?.token;
      if (token && typeof token === 'string' && token.trim()) {
        return token.trim().replace(/^Bearer\s+/i, '');
      }
    }
  } catch (e) {
    console.warn('Failed to retrieve user token:', e);
  }
  return null;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const adminToken = getAdminToken();
    const userToken = getUserToken();

    const url = config.url || '';
    const method = (config.method || 'GET').toUpperCase();

    const isAdminPage =
      typeof window !== 'undefined' &&
      window.location &&
      window.location.pathname.startsWith('/admin');

    const setAuthHeader = (token, isAdmin = false) => {
      if (!token) return;
      const cleanToken = token.trim().replace(/^Bearer\s+/i, '');
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${cleanToken}`);
        if (isAdmin) {
          config.headers.set('x-admin-token', cleanToken);
        } else {
          config.headers.delete('x-admin-token');
        }
      } else {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${cleanToken}`;
        config.headers['Authorization'] = `Bearer ${cleanToken}`;
        if (isAdmin) {
          config.headers['x-admin-token'] = cleanToken;
        } else {
          delete config.headers['x-admin-token'];
        }
      }
    };

    const isAdminApi =
      url.startsWith('/api/admin') ||
      url.includes('/api/orders/stats') ||
      url.includes('/api/upload') ||
      (url.startsWith('/api/images') && method !== 'GET') ||
      (url.startsWith('/api/products') && method !== 'GET') ||
      (url.startsWith('/api/contact') && method !== 'POST');

    if (isAdminPage || isAdminApi) {
      if (adminToken) {
        setAuthHeader(adminToken, true);
      } else if (userToken) {
        setAuthHeader(userToken, false);
      }
    } else {
      if (userToken) {
        setAuthHeader(userToken, false);
      } else if (adminToken && isAdminApi) {
        setAuthHeader(adminToken, true);
      }
    }

    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
        if (typeof config.headers.delete === 'function') {
          config.headers.delete('Content-Type');
          config.headers.delete('content-type');
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    if (status === 401 || status === 403) {
      const isAdminPage =
        typeof window !== 'undefined' &&
        window.location &&
        window.location.pathname.startsWith('/admin') &&
        window.location.pathname !== '/admin/login';

      if (isAdminPage) {
        console.warn(`[API Auth Warning] ${status} for ${url}. Admin session issue:`, error.response?.data?.message);
      } else {
        if (
          url.includes('/api/orders/my-orders') ||
          url.includes('/api/auth/me') ||
          url.includes('/api/auth/profile')
        ) {
          try {
            safeLocalStorage.removeItem('Nathan_user_token');
            safeLocalStorage.removeItem('Nathan_user_info');
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('nathan:user:session_expired'));
            }
          } catch (e) {}
        }
      }
    }

    return Promise.reject(error);
  }
);

export const uploadProductImages = async (formData, customOptions = {}) => {
  const adminToken = getAdminToken();
  const headers = {
    ...(customOptions.headers || {}),
  };
  if (adminToken) {
    headers.Authorization = `Bearer ${adminToken}`;
  }

  return api.post('/api/upload', formData, {
    ...customOptions,
    headers,
  });
};

export const createProduct = async (productData, customOptions = {}) => {
  const adminToken = getAdminToken();
  const headers = {
    ...(customOptions.headers || {}),
  };
  if (adminToken) {
    headers.Authorization = `Bearer ${adminToken}`;
  }

  return api.post('/api/products', productData, {
    ...customOptions,
    headers,
  });
};

export const updateProduct = async (productId, productData, customOptions = {}) => {
  const adminToken = getAdminToken();
  const headers = {
    ...(customOptions.headers || {}),
  };
  if (adminToken) {
    headers.Authorization = `Bearer ${adminToken}`;
  }

  return api.put(`/api/products/${productId}`, productData, {
    ...customOptions,
    headers,
  });
};

export const toggleProductStock = async (productId, customOptions = {}) => {
  const adminToken = getAdminToken();
  const headers = {
    ...(customOptions.headers || {}),
  };
  if (adminToken) {
    headers.Authorization = `Bearer ${adminToken}`;
  }

  return api.put(`/api/products/${productId}/toggle-stock`, {}, {
    ...customOptions,
    headers,
  });
};

export const deleteProduct = async (productId, customOptions = {}) => {
  const adminToken = getAdminToken();
  const headers = {
    ...(customOptions.headers || {}),
  };
  if (adminToken) {
    headers.Authorization = `Bearer ${adminToken}`;
  }

  return api.delete(`/api/products/${productId}`, {
    ...customOptions,
    headers,
  });
};

export const reorderProducts = async (productIds, customOptions = {}) => {
  const adminToken = getAdminToken();
  const headers = {
    ...(customOptions.headers || {}),
  };
  if (adminToken) {
    headers.Authorization = `Bearer ${adminToken}`;
  }

  return api.put('/api/products/reorder', { productIds }, {
    ...customOptions,
    headers,
  });
};

export const deleteUploadedImage = async (imageUrlOrId) => {
  if (!imageUrlOrId || typeof imageUrlOrId !== 'string') return;
  const match = imageUrlOrId.match(/\/api\/images\/([a-f0-9]{24})/i);
  const id = match ? match[1] : imageUrlOrId;
  if (!/^[a-f0-9]{24}$/i.test(id)) return;
  const adminToken = getAdminToken();
  const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
  return api.delete(`/api/images/${id}`, { headers });
};

export const fetchProductsWithRetry = async ({ maxRetries = 2, onRetry } = {}) => {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await api.get('/api/products', { timeout: 30000 });
      if (res.data?.success && Array.isArray(res.data?.data)) {
        return res.data.data;
      }
      throw new Error(res.data?.message || 'Unexpected response from server');
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      const isRetryable = !status || status >= 500 || err.code === 'ECONNABORTED';
      if (!isRetryable || attempt === maxRetries) {
        break;
      }
      if (typeof onRetry === 'function') {
        onRetry(attempt + 1);
      }
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
    }
  }
  throw lastError;
};

export default api;
