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
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    sendOtp,
    verifyOtp,
    userLoading,
  } = useAuth();

  const { showToast } = useCart();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [simulatedOtpHint, setSimulatedOtpHint] = useState('');

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const phoneInputRef = useRef(null);

  // Reset state on open
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep('phone');
      setErrorMessage('');
      setOtpValues(['', '', '', '']);
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

  // Submit Phone Number -> Request OTP
  const handleSendOtpSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage('');

    if (!mobileNumber || mobileNumber.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    const res = await sendOtp(mobileNumber);
    if (res.success) {
      setStep('otp');
      setResendTimer(30);
      setCanResend(false);
      setSimulatedOtpHint(res.otp || '1234');
      showToast(`OTP sent to +91 ${mobileNumber} 📲`, 'success');
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 150);
    } else {
      setErrorMessage(res.message || 'Failed to send OTP. Please try again.');
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
    if (char && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto submit if 4 digits filled
    const joined = newOtp.join('');
    if (joined.length === 4 && index === 3 && char) {
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
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pastedData.length > 0) {
      const newOtp = ['', '', '', ''];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtpValues(newOtp);
      if (pastedData.length === 4) {
        triggerVerify(pastedData);
      } else {
        inputRefs[Math.min(pastedData.length, 3)].current?.focus();
      }
    }
  };

  // Submit OTP
  const triggerVerify = async (otpToVerify) => {
    const otpCode = otpToVerify || otpValues.join('');
    if (otpCode.length !== 4) {
      setErrorMessage('Please enter the full 4-digit OTP');
      return;
    }

    setErrorMessage('');
    const res = await verifyOtp(mobileNumber, otpCode);
    if (res.success) {
      showToast(`Welcome back, +91 ${mobileNumber}! ☕`, 'success');
    } else {
      setErrorMessage(res.message || 'Invalid verification code');
    }
  };

  const handleQuickFillDemo = () => {
    const demoCode = ['1', '2', '3', '4'];
    setOtpValues(demoCode);
    triggerVerify('1234');
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
              Nathan Coffee Mart
            </h3>
            <p className="text-xs text-brand-pink-100 mt-1 font-medium">
              {step === 'phone'
                ? 'Login with Mobile OTP to access checkout & orders'
                : `Enter 4-digit code sent to +91 ${mobileNumber}`}
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
                    We'll send a 4-digit verification code via simulated SMS.
                  </p>
                </div>

                {/* Dev Testing Hint Card */}
                <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-2 text-xs text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Instant Development Access:</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Enter any 10-digit number. Simulated OTP code is <strong className="font-black bg-amber-200 px-1 py-0.5 rounded text-brand-coffee-950">1234</strong>.
                    </p>
                  </div>
                </div>

                <button
                  id="modal-send-otp-btn"
                  type="submit"
                  disabled={mobileNumber.length !== 10 || userLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-pink-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] btn-shimmer"
                >
                  {userLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending OTP...</span>
                    </div>
                  ) : (
                    <>
                      <span>Get OTP on Mobile</span>
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

                {/* 4-digit Segmented OTP inputs */}
                <div>
                  <label className="block text-center text-xs font-bold text-brand-coffee-900 uppercase tracking-wider mb-3">
                    Enter 4-Digit OTP Code
                  </label>
                  <div className="flex justify-center gap-2.5 sm:gap-3" onPaste={handlePaste}>
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
                        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black text-brand-pink-700 bg-brand-coffee-50/70 border-2 border-brand-coffee-200 focus:border-brand-pink-600 focus:bg-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-pink-500/20 transition-all shadow-sm"
                      />
                    ))}
                  </div>
                </div>

                {/* Quick Auto-fill button for fast dev testing */}
                <button
                  type="button"
                  onClick={handleQuickFillDemo}
                  className="w-full py-2 bg-brand-pink-50 hover:bg-brand-pink-100 border border-brand-pink-200 rounded-xl text-xs font-bold text-brand-pink-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-yellow-500" />
                  <span>Click to Auto-fill Demo OTP (1234)</span>
                </button>

                {/* Submit Verification Button */}
                <button
                  id="modal-verify-otp-btn"
                  type="button"
                  onClick={() => triggerVerify()}
                  disabled={otpValues.join('').length !== 4 || userLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-pink-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] btn-shimmer"
                >
                  {userLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
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

            {/* Footer Trust Shield */}
            <div className="pt-3 border-t border-brand-coffee-100 flex items-center justify-center gap-1.5 text-[11px] text-brand-coffee-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Safe & Secure 256-bit Login • Nathan Coffee Mart</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
