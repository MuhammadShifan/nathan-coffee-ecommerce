import { Cashfree, CFEnvironment } from 'cashfree-pg';

/**
 * Initialize Cashfree PG SDK Instance.
 * Defaults to SANDBOX unless CASHFREE_ENV is explicitly 'PRODUCTION'.
 */
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

/**
 * Sanitize customer payload and create a Cashfree PG order returning orderData (including payment_session_id).
 */
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
  const customerEmail = (customer?.email || reqUser?.email || `customer_${cleanPhone}@Nathancoffee.com`).trim();

  const resolvedMerchantOrderId =
    cfMerchantOrderId || `order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

  const defaultReturnUrl = origin ? `${origin}/checkout?cf_order_id={order_id}` : undefined;

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
      return_url: returnUrl || defaultReturnUrl,
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

