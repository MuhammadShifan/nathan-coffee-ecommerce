/**
 * Utility to load the Razorpay SDK dynamically if not already present
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Trigger Razorpay checkout modal
 */
export const openRazorpayModal = async ({
  keyId,
  orderId,
  amount,
  currency = 'INR',
  name = 'Nathan Coffee Mart',
  description = 'Pure Filter Coffee Powder Order',
  customer,
  onSuccess,
  onFailure,
}) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    alert('Razorpay SDK failed to load. Please check your internet connection.');
    if (onFailure) onFailure(new Error('SDK failed to load'));
    return;
  }

  const options = {
    key: keyId || 'rzp_test_TfsAvrbG1O9sYj',
    amount: Math.round(amount * 100),
    currency: currency,
    name: name,
    description: description,
    image: '/images/logo.jpeg',
    order_id: orderId,
    handler: function (response) {
      // response contains razorpay_payment_id, razorpay_order_id, razorpay_signature
      if (onSuccess) {
        onSuccess(response);
      }
    },
    prefill: {
      name: customer?.name || '',
      email: customer?.email || '',
      contact: customer?.phone || '',
      method: 'upi',
    },
    config: {
      display: {
        blocks: {
          upi: {
            name: 'Pay via UPI (Google Pay, PhonePe, Paytm, QR)',
            instruments: [
              {
                method: 'upi',
                flows: ['qr', 'collect', 'intent'],
                apps: ['google_pay', 'phonepe', 'paytm', 'bhim', 'cred'],
              },
            ],
          },
          other: {
            name: 'Cards, NetBanking & Wallets',
            instruments: [
              {
                method: 'card',
              },
              {
                method: 'netbanking',
              },
              {
                method: 'wallet',
              },
            ],
          },
        },
        sequence: ['block.upi', 'block.other'],
        preferences: {
          show_default_blocks: true,
        },
      },
    },
    notes: {
      address: `${customer?.address?.doorNo || ''}, ${customer?.address?.street || ''}, ${customer?.address?.city || ''}, ${customer?.address?.pincode || ''}`,
      brand: 'Nathan Coffee Thanjavur/Thanjavur',
    },
    theme: {
      color: '#e60067', // Brand Pink
      backdrop_color: 'rgba(21, 10, 6, 0.65)',
    },
    modal: {
      confirm_close: true,
      ondismiss: function () {
        console.log('Razorpay payment modal closed by user');
        if (onFailure) onFailure(new Error('Payment modal closed by user'));
      },
    },
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.on('payment.failed', function (response) {
    console.error('Payment failed response:', response.error);
    if (onFailure) onFailure(response.error);
  });

  paymentObject.open();
};
