import User from '../models/User.js';

export const generateNathanOrderId = () =>
  `NC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

export const generateTrackingNumber = () =>
  `NCTRACK-${Math.floor(10000000 + Math.random() * 90000000)}`;

export const resolveEffectiveUserId = async ({ reqUser, candidateUserId, customerPhone }) => {
  let effectiveUserId =
    reqUser?._id ||
    (candidateUserId && String(candidateUserId).match(/^[0-9a-fA-F]{24}$/) ? candidateUserId : undefined);

  const cleanCustomerPhone = customerPhone ? String(customerPhone).replace(/\D/g, '').slice(-10) : '';

  if (!effectiveUserId && cleanCustomerPhone.length === 10) {
    const existingUser = await User.findOne({ mobileNumber: cleanCustomerPhone });
    if (existingUser) {
      effectiveUserId = existingUser._id;
    }
  }

  return effectiveUserId;
};

