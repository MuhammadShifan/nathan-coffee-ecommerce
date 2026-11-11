import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Edit2,
  RefreshCw,
  Lock,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    setUser,
    setUserToken,
  } = useAuth();

  const { showToast } = useCart();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [mobileNumber, setMobileNumber] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];
  const phoneInputRef = useRef(null);

  // Initialize or clear state when modal opens/closes
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep('phone');
      setErrorMessage('');
      setOtpValues(['', '', '', '', '', '']);
      setSessionId('');
      setResendTimer(30);
      setCanResend(false);
      setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 100);
    }
  }, [isAuthModalOpen]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer;
    if (step === 'otp' && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  if (!isAuthModalOpen) return null;

  // Handle Phone input formatting (digits only, max 10)
  const handlePhoneChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (rawVal.length <= 10) {
      setMobileNumber(rawVal);
      setErrorMessage('');
    }
  };

  // Step 1: Submit Phone Number -> Request OTP via 2Factor.in
  const handleSendOtpSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage('');

    if (!mobileNumber || mobileNumber.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await api.post('/api/auth/send-otp', {
        phoneNumber: mobileNumber,
        mobileNumber: mobileNumber,
      });

      if (res.data && res.data.success && res.data.sessionId) {
        setSessionId(res.data.sessionId);
        setStep('otp');
        setResendTimer(30);
        setCanResend(false);
        showToast(`SMS OTP sent to +91 ${mobileNumber} 📲`, 'success');

        setTimeout(() => {
          inputRefs[0].current?.focus();
        }, 150);
      } else {
        setErrorMessage(res.data?.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('2Factor Send OTP Error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to send SMS OTP. Please check your connection.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle segmented OTP input typing & backspace
  const handleOtpChange = (index, value) => {
    const char = value.slice(-1).replace(/\D/g, '');
    const newOtp = [...otpValues];
    newOtp[index] = char;
    setOtpValues(newOtp);
    setErrorMessage('');

    // Auto advance focus
    if (char && index < 5) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto submit if 6 digits filled
    const joined = newOtp.join('');
    if (joined.length === 6 && index === 5 && char) {
      triggerVerify(joined);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = ['', '', '', '', '', ''];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtpValues(newOtp);
      if (pastedData.length === 6) {
        triggerVerify(pastedData);
      } else {
        inputRefs[Math.min(pastedData.length, 5)].current?.focus();
      }
    }
  };

  // Step 2: Submit OTP -> Verify via 2Factor.in with backend
  const triggerVerify = async (otpToVerify) => {
    const otpCode = otpToVerify || otpValues.join('');
    if (otpCode.length !== 6) {
      setErrorMessage('Please enter the full 6-digit OTP code');
      return;
    }

    if (!sessionId) {
      setErrorMessage('Session expired. Please request a new OTP.');
      return;
    }

    setErrorMessage('');
    setVerifyingOtp(true);

    try {
      const res = await api.post('/api/auth/verify-otp', {
        phoneNumber: mobileNumber,
        mobileNumber: mobileNumber,
        otp: otpCode,
        sessionId: sessionId,
      });

      if (res.data && res.data.success && res.data.token) {
        const receivedToken = res.data.token;
        const receivedUser = res.data.user;

        // 1. Save authentication token in localStorage
        localStorage.setItem('Nathan_user_token', receivedToken);
        if (receivedUser) {
          localStorage.setItem('Nathan_user_info', JSON.stringify(receivedUser));
        }

        // 2. Update user's authenticated state in context
        if (typeof setUser === 'function') setUser(receivedUser);
        if (typeof setUserToken === 'function') setUserToken(receivedToken);

        // 3. Close the modal
        closeAuthModal();

        showToast(`Welcome to Nathan Coffee, +91 ${mobileNumber}! ☕`, 'success');
      } else {
        setErrorMessage(res.data?.message || 'Verification failed. Incorrect OTP.');
        showToast(res.data?.message || 'Invalid OTP', 'error');
      }
    } catch (err) {
      console.error('2Factor Verify OTP Error:', err);
      const msg = err.response?.data?.message || err.message || 'Invalid or expired OTP code. Please try again.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-brand-coffee-950/70 backdrop-blur-md transition-opacity"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-brand-pink-100 overflow-hidden z-10 my-8"
        >
          {/* Top Decorative Header */}
          <div className="bg-gradient-to-r from-brand-pink-700 via-brand-pink-600 to-brand-pink-800 p-6 text-white text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-yellow-400/20 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-brand-pink-400/30 rounded-full blur-xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Brand Logo & Tag */}
            <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 mb-3 shadow-inner">
              <Coffee className="w-7 h-7 text-brand-yellow-300" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
              Nathan Coffee
            </h3>
            <p className="text-xs text-brand-pink-100 mt-1 font-medium">
              {step === 'phone'
                ? 'Login with Mobile OTP to access checkout & orders'
                : `Enter 6-digit code sent to +91 ${mobileNumber}`}
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-7 space-y-5">
            {/* Error Notification Banner */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-semibold"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* STEP 1: MOBILE NUMBER INPUT */}
            {step === 'phone' && (
              <form onSubmit={handleSendOtpSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="mobile-input-modal"
                    className="block text-xs font-bold text-brand-coffee-900 uppercase tracking-wider mb-2"
                  >
                    Mobile Number <span className="text-brand-pink-600">*</span>
                  </label>

                  <div className="relative flex items-center">
                    {/* Country Code Prefix */}
                    <div className="absolute left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-coffee-100/80 border border-brand-coffee-200 text-brand-coffee-900 font-extrabold text-sm select-none">
                      <span className="text-sm">🇮🇳</span>
                      <span>+91</span>
                    </div>

                    <input
                      ref={phoneInputRef}
                      id="mobile-input-modal"
                      type="tel"
                      value={mobileNumber}
                      onChange={handlePhoneChange}
                      placeholder="98765 43210"
                      maxLength={10}
                      required
                      autoComplete="tel"
                      className="w-full pl-24 pr-4 py-3.5 rounded-2xl border-2 border-brand-coffee-200 focus:border-brand-pink-500 focus:ring-4 focus:ring-brand-pink-500/15 focus:outline-none text-base font-bold tracking-wider text-brand-coffee-950 bg-white placeholder-brand-coffee-300 transition-all shadow-inner"
                    />
                  </div>
                  <p className="text-[11px] text-brand-coffee-500 mt-2 flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Instant 6-digit SMS OTP via 2Factor.in</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={sendingOtp || mobileNumber.length !== 10}
                  className="w-full py-4 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 disabled:opacity-50 text-white rounded-2xl font-black text-sm sm:text-base shadow-xl shadow-brand-pink-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] btn-shimmer ring-2 ring-brand-yellow-400/30"
                >
                  {sendingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending SMS OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
            {step === 'otp' && (
              <div className="space-y-4">
                {/* Active Phone Display + Change Action */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-brand-pink-50/70 border border-brand-pink-200 text-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-pink-600" />
                    <span className="text-brand-coffee-700 font-semibold">Sent to:</span>
                    <span className="font-extrabold text-brand-pink-700 font-mono">+91 {mobileNumber}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setErrorMessage('');
                      setOtpValues(['', '', '', '', '', '']);
                      setTimeout(() => phoneInputRef.current?.focus(), 100);
                    }}
                    className="text-brand-pink-600 hover:text-brand-pink-800 font-bold flex items-center gap-1 hover:underline text-[11px]"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-coffee-900 uppercase tracking-wider mb-2 text-center">
                    Enter 6-Digit OTP Code
                  </label>

                  {/* Segmented OTP Input Grid */}
                  <div
                    className="flex items-center justify-center gap-2 sm:gap-2.5"
                    onPaste={handlePaste}
                  >
                    {otpValues.map((val, idx) => (
                      <input
                        key={idx}
                        ref={inputRefs[idx]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={val}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-xl border-2 border-brand-coffee-200 focus:border-brand-pink-600 focus:ring-4 focus:ring-brand-pink-500/15 focus:outline-none text-brand-coffee-950 bg-brand-coffee-50/40 transition-all"
                      />
                    ))}
                  </div>
                </div>

                {/* Submit OTP Button */}
                <button
                  type="button"
                  onClick={() => triggerVerify()}
                  disabled={verifyingOtp || otpValues.join('').length !== 6}
                  className="w-full py-4 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 disabled:opacity-50 text-white rounded-2xl font-black text-sm sm:text-base shadow-xl shadow-brand-pink-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] btn-shimmer ring-2 ring-brand-yellow-400/30"
                >
                  {verifyingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying with 2Factor...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Verify OTP & Log In</span>
                    </>
                  )}
                </button>

                {/* Resend OTP Section */}
                <div className="text-center pt-2">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleSendOtpSubmit}
                      disabled={sendingOtp}
                      className="text-xs font-bold text-brand-pink-600 hover:text-brand-pink-800 flex items-center justify-center gap-1.5 mx-auto hover:underline"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${sendingOtp ? 'animate-spin' : ''}`} />
                      <span>{sendingOtp ? 'Resending...' : 'Resend SMS OTP'}</span>
                    </button>
                  ) : (
                    <p className="text-xs text-brand-coffee-500 font-medium">
                      Resend code in <strong className="text-brand-coffee-800 font-bold">{resendTimer}s</strong>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Highlights */}
          <div className="px-6 py-4 bg-brand-coffee-50 border-t border-brand-coffee-100 flex items-center justify-between text-[11px] text-brand-coffee-600">
            <span className="flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              100% Pure Coffee
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-yellow-600" />
              Verified Checkout
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
