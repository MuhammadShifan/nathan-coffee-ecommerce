import axios from 'axios';

export const formatPhoneNumber = (rawNumber) => {
  if (!rawNumber) return '';
  const digitsOnly = String(rawNumber).replace(/\D/g, '');
  return digitsOnly.slice(-10);
};

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

    const otpSegment = otp && String(otp).toUpperCase() !== 'AUTOGEN' ? String(otp).trim() : 'AUTOGEN';
    const templateSegment = template ? `/${template}` : '';

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

