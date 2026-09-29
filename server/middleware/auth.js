import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'Nathan_coffee_super_secret_jwt_key_2026_Thanjavur_thanjavur';

/**
 * Protect routes for Admin access
 */
export const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      // 1. Check Admin model
      req.admin = await Admin.findById(decoded.id).select('-password');
      if (req.admin) {
        return next();
      }

      // 2. Check User model with admin role
      const user = await User.findById(decoded.id);
      if (user && user.role === 'admin') {
        req.admin = user;
        return next();
      }

      // 3. Check if decoded role is admin directly
      if (decoded.role === 'admin') {
        req.admin = { _id: decoded.id, role: 'admin' };
        return next();
      }

      return res.status(401).json({
        success: false,
        message: 'Admin authorization required. Please log in to admin panel.',
      });
    } catch (error) {
      console.error('Admin auth verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized as admin, session expired or invalid token',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no admin token provided',
    });
  }
};

/**
 * Protect routes for Logged-in Customer access
 */
export const protectUser = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      // Find user by ID in token
      req.user = await User.findById(decoded.id);
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found or session expired' });
      }

      return next();
    } catch (error) {
      console.error('User auth verification error:', error);
      return res.status(401).json({ success: false, message: 'Not authorized, session expired or invalid token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in with your mobile number.' });
  }
};

/**
 * Optional user middleware: attaches req.user if token is present without failing if absent
 */
export const protectUserOptional = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (error) {
      // Ignore token verification error for optional auth
      req.user = null;
    }
  }
  next();
};
