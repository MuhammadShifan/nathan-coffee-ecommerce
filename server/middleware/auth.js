import 'dotenv/config';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';

const PRIMARY_JWT_SECRET =
  process.env.JWT_SECRET || 'nadhan_coffee_super_secret_jwt_key_2026_coimbatore_thanjavur';
const FALLBACK_JWT_SECRET =
  'Nathan_coffee_super_secret_jwt_key_2026_Thanjavur_thanjavur';

/**
 * Safely verify JWT using primary or secondary fallback secret
 */
const verifyTokenSafely = (token) => {
  const secret = process.env.JWT_SECRET || PRIMARY_JWT_SECRET;
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    if (FALLBACK_JWT_SECRET && FALLBACK_JWT_SECRET !== secret) {
      try {
        return jwt.verify(token, FALLBACK_JWT_SECRET);
      } catch (fallbackErr) {
        throw err;
      }
    }
    throw err;
  }
};

/**
 * Helper to extract Bearer or header token
 */
const extractTokenFromRequest = (req) => {
  if (req.headers.authorization && typeof req.headers.authorization === 'string') {
    const parts = req.headers.authorization.trim().split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      return parts[1].trim();
    }
    if (parts.length === 1 && parts[0]) {
      return parts[0].trim();
    }
  }

  if (req.headers['x-admin-token']) {
    return String(req.headers['x-admin-token']).trim();
  }

  if (req.headers['x-auth-token']) {
    return String(req.headers['x-auth-token']).trim();
  }

  return null;
};

/**
 * Protect routes for Admin access
 */
export const protectAdmin = async (req, res, next) => {
  const token = extractTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no admin token provided in Authorization header',
    });
  }

  try {
    const decoded = verifyTokenSafely(token);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token structure',
      });
    }

    // 1. Check Admin model by ID if valid ObjectId
    if (String(decoded.id).match(/^[0-9a-fA-F]{24}$/)) {
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
    }

    // 3. Check if decoded role is admin directly
    if (decoded.role === 'admin') {
      req.admin = {
        _id: decoded.id,
        role: 'admin',
        email: decoded.email || 'admin@nadhancoffee.com',
      };
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Admin authorization required. Please log in to admin panel.',
    });
  } catch (error) {
    console.error('Admin auth verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized as admin, session expired or invalid token',
      error: error.message,
    });
  }
};

/**
 * Protect routes for Logged-in Customer access
 */
export const protectUser = async (req, res, next) => {
  const token = extractTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in with your mobile number.',
    });
  }

  try {
    const decoded = verifyTokenSafely(token);

    if (decoded?.id && String(decoded.id).match(/^[0-9a-fA-F]{24}$/)) {
      req.user = await User.findById(decoded.id);
      if (req.user) {
        return next();
      }
    }

    return res.status(401).json({
      success: false,
      message: 'User not found or session expired',
    });
  } catch (error) {
    console.error('User auth verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, session expired or invalid token',
    });
  }
};

/**
 * Optional user middleware: attaches req.user if token is present without failing if absent
 */
export const protectUserOptional = async (req, res, next) => {
  const token = extractTokenFromRequest(req);
  if (token) {
    try {
      const decoded = verifyTokenSafely(token);
      if (decoded?.id && String(decoded.id).match(/^[0-9a-fA-F]{24}$/)) {
        req.user = await User.findById(decoded.id);
      }
    } catch (error) {
      req.user = null;
    }
  }
  next();
};
