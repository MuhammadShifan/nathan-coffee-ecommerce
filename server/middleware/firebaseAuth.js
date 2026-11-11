import { auth } from '../config/firebaseAdmin.js';
import User from '../models/User.js';

/**
 * Extracts the bearer token from the Authorization header or fallback headers/body
 */
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

/**
 * Middleware: verifyFirebaseToken
 * Uses firebase-admin to verify the Firebase ID Token before allowing sensitive actions (e.g. placing orders).
 * 
 * Flow:
 * 1. Extracts ID token from Authorization: Bearer <firebase_id_token>
 * 2. Calls admin.auth().verifyIdToken(token)
 * 3. Extracts phone_number (+91XXXXXXXXXX)
 * 4. Resolves the User record in MongoDB (or creates an account on first checkout)
 * 5. Attaches req.user and req.firebaseUser to the request object
 */
export const verifyFirebaseToken = async (req, res, next) => {
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Authentication required. Please provide a valid Firebase ID token.',
    });
  }

  try {
    // 1. Verify token with Firebase Admin SDK
    const decodedToken = await auth.verifyIdToken(token);
    req.firebaseUser = decodedToken;

    // 2. Extract phone number
    const rawPhone = decodedToken.phone_number || '';
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Firebase authentication: Token does not contain a verified phone number.',
      });
    }

    // 3. Find or auto-create User in MongoDB
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

    // 4. Attach verified user to request
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

/**
 * Optional Firebase Auth Middleware: Attaches req.user if a valid token is present, but allows guest access if absent.
 */
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
    // Silently continue for optional middleware
    req.user = null;
  }

  next();
};

export default verifyFirebaseToken;

