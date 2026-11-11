import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Edit2,
  Lock,
} from 'lucide-react';
import api from '../services/api';

/**
 * PhoneAuth Component
 * Takes an Indian mobile number (+91), uses 2Factor.in SMS OTP API,
 * and verifies the OTP with the backend to receive the authentication JWT.
 *
 * @param {Object} props
 * @param {Function} [props.onSuccess] - Callback when verification succeeds: (data: { token, user, phoneNumber }) => void
 * @param {Function} [props.onCancel] - Optional cancel callback
 * @param {string} [props.initialPhone] - Pre-filled 10-digit phone
 * @param {string} [props.title] - Custom title
 * @param {string} [props.subtitle] - Custom subtitle
 * @param {boolean} [props.showCard=true] - Wrap in styled card or render flat
 */
const PhoneAuth = ({
  onSuccess,
  onCancel,
  initialPhone = '',
  title = 'Mobile Verification',
  subtitle = 'Login or verify your mobile number with instant SMS OTP',
  showCard = true,
}) => {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [mobileNumber, setMobileNumber] = useState(
    initialPhone ? initialPhone.replace(/\D/g, '').slice(-10) : ''
  );
  const [sessionId, setSessionId] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const phoneInputRef = useRef(null);
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  useEffect(() => {
    phoneInputRef.current?.focus();
  }, []);

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

  const handlePhoneChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (rawVal.length <= 10) {
      setMobileNumber(rawVal);
      setErrorMessage('');
    }
  };

  // Step 1: Send SMS OTP via 2Factor.in
  const handleSendOtp = async (e) => {
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
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle segmented 6-digit OTP input
  const handleOtpChange = (index, value) => {
    const char = value.slice(-1).replace(/\D/g, '');
    const newOtp = [...otpValues];
    newOtp[index] = char;
    setOtpValues(newOtp);
    setErrorMessage('');

    if (char && index < 5) {
      inputRefs[index + 1].current?.focus();
    }

    const joined = newOtp.join('');
    if (joined.length === 6 && index === 5 && char) {
      handleVerifyOtp(joined);
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
        handleVerifyOtp(pastedData);
      } else {
        inputRefs[Math.min(pastedData.length, 5)].current?.focus();
      }
    }
  };

  // Step 2: Verify OTP via 2Factor.in
  const handleVerifyOtp = async (otpToVerify) => {
    const code = otpToVerify || otpValues.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter the full 6-digit verification code');
      return;
    }

    if (!sessionId) {
      setErrorMessage('Verification session expired. Please request a new OTP.');
      return;
    }

    setErrorMessage('');
    setVerifyingOtp(true);

    try {
      const res = await api.post('/api/auth/verify-otp', {
        phoneNumber: mobileNumber,
        mobileNumber: mobileNumber,
        otp: code,
        sessionId: sessionId,
      });

      if (res.data && res.data.success && res.data.token) {
        const token = res.data.token;
        const user = res.data.user;

        if (token) {
          localStorage.setItem('Nathan_user_token', token);
        }
        if (user) {
          localStorage.setItem('Nathan_user_info', JSON.stringify(user));
        }

        if (onSuccess) {
          onSuccess({
            token,
            user,
            phoneNumber: `+91${mobileNumber}`,
          });
        }
      } else {
        setErrorMessage(res.data?.message || 'Verification failed. Incorrect OTP.');
      }
    } catch (err) {
      console.error('2Factor OTP Verification Error:', err);
      const msg = err.response?.data?.message || err.message || 'Invalid or expired OTP. Please try again.';
      setErrorMessage(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const content = (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-lg sm:text-xl font-bold text-brand-coffee-950 flex items-center gap-2">
          <Phone className="w-5 h-5 text-brand-pink-600" />
          <span>{title}</span>
        </h3>
        <p className="text-xs text-brand-coffee-600">{subtitle}</p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Phone Number */}
      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-coffee-900 uppercase tracking-wider mb-2">
              Indian Mobile Number <span className="text-brand-pink-600">*</span>
            </label>

            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-coffee-100 border border-brand-coffee-200 text-brand-coffee-900 font-extrabold text-sm select-none">
                <span>🇮🇳</span>
                <span>+91</span>
              </div>

              <input
                ref={phoneInputRef}
                type="tel"
                value={mobileNumber}
                onChange={handlePhoneChange}
                placeholder="98765 43210"
                maxLength={10}
                required
                className="w-full pl-24 pr-4 py-3 rounded-2xl border-2 border-brand-coffee-200 focus:border-brand-pink-500 focus:ring-4 focus:ring-brand-pink-500/15 focus:outline-none text-base font-bold tracking-wider text-brand-coffee-950 bg-white"
              />
            </div>
            <p className="text-[11px] text-brand-coffee-500 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant 6-digit SMS OTP via 2Factor.in</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={sendingOtp || mobileNumber.length !== 10}
            className="w-full py-3.5 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-pink-600/30 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            {sendingOtp ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending SMS OTP...</span>
              </>
            ) : (
              <>
                <span>Send Verification OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 text-xs font-semibold text-brand-coffee-600 hover:text-brand-coffee-900"
            >
              Cancel
            </button>
          )}
        </form>
      ) : (
        /* STEP 2: OTP Verification */
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-brand-pink-50/70 border border-brand-pink-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-brand-coffee-800">Sent to:</span>
              <span className="font-extrabold text-brand-pink-700 font-mono">+91 {mobileNumber}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setErrorMessage('');
                setOtpValues(['', '', '', '', '', '']);
              }}
              className="text-brand-pink-600 hover:text-brand-pink-800 font-bold flex items-center gap-1 text-[11px] underline"
            >
              <Edit2 className="w-3 h-3" />
              <span>Change</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-coffee-900 uppercase tracking-wider mb-2 text-center">
              Enter 6-Digit Verification Code
            </label>

            {/* Segmented 6-digit inputs */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
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

          <button
            type="button"
            onClick={() => handleVerifyOtp()}
            disabled={verifyingOtp || otpValues.join('').length !== 6}
            className="w-full py-3.5 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-pink-600/30 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            {verifyingOtp ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying Code...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Verify & Continue</span>
              </>
            )}
          </button>

          {/* Resend Option */}
          <div className="text-center pt-1">
            {canResend ? (
              <button
                type="button"
                onClick={handleSendOtp}
                className="text-xs font-bold text-brand-pink-600 hover:text-brand-pink-800 flex items-center justify-center gap-1.5 mx-auto transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend SMS OTP</span>
              </button>
            ) : (
              <p className="text-xs text-brand-coffee-500 font-medium">
                Resend OTP in <span className="font-bold text-brand-coffee-800">{resendTimer}s</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-coffee-200 shadow-md max-w-md mx-auto">
      {content}
    </div>
  );
};

export default PhoneAuth;
