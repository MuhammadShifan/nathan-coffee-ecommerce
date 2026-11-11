import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { protectUser } from '../middleware/auth.js';
import { auth } from '../config/firebaseAdmin.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'nadhan_coffee_super_secret_jwt_key_2026_coimbatore_thanjavur';

// Helper to sanitize & extract 10-digit mobile number
const formatMobileNumber = (rawNumber) => {
  if (!rawNumber) return '';
  // Remove all non-digits
  const digitsOnly = String(rawNumber).replace(/\D/g, '');
  // Extract last 10 digits
  return digitsOnly.slice(-10);
};

// @route   POST /api/auth/verify-otp (and /verifyOTP)
// @desc    Verify Firebase ID token, login/create user & return backend JWT token
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { firebaseToken, token: fallbackToken, name, email } = req.body;
    const idToken = firebaseToken || fallbackToken;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase authentication token is required',
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const phoneNumber = decodedToken.phone_number;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'No phone number associated with this Firebase account',
      });
    }

    // Sanitize to 10-digit mobile number
    const cleanNumber = formatMobileNumber(phoneNumber);

    if (!cleanNumber || cleanNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format in Firebase token',
      });
    }

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
      console.log(`✨ [AUTH] New customer account created via Firebase Phone Auth: +91 ${cleanNumber}`);
    } else {
      user.lastLogin = new Date();
      if (name && !user.name) user.name = name;
      if (email && !user.email) user.email = email;
      await user.save();
      console.log(`🔓 [AUTH] Customer verified via Firebase Phone Auth & logged in: +91 ${cleanNumber}`);
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
    const backendJwt = jwt.sign(
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
      message: 'Phone number verified successfully!',
      token: backendJwt,
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
    console.error('Verify Firebase Token Error:', error);
    return res.status(401).json({
      success: false,
      message: error.message || 'Firebase authentication failed',
      error: error.message,
    });
  }
};

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
      // Add or update primary address
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
