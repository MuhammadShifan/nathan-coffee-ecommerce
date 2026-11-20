import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { protectUser } from '../middleware/auth.js';
import { sendOTP as dispatchSMSOTP, verifyOTP as verifySMSOTP, formatPhoneNumber } from '../utils/smsService.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'nadhan_coffee_super_secret_jwt_key_2026_coimbatore_thanjavur';

const sendOTP = async (req, res) => {
  try {
    const { phoneNumber, mobileNumber, otp } = req.body;
    const cleanNumber = formatPhoneNumber(phoneNumber || mobileNumber);

    if (!cleanNumber || cleanNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian mobile number',
      });
    }

    const result = await dispatchSMSOTP(cleanNumber, otp, 'OTP1');

    if (result.success) {
      return res.json({
        success: true,
        message: `OTP sent successfully to +91 ${cleanNumber}`,
        sessionId: result.sessionId,
        details: result.details,
      });
    }

    return res.status(400).json({
      success: false,
      message: result.details || 'Failed to send OTP. Please try again.',
    });
  } catch (error) {
    console.error('❌ [Auth Route] Send OTP Exception:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to send OTP via SMS',
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, mobileNumber, otp, otpCode, sessionId } = req.body;
    const cleanNumber = formatPhoneNumber(phoneNumber || mobileNumber);
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

    const verification = await verifySMSOTP(sessionId, code);

    if (!verification.success) {
      const failDetail = verification.message || 'Invalid OTP';
      return res.status(400).json({
        success: false,
        message: failDetail === 'OTP Mismatched' ? 'Incorrect OTP. Please check and retry.' : failDetail,
      });
    }

    console.log(`✅ [2Factor] OTP matched successfully for +91 ${cleanNumber}`);

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
  } catch (error) {
    console.error('❌ [Auth Route] Verify OTP Exception:', error.message);
    const errMsg = error.message || 'OTP verification failed';
    const isMismatch = String(errMsg).toLowerCase().includes('mismatch') || String(errMsg).toLowerCase().includes('incorrect');
    const isExpired = String(errMsg).toLowerCase().includes('expire');

    return res.status(400).json({
      success: false,
      message: isMismatch
        ? 'Incorrect verification code. Please check and re-enter.'
        : isExpired
        ? 'The OTP has expired. Please request a new one.'
        : errMsg,
    });
  }
};

router.post('/send-otp', sendOTP);
router.post('/sendOTP', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/verifyOTP', verifyOTP);

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
