import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { protectUser } from '../middleware/auth.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'nadhan_coffee_super_secret_jwt_key_2026_coimbatore_thanjavur';

// Helper to sanitize & extract 10-digit mobile number
const formatMobileNumber = (rawNumber) => {
  if (!rawNumber) return '';
  const digitsOnly = String(rawNumber).replace(/\D/g, '');
  return digitsOnly.slice(-10);
};

// @route   POST /api/auth/send-otp
// @desc    Send SMS OTP using 2Factor.in AUTOGEN API
// @access  Public
const sendOTP = async (req, res) => {
  try {
    const { phoneNumber, mobileNumber } = req.body;
    const cleanNumber = formatMobileNumber(phoneNumber || mobileNumber);

    if (!cleanNumber || cleanNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian mobile number',
      });
    }

    const apiKey = process.env.TWO_FACTOR_API_KEY;
    if (!apiKey) {
      console.error('❌ TWO_FACTOR_API_KEY is not defined in environment variables');
      return res.status(500).json({
        success: false,
        message: 'SMS service is currently unavailable. Please check server configuration.',
      });
    }

    // Call 2Factor.in AUTOGEN endpoint
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/${cleanNumber}/AUTOGEN`;
    console.log(`📡 [2Factor] Sending OTP to +91 ${cleanNumber}`);

    const response = await axios.get(url, { timeout: 10000 });

    if (response.data && response.data.Status === 'Success') {
      const sessionId = response.data.Details;
      console.log(`✅ [2Factor] OTP sent successfully. SessionId: ${sessionId}`);

      return res.json({
        success: true,
        message: `OTP sent successfully to +91 ${cleanNumber}`,
        sessionId: sessionId,
      });
    }

    // Handle 2Factor error response
    console.warn('⚠️ [2Factor] Send OTP Error:', response.data);
    return res.status(400).json({
      success: false,
      message: response.data?.Details || 'Failed to send OTP. Please try again.',
    });
  } catch (error) {
    const errMsg = error.response?.data?.Details || error.response?.data?.message || error.message;
    console.error('❌ [2Factor] Send OTP Exception:', errMsg);

    return res.status(error.response?.status || 500).json({
      success: false,
      message: errMsg || 'Failed to send OTP via SMS',
    });
  }
};

// @route   POST /api/auth/verify-otp
// @desc    Verify SMS OTP using 2Factor.in VERIFY API & login/create user
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, mobileNumber, otp, otpCode, sessionId } = req.body;
    const cleanNumber = formatMobileNumber(phoneNumber || mobileNumber);
    const code = String(otp || otpCode || '').trim();

    if (!cleanNumber || cleanNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian mobile number',
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required to verify OTP. Please request a new OTP.',
      });
    }

    if (!code || code.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the complete OTP sent to your phone',
      });
    }

    const apiKey = process.env.TWO_FACTOR_API_KEY;
    if (!apiKey) {
      console.error('❌ TWO_FACTOR_API_KEY is not defined in environment variables');
      return res.status(500).json({
        success: false,
        message: 'SMS service configuration missing on server',
      });
    }

    // Call 2Factor.in VERIFY endpoint
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${sessionId}/${code}`;
    console.log(`📡 [2Factor] Verifying OTP for sessionId: ${sessionId}`);

    const response = await axios.get(url, { timeout: 10000 });

    if (response.data && response.data.Details === 'OTP Matched') {
      console.log(`✅ [2Factor] OTP matched successfully for +91 ${cleanNumber}`);

      // Find existing user or create a new user
      let user = await User.findOne({ mobileNumber: cleanNumber });

      if (!user) {
        user = new User({
          mobileNumber: cleanNumber,
          role: 'user',
          lastLogin: new Date(),
        });
        await user.save();
        console.log(`✨ [AUTH] New customer account created: +91 ${cleanNumber}`);
      } else {
        user.lastLogin = new Date();
        await user.save();
        console.log(`🔓 [AUTH] Customer verified & logged in: +91 ${cleanNumber}`);
      }

      // Auto-link any past orders placed with this mobile number that are missing userId
      try {
        await Order.updateMany(
          {
            $and: [
              {
                $or: [
                  { 'customer.phone': { $regex: cleanNumber + '$' } },
                  { 'customer.phone': cleanNumber },
                ],
              },
              {
                $or: [
                  { userId: { $exists: false } },
                  { userId: null },
                ],
              },
            ],
          },
          { $set: { userId: user._id } }
        );
      } catch (linkErr) {
        console.warn('Failed to auto-link past orders on login:', linkErr.message);
      }

      // Generate backend JWT token (valid for 30 days)
      const token = jwt.sign(
        {
          id: user._id,
          mobileNumber: user.mobileNumber,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.json({
        success: true,
        message: 'OTP verified successfully',
        token,
        user: {
          _id: user._id,
          mobileNumber: user.mobileNumber,
          name: user.name,
          email: user.email,
          addresses: user.addresses || [],
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    }

    // If 2Factor responds with something other than 'OTP Matched'
    const failDetail = response.data?.Details || 'Invalid OTP';
    console.warn(`⚠️ [2Factor] Verification rejected:`, failDetail);

    return res.status(400).json({
      success: false,
      message: failDetail === 'OTP Mismatched' ? 'Incorrect OTP. Please check and retry.' : failDetail,
    });
  } catch (error) {
    const errMsg = error.response?.data?.Details || error.response?.data?.message || error.message;
    console.error('❌ [2Factor] Verify OTP Exception:', errMsg);

    const isMismatch = String(errMsg).toLowerCase().includes('mismatch') || String(errMsg).toLowerCase().includes('incorrect');
    const isExpired = String(errMsg).toLowerCase().includes('expire');

    return res.status(400).json({
      success: false,
      message: isMismatch
        ? 'Incorrect verification code. Please check and re-enter.'
        : isExpired
        ? 'The OTP has expired. Please request a new one.'
        : errMsg || 'OTP verification failed',
    });
  }
};

// Route definitions (with aliases for standard conventions)
router.post('/send-otp', sendOTP);
router.post('/sendOTP', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/verifyOTP', verifyOTP);

// @route   GET /api/auth/me
// @desc    Get currently logged in user profile
// @access  Private (User)
router.get('/me', protectUser, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        _id: req.user._id,
        mobileNumber: req.user.mobileNumber,
        name: req.user.name,
        email: req.user.email,
        addresses: req.user.addresses || [],
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile & address
// @access  Private (User)
router.put('/profile', protectUser, async (req, res) => {
  try {
    const { name, email, address } = req.body;
    const user = req.user;

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;

    if (address) {
      if (!user.addresses) user.addresses = [];
      user.addresses.unshift({
        doorNo: address.doorNo || '',
        street: address.street || '',
        landmark: address.landmark || '',
        city: address.city || 'Thanjavur',
        state: address.state || 'Tamil Nadu',
        pincode: address.pincode || '',
        isDefault: true,
      });
      user.addresses = user.addresses.slice(0, 5);
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        mobileNumber: updatedUser.mobileNumber,
        name: updatedUser.name,
        email: updatedUser.email,
        addresses: updatedUser.addresses,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
