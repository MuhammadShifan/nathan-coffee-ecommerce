import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protectUser } from '../middleware/auth.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'nadhan_coffee_super_secret_jwt_key_2026_coimbatore_thanjavur';

// In-memory OTP storage for development & simulation
// Format: mobileNumber -> { otp: '1234', expiresAt: timestamp }
const otpStore = new Map();

// Helper to sanitize & extract 10-digit mobile number
const formatMobileNumber = (rawNumber) => {
  if (!rawNumber) return '';
  // Remove all non-digits
  const digitsOnly = String(rawNumber).replace(/\D/g, '');
  // Extract last 10 digits
  return digitsOnly.slice(-10);
};

// @route   POST /api/auth/send-otp
// @desc    Generate & simulate sending OTP to mobile number
// @access  Public
router.post('/send-otp', async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const cleanNumber = formatMobileNumber(mobileNumber);

    if (!cleanNumber || cleanNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit Indian mobile number',
      });
    }

    // For development convenience, use '1234' or a 4-digit numeric code
    // Any environment can use '1234' directly or the logged code
    const generatedOtp = process.env.NODE_ENV === 'production' 
      ? Math.floor(1000 + Math.random() * 9000).toString()
      : '1234';

    // Store in memory with 10-minute expiry
    const expiresAt = Date.now() + 10 * 60 * 1000;
    otpStore.set(cleanNumber, {
      otp: generatedOtp,
      expiresAt,
    });

    // Clean up expired OTPs periodically
    for (const [key, value] of otpStore.entries()) {
      if (Date.now() > value.expiresAt) {
        otpStore.delete(key);
      }
    }

    // Console log the simulated SMS OTP
    console.log('\n==================================================');
    console.log(`☕ [NATHAN COFFEE AUTH] SMS OTP DISPATCH`);
    console.log(`📱 Recipient Mobile : +91 ${cleanNumber}`);
    console.log(`🔑 Verification OTP : ${generatedOtp}`);
    console.log(`⏳ Valid Duration   : 10 Minutes (Simulated)`);
    console.log('==================================================\n');

    res.json({
      success: true,
      message: `OTP sent successfully to +91 ${cleanNumber}`,
      mobileNumber: cleanNumber,
      // Provide simulated OTP in response for instant development testing
      otp: generatedOtp,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.',
      error: error.message,
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP, login/create user & return JWT token
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobileNumber, otp, name, email } = req.body;
    const cleanNumber = formatMobileNumber(mobileNumber);
    const cleanOtp = String(otp || '').trim();

    if (!cleanNumber || cleanNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number',
      });
    }

    if (!cleanOtp) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the 4-digit OTP code',
      });
    }

    const storedData = otpStore.get(cleanNumber);

    // Verify OTP: Allow '1234' (dev fallback) OR stored OTP matching
    const isMasterOtp = cleanOtp === '1234';
    const isStoredOtpValid =
      storedData && storedData.otp === cleanOtp && Date.now() <= storedData.expiresAt;

    if (!isMasterOtp && !isStoredOtpValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. (Tip: Use 1234 for instant verification)',
      });
    }

    // OTP is valid! Remove from store
    otpStore.delete(cleanNumber);

    // Find existing user or create a new one
    let user = await User.findOne({ mobileNumber: cleanNumber });

    if (!user) {
      user = new User({
        mobileNumber: cleanNumber,
        name: name || '',
        email: email || '',
        role: 'user',
        lastLogin: new Date(),
      });
      await user.save();
      console.log(`✨ [AUTH] New customer account created: +91 ${cleanNumber}`);
    } else {
      user.lastLogin = new Date();
      if (name && !user.name) user.name = name;
      if (email && !user.email) user.email = email;
      await user.save();
      console.log(`🔓 [AUTH] Customer logged in: +91 ${cleanNumber}`);
    }

    // Generate JWT token (valid for 30 days)
    const token = jwt.sign(
      {
        id: user._id,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Mobile number verified successfully!',
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
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification',
      error: error.message,
    });
  }
});

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
      // Add or update primary address
      if (!user.addresses) user.addresses = [];
      user.addresses.unshift({
        doorNo: address.doorNo || '',
        street: address.street || '',
        landmark: address.landmark || '',
        city: address.city || 'Coimbatore',
        state: address.state || 'Tamil Nadu',
        pincode: address.pincode || '',
        isDefault: true,
      });
      // Keep only up to 5 recent addresses
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
