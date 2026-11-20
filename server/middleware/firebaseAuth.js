import { auth } from '../config/firebaseAdmin.js';
import User from '../models/User.js';

const extractBearerToken = (req) => {
  if (req.headers.authorization && typeof req.headers.authorization === 'string') {
    const parts = req.headers.authorization.trim().split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      return parts[1].trim();
    }
    if (parts.length === 1 && parts[0]) {
      return parts[0].trim();
    }
  }

  if (req.headers['x-firebase-token']) {
    return String(req.headers['x-firebase-token']).trim();
  }

  if (req.body && req.body.firebaseToken) {
    return String(req.body.firebaseToken).trim();
  }

  return null;
};

export const verifyFirebaseToken = async (req, res, next) => {
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Authentication required. Please provide a valid Firebase ID token.',
    });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.firebaseUser = decodedToken;

    const rawPhone = decodedToken.phone_number || '';
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Firebase authentication: Token does not contain a verified phone number.',
      });
    }

    let user = await User.findOne({ mobileNumber: cleanPhone });

    if (!user) {
      user = await User.create({
        mobileNumber: cleanPhone,
        firebaseUid: decodedToken.uid,
        role: 'user',
        lastLogin: new Date(),
      });
      console.log(`✨ [FirebaseAuth] Auto-created user profile for verified mobile: +91 ${cleanPhone}`);
    } else {
      user.lastLogin = new Date();
      if (!user.firebaseUid) {
        user.firebaseUid = decodedToken.uid;
      }
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Firebase Admin ID Token verification error:', error.message);

    let clientMessage = 'Invalid or expired authentication token. Please sign in again.';
    if (error.code === 'auth/id-token-expired') {
      clientMessage = 'Your login session has expired. Please verify your mobile number again.';
    } else if (error.code === 'auth/argument-error') {
      clientMessage = 'Malformed Firebase authentication token.';
    }

    return res.status(401).json({
      success: false,
      message: clientMessage,
      code: error.code || 'UNAUTHORIZED',
    });
  }
};

export const verifyFirebaseTokenOptional = async (req, res, next) => {
  const token = extractBearerToken(req);

  if (!token) {
    return next();
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.firebaseUser = decodedToken;

    const rawPhone = decodedToken.phone_number || '';
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);

    if (cleanPhone && cleanPhone.length === 10) {
      const user = await User.findOne({ mobileNumber: cleanPhone });
      if (user) {
        req.user = user;
      }
    }
  } catch (err) {
    req.user = null;
  }

  next();
};

export default verifyFirebaseToken;

