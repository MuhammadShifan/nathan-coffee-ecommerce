import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { safeLocalStorage, safeGetJSON, safeSetJSON } from '../utils/storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    return safeGetJSON('local', 'Nathan_admin_info', null);
  });
  const [adminLoading, setAdminLoading] = useState(false);

  const login = async (email, password) => {
    setAdminLoading(true);
    try {
      const res = await api.post('/api/admin/login', { email, password });
      if (res.data.success && res.data.data) {
        const adminData = res.data.data;
        const token = adminData.token;
        setAdmin(adminData);
        safeSetJSON('local', 'Nathan_admin_info', adminData);
        if (token) {
          safeLocalStorage.setItem('Nathan_admin_token', token);
          safeLocalStorage.setItem('admin_token', token);
          safeLocalStorage.setItem('adminToken', token);
        }
        setAdminLoading(false);
        return { success: true, data: adminData };
      }
      setAdminLoading(false);
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (error) {
      setAdminLoading(false);
      const msg = error.response?.data?.message || error.message || 'Invalid credentials';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setAdmin(null);
    safeLocalStorage.removeItem('Nathan_admin_info');
    safeLocalStorage.removeItem('Nathan_admin_token');
    safeLocalStorage.removeItem('admin_token');
    safeLocalStorage.removeItem('adminToken');
  };

  const [user, setUser] = useState(() => {
    return safeGetJSON('local', 'Nathan_user_info', null);
  });

  const [userToken, setUserToken] = useState(() => {
    return safeLocalStorage.getItem('Nathan_user_token') || null;
  });

  const [userLoading, setUserLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authSuccessCallback, setAuthSuccessCallback] = useState(null);

  useEffect(() => {
    const verifyCurrentUserSession = async () => {
      const storedToken = safeLocalStorage.getItem('Nathan_user_token');
      if (!storedToken) return;

      try {
        const res = await api.get('/api/auth/me');
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          safeSetJSON('local', 'Nathan_user_info', res.data.user);
        } else {
          logoutUser();
        }
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.warn('User session expired or invalid token');
          logoutUser();
        }
      }
    };

    verifyCurrentUserSession();

    const handleSessionExpired = () => {
      setUser(null);
      setUserToken(null);
    };

    window.addEventListener('nathan:user:session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('nathan:user:session_expired', handleSessionExpired);
    };
  }, []);

  const openAuthModal = (onSuccess = null) => {
    if (typeof onSuccess === 'function') {
      setAuthSuccessCallback(() => onSuccess);
    } else {
      setAuthSuccessCallback(null);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthSuccessCallback(null);
  };

  const sendOtp = async (phoneNumber) => {
    setUserLoading(true);
    try {
      const res = await api.post('/api/auth/send-otp', {
        phoneNumber,
        mobileNumber: phoneNumber,
      });
      setUserLoading(false);
      return res.data;
    } catch (error) {
      setUserLoading(false);
      const msg = error.response?.data?.message || error.message || 'Failed to send OTP';
      return { success: false, message: msg };
    }
  };

  const verifyOtp = async (phoneNumber, otp, sessionId) => {
    setUserLoading(true);
    try {
      const payload = typeof phoneNumber === 'object'
        ? phoneNumber
        : { phoneNumber, otp, sessionId };
      const res = await api.post('/api/auth/verify-otp', payload);

      if (res.data.success && res.data.token) {
        const receivedUser = res.data.user;
        const receivedToken = res.data.token;

        setUser(receivedUser);
        setUserToken(receivedToken);

        safeLocalStorage.setItem('Nathan_user_token', receivedToken);
        safeSetJSON('local', 'Nathan_user_info', receivedUser);

        setUserLoading(false);
        setIsAuthModalOpen(false);

        if (typeof authSuccessCallback === 'function') {
          const cb = authSuccessCallback;
          setAuthSuccessCallback(null);
          setTimeout(() => cb(receivedUser), 100);
        }

        return { success: true, user: receivedUser, token: receivedToken };
      }

      setUserLoading(false);
      return { success: false, message: res.data.message || 'OTP verification failed' };
    } catch (error) {
      setUserLoading(false);
      const msg = error.response?.data?.message || error.message || 'Invalid OTP. Please try again.';
      return { success: false, message: msg };
    }
  };

  const logoutUser = () => {
    setUser(null);
    setUserToken(null);
    safeLocalStorage.removeItem('Nathan_user_token');
    safeLocalStorage.removeItem('Nathan_user_info');
  };

  const updateUserProfile = async (profileData) => {
    try {
      const res = await api.put('/api/auth/profile', profileData);
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        safeSetJSON('local', 'Nathan_user_info', res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: Boolean(
          admin?.token ||
          safeLocalStorage.getItem('Nathan_admin_token') ||
          safeLocalStorage.getItem('admin_token')
        ),
        adminLoading,
        login,
        logout,

        user,
        setUser,
        userToken,
        setUserToken,
        isUserAuthenticated: !!userToken && !!user,
        userLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        sendOtp,
        verifyOtp,
        logoutUser,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
