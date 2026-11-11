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
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

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
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];
  const phoneInputRef = useRef(null);

  // Cleanup reCAPTCHA helper
  function resetRecaptcha() {
    if (typeof window !== 'undefined' && window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        // ignore
      }
      window.recaptchaVerifier = null;
    }
  }

  // Setup Firebase RecaptchaVerifier helper
  function setupRecaptcha() {
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          setErrorMessage('reCAPTCHA expired. Please try sending OTP again.');
        },
      });
    }
    return window.recaptchaVerifier;
  }

  // Initialize or clear state when modal open/closes
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep('phone');
      setErrorMessage('');
      setOtpValues(['', '', '', '', '', '']);
      setConfirmationResult(null);
      setResendTimer(30);
      setCanResend(false);
      setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 100);
    } else {
      resetRecaptcha();
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

  // Clean up reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      resetRecaptcha();
    };
  }, []);

  if (!isAuthModalOpen) return null;

  // Handle Phone input formatting (digits only, max 10)
  const handlePhoneChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (rawVal.length <= 10) {
      setMobileNumber(rawVal);
      setErrorMessage('');
    }
  };

  // Submit Phone Number -> Request OTP via Firebase SMS
  const handleSendOtpSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage('');

    if (!mobileNumber || mobileNumber.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    setSendingOtp(true);
    try {
      const appVerifier = setupRecaptcha();
      const formattedPhoneNumber = `+91${mobileNumber}`;

      const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      setConfirmationResult(confirmation);

      setStep('otp');
      setResendTimer(30);
      setCanResend(false);
      showToast(`SMS OTP sent to +91 ${mobileNumber} 📲`, 'success');

      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 150);
    } catch (err) {
      console.error('Firebase signInWithPhoneNumber Error:', err);
      resetRecaptcha();
      let msg = 'Failed to send SMS OTP. Please check your number and try again.';
      if (err.code === 'auth/invalid-phone-number') {
        msg = 'Invalid mobile number. Please enter a valid 10-digit number.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many requests. Please wait a few moments before trying again.';
      } else if (err.code === 'auth/quota-exceeded') {
        msg = 'SMS quota exceeded for today. Please try again later.';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
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

  // Submit OTP -> Verify with Firebase & backend
  const triggerVerify = async (otpToVerify) => {
    const otpCode = otpToVerify || otpValues.join('');
    if (otpCode.length !== 6) {
      setErrorMessage('Please enter the full 6-digit OTP');
      return;
    }

    if (!confirmationResult) {
      setErrorMessage('Session expired. Please request a new OTP.');
      return;
    }

    setErrorMessage('');
    setVerifyingOtp(true);
    try {
      // 1. Confirm OTP with Firebase
      const userCredential = await confirmationResult.confirm(otpCode);
      const firebaseUser = userCredential.user;

      // 2. Retrieve Firebase ID Token
      const firebaseToken = await firebaseUser.getIdToken();

      // 3. Make POST request to backend verifyOTP endpoint
      const res = await api.post('/api/auth/verifyOTP', {
        firebaseToken,
      });

      if (res.data && res.data.success && res.data.token) {
        const receivedToken = res.data.token;
        const receivedUser = res.data.user;

        // 1. Save authentication token in localStorage
        localStorage.setItem('Nathan_user_token', receivedToken);
        if (receivedUser) {
          localStorage.setItem('Nathan_user_info', JSON.stringify(receivedUser));
        }

        // 2. Update user's authenticated state
        if (typeof setUser === 'function') setUser(receivedUser);
        if (typeof setUserToken === 'function') setUserToken(receivedToken);

        // 3. Close the modal
        closeAuthModal();

        showToast(`Welcome back, +91 ${mobileNumber}! ☕`, 'success');
      } else {
        setErrorMessage(res.data?.message || 'Server verification failed');
      }
    } catch (err) {
      console.error('OTP Verification Error:', err);
      let msg = 'Invalid or expired verification code. Please try again.';
      if (err.code === 'auth/invalid-verification-code') {
        msg = 'Incorrect 6-digit verification code. Please check and re-enter.';
      } else if (err.code === 'auth/code-expired') {
        msg = 'The verification code has expired. Please resend a new OTP.';
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Invisible reCAPTCHA container */}
        <div id="recaptcha-container"></div>

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
            {/* Background glowing blur circles */}
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
                      inputMode="numeric"
                      value={mobileNumber}
                      onChange={handlePhoneChange}
                      placeholder="98765 43210"
                      maxLength={10}
                      autoComplete="tel"
                      className="w-full pl-24 pr-4 py-3.5 bg-brand-coffee-50/50 border border-brand-coffee-200 focus:border-brand-pink-500 focus:bg-white rounded-2xl text-base font-bold text-brand-coffee-950 placeholder-brand-coffee-400 focus:outline-none focus:ring-2 focus:ring-brand-pink-500/20 transition-all tracking-wider"
                    />
                  </div>
                  <p className="text-[11px] text-brand-coffee-500 mt-1.5">
                    We'll send a 6-digit verification code via SMS to your mobile phone.
                  </p>
                </div>

                {/* SMS Info Card */}
                <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-2 text-xs text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Instant SMS Verification:</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Enter your 10-digit mobile number to receive your one-time code via SMS.
                    </p>
                  </div>
                </div>

                <button
                  id="modal-send-otp-btn"
                  type="submit"
                  disabled={mobileNumber.length !== 10 || sendingOtp}
                  className="w-full py-3.5 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-pink-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] btn-shimmer"
                >
                  {sendingOtp ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending SMS OTP...</span>
                    </div>
                  ) : (
                    <>
                      <span>Get OTP via SMS</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: OTP VERIFICATION */}
            {step === 'otp' && (
              <div className="space-y-5">
                {/* Mobile number chip with edit button */}
                <div className="flex items-center justify-between p-2.5 bg-brand-coffee-50 rounded-xl border border-brand-coffee-200 text-xs">
                  <div className="flex items-center gap-2 text-brand-coffee-800 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-brand-pink-600" />
                    <span>+91 {mobileNumber}</span>
                  </div>
                  <button
                    onClick={() => {
                      setStep('phone');
                      setErrorMessage('');
                    }}
                    className="flex items-center gap-1 text-brand-pink-600 hover:text-brand-pink-700 font-bold transition-colors"
                  >
                    <Edit2 className="w-3 h-3" /> Change
                  </button>
                </div>

                {/* 6-digit Segmented OTP inputs */}
                <div>
                  <label className="block text-center text-xs font-bold text-brand-coffee-900 uppercase tracking-wider mb-3">
                    Enter 6-Digit OTP Code
                  </label>
                  <div className="flex justify-center gap-1.5 sm:gap-2.5" onPaste={handlePaste}>
                    {otpValues.map((val, idx) => (
                      <input
                        key={idx}
                        ref={inputRefs[idx]}
                        id={`otp-input-${idx}`}
                        type="tel"
                        maxLength={1}
                        inputMode="numeric"
                        value={val}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black text-brand-pink-700 bg-brand-coffee-50/70 border-2 border-brand-coffee-200 focus:border-brand-pink-600 focus:bg-white rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-pink-500/20 transition-all shadow-sm"
                      />
                    ))}
                  </div>
                </div>

                {/* Submit Verification Button */}
                <button
                  id="modal-verify-otp-btn"
                  type="button"
                  onClick={() => triggerVerify()}
                  disabled={otpValues.join('').length !== 6 || verifyingOtp}
                  className="w-full py-3.5 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-pink-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] btn-shimmer"
                >
                  {verifyingOtp ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Code...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Continue</span>
                    </>
                  )}
                </button>

                {/* Resend OTP Section */}
                <div className="flex items-center justify-between text-xs text-brand-coffee-600 pt-1">
                  <span>Didn't receive SMS?</span>
                  {canResend ? (
                    <button
                      onClick={handleSendOtpSubmit}
                      className="font-bold text-brand-pink-600 hover:text-brand-pink-700 flex items-center gap-1 hover:underline"
                    >
                      <RefreshCw className="w-3 h-3" /> Resend OTP
                    </button>
                  ) : (
                    <span className="text-brand-coffee-500 font-medium">
                      Resend in <strong className="text-brand-coffee-800 font-bold">{resendTimer}s</strong>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
