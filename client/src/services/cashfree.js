import { load } from '@cashfreepayments/cashfree-js';

let cashfreeInstancePromise = null;

/**
 * Get or initialize the Cashfree SDK instance in sandbox mode
 * @param {string} mode 'sandbox' or 'production' (defaults to 'sandbox')
 * @returns {Promise<any>}
 */
export const getCashfree = async (mode = 'sandbox') => {
  if (!cashfreeInstancePromise) {
    cashfreeInstancePromise = load({ mode });
  }
  return cashfreeInstancePromise;
};

/**
 * Initiate Cashfree checkout
 * @param {Object} options
 * @param {string} options.paymentSessionId - Cashfree payment session ID from backend
 * @param {string} [options.redirectTarget='_modal'] - '_modal' (popup modal) or '_self' (page redirect)
 * @param {Function} [options.onSuccess] - Callback when payment is completed
 * @param {Function} [options.onFailure] - Callback when payment fails or is closed
 * @param {string} [options.mode='sandbox'] - 'sandbox' or 'production'
 */
export const initiateCashfreeCheckout = async ({
  paymentSessionId,
  redirectTarget = '_modal',
  onSuccess,
  onFailure,
  mode = 'sandbox',
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

