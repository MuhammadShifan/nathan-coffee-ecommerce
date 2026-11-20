const createMemoryStorage = () => {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => {
      map.set(key, String(value));
      return true;
    },
    removeItem: (key) => {
      map.delete(key);
    },
    clear: () => {
      map.clear();
    },
    key: (index) => Array.from(map.keys())[index] || null,
    get length() {
      return map.size;
    },
  };
};

const memoryLocal = createMemoryStorage();
const memorySession = createMemoryStorage();

const testStorage = (type) => {
  try {
    if (typeof window === 'undefined') return null;
    const storage = window[type];
    if (!storage) return null;
    const testKey = `__test_${type}__`;
    storage.setItem(testKey, testKey);
    const result = storage.getItem(testKey);
    storage.removeItem(testKey);
    return result === testKey ? storage : null;
  } catch (e) {
    return null;
  }
};

const actualLocalStorage = testStorage('localStorage');
const actualSessionStorage = testStorage('sessionStorage');

if (typeof window !== 'undefined') {
  if (!actualLocalStorage) {
    try {
      Object.defineProperty(window, 'localStorage', {
        value: memoryLocal,
        configurable: true,
        writable: true,
      });
    } catch (e) {}
  }
  if (!actualSessionStorage) {
    try {
      Object.defineProperty(window, 'sessionStorage', {
        value: memorySession,
        configurable: true,
        writable: true,
      });
    } catch (e) {}
  }
}

export const safeLocalStorage = {
  getItem: (key) => {
    try {
      if (actualLocalStorage) {
        return actualLocalStorage.getItem(key);
      }
    } catch (e) {}
    return memoryLocal.getItem(key);
  },
  setItem: (key, value) => {
    try {
      if (actualLocalStorage) {
        actualLocalStorage.setItem(key, String(value));
        return true;
      }
    } catch (e) {}
    return memoryLocal.setItem(key, value);
  },
  removeItem: (key) => {
    try {
      if (actualLocalStorage) {
        actualLocalStorage.removeItem(key);
        return;
      }
    } catch (e) {}
    memoryLocal.removeItem(key);
  },
  clear: () => {
    try {
      if (actualLocalStorage) {
        actualLocalStorage.clear();
        return;
      }
    } catch (e) {}
    memoryLocal.clear();
  },
};

export const safeSessionStorage = {
  getItem: (key) => {
    try {
      if (actualSessionStorage) {
        return actualSessionStorage.getItem(key);
      }
    } catch (e) {}
    return memorySession.getItem(key);
  },
  setItem: (key, value) => {
    try {
      if (actualSessionStorage) {
        actualSessionStorage.setItem(key, String(value));
        return true;
      }
    } catch (e) {}
    return memorySession.setItem(key, value);
  },
  removeItem: (key) => {
    try {
      if (actualSessionStorage) {
        actualSessionStorage.removeItem(key);
        return;
      }
    } catch (e) {}
    memorySession.removeItem(key);
  },
  clear: () => {
    try {
      if (actualSessionStorage) {
        actualSessionStorage.clear();
        return;
      }
    } catch (e) {}
    memorySession.clear();
  },
};

export const safeGetJSON = (storageType, key, defaultValue = null) => {
  try {
    const storage = storageType === 'session' ? safeSessionStorage : safeLocalStorage;
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

export const safeSetJSON = (storageType, key, value) => {
  try {
    const storage = storageType === 'session' ? safeSessionStorage : safeLocalStorage;
    return storage.setItem(key, JSON.stringify(value));
  } catch (e) {
    return false;
  }
};

export default safeLocalStorage;

