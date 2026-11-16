import axios from 'axios';

/**
 * 2Factor SMS Service Utility
 * Official 2Factor.in API integration for sending and verifying transactional OTPs.
 */

// Helper to sanitize & extract 10-digit Indian mobile number
export const formatPhoneNumber = (rawNumber) => {
  if (!rawNumber) return '';
  const digitsOnly = String(rawNumber).replace(/\D/g, '');
  return digitsOnly.slice(-10);
};

/**
 * Send SMS OTP via 2Factor.in API
 * 
 * Supports both:
 * 1. Custom OTP Mode:   https://2factor.in/API/V1/${apiKey}/SMS/${phoneNumber}/${otp}/OTP1
 * 2. 2Factor AUTOGEN:  https://2factor.in/API/V1/${apiKey}/SMS/${phoneNumber}/AUTOGEN/OTP1
 * 
 * @param {string} phoneNumber - 10-digit Indian mobile number
 * @param {string|number} [otp] - Optional OTP code. If omitted or 'AUTOGEN', 2Factor auto-generates the OTP.
 * @param {string} [template='OTP1'] - DLT SMS Template Name (defaults to 'OTP1')
 * @returns {Promise<{success: boolean, sessionId?: string, details?: string, data?: any}>}
 */
export const sendOTP = async (phoneNumber, otp = null, template = 'OTP1') => {
  try {
    const cleanPhone = formatPhoneNumber(phoneNumber);
    if (!cleanPhone || cleanPhone.length !== 10) {
      throw new Error(`Invalid mobile number "${phoneNumber}". Please provide a 10-digit Indian mobile number.`);
    }

    const apiKey = process.env.TWO_FACTOR_API_KEY;
    if (!apiKey) {
      console.error('❌ [2Factor] TWO_FACTOR_API_KEY is not defined in environment variables.');
      throw new Error('SMS service is currently unconfigured. Missing TWO_FACTOR_API_KEY in environment.');
    }

    // Determine whether to use custom OTP or 2Factor AUTOGEN
    const otpSegment = otp && String(otp).toUpperCase() !== 'AUTOGEN' ? String(otp).trim() : 'AUTOGEN';
    const templateSegment = template ? `/${template}` : '';

    // Construct the 2Factor URL dynamically:
    // e.g. https://2factor.in/API/V1/${apiKey}/SMS/${phoneNumber}/${otp}/OTP1
    // or   https://2factor.in/API/V1/${apiKey}/SMS/${phoneNumber}/AUTOGEN/OTP1
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/${cleanPhone}/${otpSegment}${templateSegment}`;

    console.log(`📡 [2Factor] Requesting OTP dispatch to +91 ${cleanPhone} (Mode: ${otpSegment}, Template: ${template || 'DEFAULT'})`);

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.data && response.data.Status === 'Success') {
      const sessionId = response.data.Details;
      console.log(`✅ [2Factor] OTP sent successfully to +91 ${cleanPhone}. SessionId: ${sessionId}`);

      return {
        success: true,
        sessionId,
        details: response.data.Details,
        data: response.data,
      };
    }

    // Handle unexpected 2Factor response status
    console.warn('⚠️ [2Factor] Non-success response from 2Factor:', response.data);
    return {
      success: false,
      details: response.data?.Details || 'Failed to send OTP via SMS',
      data: response.data,
    };
  } catch (error) {
    const errDetails = error.response?.data?.Details || error.response?.data?.message || error.message;
    console.error(`❌ [2Factor] Send OTP Error for ${phoneNumber}:`, errDetails);

    throw new Error(errDetails || 'Failed to send OTP via SMS');
  }
};

/**
 * Verify SMS OTP using 2Factor.in VERIFY API
 * 
 * @param {string} sessionId - SessionId returned by 2Factor during sendOTP
 * @param {string|number} otpCode - User entered OTP code
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export const verifyOTP = async (sessionId, otpCode) => {
  try {
    if (!sessionId) {
      throw new Error('Session ID is required to verify OTP');
    }
    const cleanCode = String(otpCode || '').trim();
    if (!cleanCode) {
      throw new Error('OTP code is required for verification');
    }

    const apiKey = process.env.TWO_FACTOR_API_KEY;
    if (!apiKey) {
      console.error('❌ [2Factor] TWO_FACTOR_API_KEY is not defined in environment variables.');
      throw new Error('SMS service is currently unconfigured. Missing TWO_FACTOR_API_KEY in environment.');
    }

    const url = `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${sessionId}/${cleanCode}`;
    console.log(`📡 [2Factor] Verifying OTP for SessionId: ${sessionId}`);

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.data && response.data.Details === 'OTP Matched') {
      console.log(`✅ [2Factor] OTP matched successfully. SessionId: ${sessionId}`);
      return {
        success: true,
        message: 'OTP Matched',
        data: response.data,
      };
    }

    const failReason = response.data?.Details || 'Invalid OTP';
    console.warn(`⚠️ [2Factor] OTP verification rejected: ${failReason}`);
    return {
      success: false,
      message: failReason,
      data: response.data,
    };
  } catch (error) {
    const errDetails = error.response?.data?.Details || error.response?.data?.message || error.message;
    console.error(`❌ [2Factor] Verify OTP Error:`, errDetails);

    throw new Error(errDetails || 'OTP verification failed');
  }
};

export default {
  sendOTP,
  verifyOTP,
  formatPhoneNumber,
};

