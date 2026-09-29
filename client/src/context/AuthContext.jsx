import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // ----------------------------------------------------
  // Admin State & Methods
  // ----------------------------------------------------
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('nadhan_admin_info');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
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
        localStorage.setItem('nadhan_admin_info', JSON.stringify(adminData));
        if (token) {
          localStorage.setItem('nadhan_admin_token', token);
          localStorage.setItem('admin_token', token);
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
    localStorage.removeItem('nadhan_admin_info');
    localStorage.removeItem('nadhan_admin_token');
    localStorage.removeItem('admin_token');
  };

  // ----------------------------------------------------
  // Customer / User OTP Auth State & Methods
  // ----------------------------------------------------
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nadhan_user_info');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [userToken, setUserToken] = useState(() => {
    try {
      return localStorage.getItem('nadhan_user_token') || null;
    } catch (e) {
      return null;
    }
  });

  const [userLoading, setUserLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authSuccessCallback, setAuthSuccessCallback] = useState(null);

  // Sync token & verify current user on mount if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (userToken && !user) {
        try {
          const res = await api.get('/api/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('nadhan_user_info', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid token');
          logoutUser();
        }
      }
    };
    fetchCurrentUser();
  }, [userToken]);

  /**
   * Open the login modal with an optional callback to execute upon successful login
   * @param {Function} [onSuccess] - Callback function, e.g. () => navigate('/checkout')
   */
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

  /**
   * Request OTP for a 10-digit mobile number
   */
  const sendOtp = async (mobileNumber) => {
    setUserLoading(true);
    try {
      const res = await api.post('/api/auth/send-otp', { mobileNumber });
      setUserLoading(false);
      return res.data;
    } catch (error) {
      setUserLoading(false);
      const msg = error.response?.data?.message || error.message || 'Failed to send OTP';
      return { success: false, message: msg };
    }
  };

  /**
   * Verify entered OTP and log the user in
   */
  const verifyOtp = async (mobileNumber, otp, extraData = {}) => {
    setUserLoading(true);
    try {
      const res = await api.post('/api/auth/verify-otp', {
        mobileNumber,
        otp,
        ...extraData,
      });

      if (res.data.success && res.data.token) {
        const receivedUser = res.data.user;
        const receivedToken = res.data.token;

        setUser(receivedUser);
        setUserToken(receivedToken);

        localStorage.setItem('nadhan_user_token', receivedToken);
        localStorage.setItem('nadhan_user_info', JSON.stringify(receivedUser));

        setUserLoading(false);
        setIsAuthModalOpen(false);

        // If a callback was pending (e.g. checkout redirect), trigger it
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

  /**
   * Log out current user customer session
   */
  const logoutUser = () => {
    setUser(null);
    setUserToken(null);
    localStorage.removeItem('nadhan_user_token');
    localStorage.removeItem('nadhan_user_info');
  };

  /**
   * Update user profile
   */
  const updateUserProfile = async (profileData) => {
    try {
      const res = await api.put('/api/auth/profile', profileData);
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('nadhan_user_info', JSON.stringify(res.data.user));
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
        // Admin
        admin,
        isAuthenticated: Boolean(
          admin?.token ||
          (typeof window !== 'undefined' && (localStorage.getItem('nadhan_admin_token') || localStorage.getItem('admin_token')))
        ),
        adminLoading,
        login,
        logout,

        // Customer User
        user,
        userToken,
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
