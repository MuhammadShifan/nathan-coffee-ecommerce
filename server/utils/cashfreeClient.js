import { Cashfree, CFEnvironment } from 'cashfree-pg';

export const getCashfreeClient = () => {
  const appId = process.env.CASHFREE_APP_ID || '';
  const secretKey = process.env.CASHFREE_SECRET_KEY || '';
  const isProduction = (process.env.CASHFREE_ENV || 'SANDBOX').toUpperCase() === 'PRODUCTION';
  const environment = isProduction ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

  if (!appId || !secretKey) {
    console.warn('⚠️ [Cashfree] CASHFREE_APP_ID or CASHFREE_SECRET_KEY is not defined in environment variables.');
  }

  return new Cashfree(environment, appId, secretKey);
};

export const createCashfreeOrder = async ({
  amount,
  currency = 'INR',
  customer = {},
  reqUser = null,
  orderNote = 'Nathan Coffee Pure Filter Coffee Order',
  returnUrl,
  origin,
  cfMerchantOrderId,
}) => {
  const cleanAmount = Number(Number(amount).toFixed(2));
  if (!Number.isFinite(cleanAmount) || cleanAmount <= 0) {
    throw new Error('Invalid Cashfree order amount. Amount must be greater than 0.');
  }

  const rawPhone = customer?.phone || reqUser?.mobileNumber || '';
  const cleanPhone = String(rawPhone).replace(/\D/g, '').slice(-10) || '9999999999';

  const rawCustomerId = customer?.id || reqUser?._id || `cust_${cleanPhone}_${Date.now().toString().slice(-4)}`;
  const cleanCustomerId = String(rawCustomerId).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50) || `cust_${Date.now()}`;

  const customerName = (customer?.name || reqUser?.name || 'Customer').trim();
  const candidateEmail = String(customer?.email || reqUser?.email || '').trim();
  const customerEmail = candidateEmail && candidateEmail.includes('@')
    ? candidateEmail
    : `customer_${cleanPhone}@nathancoffeethanjavur.com`;

  const resolvedMerchantOrderId =
    cfMerchantOrderId || `order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

  const fallbackClientUrl = (process.env.CLIENT_URL || process.env.SITE_URL || 'https://nathancoffeethanjavur.com').replace(/\/+$/, '');
  const baseClientUrl = origin && origin !== 'null' && origin !== 'undefined' ? origin.replace(/\/+$/, '') : fallbackClientUrl;
  const defaultReturnUrl = `${baseClientUrl}/checkout?cf_order_id={order_id}`;
  const resolvedReturnUrl = returnUrl
    ? (returnUrl.startsWith('http') ? returnUrl : `${baseClientUrl}${returnUrl.startsWith('/') ? '' : '/'}${returnUrl}`)
    : defaultReturnUrl;

  const orderPayload = {
    order_id: resolvedMerchantOrderId,
    order_amount: cleanAmount,
    order_currency: currency,
    customer_details: {
      customer_id: cleanCustomerId,
      customer_phone: cleanPhone,
      customer_name: customerName,
      customer_email: customerEmail,
    },
    order_meta: {
      return_url: resolvedReturnUrl,
    },
    order_note: orderNote,
  };

  const cashfree = getCashfreeClient();
  const cfResponse = await cashfree.PGCreateOrder(orderPayload);

  return {
    orderPayload,
    orderData: cfResponse.data,
  };
};

