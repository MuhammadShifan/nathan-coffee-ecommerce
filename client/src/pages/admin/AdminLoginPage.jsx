import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Coffee, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SEOMeta from '../../components/SEOMeta';

const AdminLoginPage = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@nadhancoffee.com');
  const [password, setPassword] = useState('Nadhan@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorAlert, setErrorAlert] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorAlert(null);

    const result = await login(email, password);
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setErrorAlert(result.message || 'Invalid admin credentials');
    }
  };

  return (
    <>
      <SEOMeta
        title="Admin Portal Login -Nathan Coffee Mart"
        description="Secure admin access portal forNathan Coffee order and product inventory management."
        canonicalUrl="https://nadhancoffee.com/admin/login"
        includeLocalBusiness={false}
      />

      <div className="min-h-screen bg-gradient-to-br from-brand-coffee-950 via-brand-coffee-900 to-brand-pink-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Ambient background glows */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-brand-pink-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-brand-yellow-500/15 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border-2 border-brand-pink-500/30 relative z-10 space-y-6"
        >
          {/* Logo & Portal Branding */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-brand-pink-600 text-white shadow-lg ring-4 ring-brand-yellow-400/40">
              <Coffee className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-brand-coffee-950 tracking-tight">
                Nathan Coffee
              </h1>
              <p className="text-xs font-bold text-brand-pink-600 uppercase tracking-widest mt-0.5">
                Admin Management Portal
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {errorAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorAlert}</span>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-coffee-800 mb-1">
                Admin Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-coffee-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nadhancoffee.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-xs text-brand-coffee-900 bg-brand-coffee-50/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-coffee-800 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-coffee-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-xs text-brand-coffee-900 bg-brand-coffee-50/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-brand-coffee-400 hover:text-brand-coffee-700 p-0.5"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 text-white rounded-xl font-bold text-xs shadow-lg shadow-brand-pink-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 btn-shimmer"
            >
              <span>{loading ? 'Authenticating...' : 'Secure Login to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Info */}
          <div className="p-3.5 rounded-2xl bg-brand-yellow-50 border border-brand-yellow-200 text-[11px] text-brand-coffee-800 space-y-1">
            <div className="flex items-center gap-1 font-bold text-brand-coffee-950">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-yellow-600" />
              <span>Default Master Credentials:</span>
            </div>
            <p className="font-mono text-[10px]">
              Email: <strong>admin@nadhancoffee.com</strong> | Pass: <strong>Nadhan@2026</strong>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminLoginPage;
