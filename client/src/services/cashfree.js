import { load } from '@cashfreepayments/cashfree-js';

let cashfreeInstancePromise = null;

export const getCashfree = async (mode = 'production') => {
  if (!cashfreeInstancePromise) {
    cashfreeInstancePromise = load({ mode });
  }
  return cashfreeInstancePromise;
};

export const initiateCashfreeCheckout = async ({
  paymentSessionId,
  redirectTarget = '_modal',
  onSuccess,
  onFailure,
  mode = 'production',
}) => {
  try {
    if (!paymentSessionId) {
      throw new Error('paymentSessionId is required to open Cashfree checkout');
    }

    const cashfree = await getCashfree(mode);

    if (!cashfree) {
      throw new Error('Failed to initialize Cashfree SDK');
    }

    const checkoutOptions = {
      paymentSessionId,
      redirectTarget,
    };

    const result = await cashfree.checkout(checkoutOptions);

    if (result.error) {
      console.warn('Cashfree Checkout Error or Modal Closed:', result.error);
      if (onFailure) {
        onFailure(result.error);
      }
      return result;
    }

    if (result.redirect) {
      console.log('Cashfree is redirecting the user for payment verification...');
      return result;
    }

    if (result.paymentDetails) {
      console.log('Cashfree Payment Completed:', result.paymentDetails);
      if (onSuccess) {
        await onSuccess(result.paymentDetails);
      }
      return result;
    }

    return result;
  } catch (error) {
    console.error('Cashfree checkout initialization failed:', error);
    if (onFailure) {
      onFailure(error);
    }
    throw error;
  }
};

export default {
  getCashfree,
  initiateCashfreeCheckout,
};

