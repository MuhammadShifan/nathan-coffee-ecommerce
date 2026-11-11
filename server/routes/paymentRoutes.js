import express from 'express';
import { Cashfree, CFEnvironment } from 'cashfree-pg';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { protectUserOptional } from '../middleware/auth.js';

const router = express.Router();

/**
 * Initialize Cashfree PG SDK Instance
 * Defaults to SANDBOX unless CASHFREE_ENV is explicitly 'PRODUCTION'
 */
const getCashfreeClient = () => {
  const appId = process.env.CASHFREE_APP_ID || '';
  const secretKey = process.env.CASHFREE_SECRET_KEY || '';
  const isProduction = (process.env.CASHFREE_ENV || 'SANDBOX').toUpperCase() === 'PRODUCTION';
  const environment = isProduction ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

  if (!appId || !secretKey) {
    console.warn('⚠️ [Cashfree] CASHFREE_APP_ID or CASHFREE_SECRET_KEY is not defined in environment variables.');
  }

  return new Cashfree(environment, appId, secretKey);
};

// @route   GET /api/payment/config
// @desc    Get Cashfree public config / environment
router.get('/config', (req, res) => {
  res.json({
    success: true,
    environment: (process.env.CASHFREE_ENV || 'SANDBOX').toLowerCase(),
    appId: process.env.CASHFREE_APP_ID ? `${process.env.CASHFREE_APP_ID.slice(0, 8)}...` : '',
  });
});

// @route   POST /api/payment/create-order
// @desc    Create Cashfree Order and obtain payment_session_id
// @access  Public / Authenticated
router.post('/create-order', protectUserOptional, async (req, res) => {
  try {
    const { amount, currency = 'INR', customer, orderNote, returnUrl } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order amount. Amount must be greater than 0.',
      });
    }

    const cleanAmount = Number(Number(amount).toFixed(2));

    // Sanitize customer details for Cashfree API requirements
    const rawPhone = customer?.phone || req.user?.mobileNumber || '';
    const cleanPhone = String(rawPhone).replace(/\D/g, '').slice(-10) || '9999999999';

    const rawCustomerId = customer?.id || req.user?._id || `cust_${cleanPhone}_${Date.now().toString().slice(-4)}`;
    const cleanCustomerId = String(rawCustomerId).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50) || `cust_${Date.now()}`;

    const customerName = (customer?.name || req.user?.name || 'Customer').trim();
    const customerEmail = (customer?.email || req.user?.email || `customer_${cleanPhone}@Nathancoffee.com`).trim();

    // Unique merchant order ID for Cashfree (max 50 chars, alphanumeric, _ and -)
    const cfMerchantOrderId = `order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
    const defaultReturnUrl = `${origin}/checkout?cf_order_id={order_id}`;

    const orderPayload = {
      order_id: cfMerchantOrderId,
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
      order_note: orderNote || 'Nathan Coffee Pure Filter Coffee Order',
    };

    const cashfree = getCashfreeClient();
    const cfResponse = await cashfree.PGCreateOrder(orderPayload);
    const orderData = cfResponse.data;

    res.json({
      success: true,
      message: 'Cashfree order created successfully',
      payment_session_id: orderData.payment_session_id,
      paymentSessionId: orderData.payment_session_id,
      orderId: orderData.order_id,
      cfOrderId: orderData.cf_order_id,
      orderAmount: orderData.order_amount,
      orderCurrency: orderData.order_currency,
      orderStatus: orderData.order_status,
      data: orderData,
    });
  } catch (error) {
    const cfErrorData = error.response?.data;
    console.error('Cashfree Create Order Error:', cfErrorData || error.message);
    const errorMsg = cfErrorData?.message || error.message || 'Failed to create Cashfree payment order';

    res.status(error.response?.status || 500).json({
      success: false,
      message: errorMsg,
      error: cfErrorData || error.message,
    });
  }
});

// @route   GET /api/payment/order-status/:orderId
// @desc    Fetch order and payments status directly from Cashfree
router.get('/order-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const cashfree = getCashfreeClient();
    const orderRes = await cashfree.PGFetchOrder(orderId);

    let payments = [];
    try {
      const paymentsRes = await cashfree.PGOrderFetchPayments(orderId);
      payments = paymentsRes.data || [];
    } catch (e) {
      // Payments list might be empty if no attempt made yet
    }

    res.json({
      success: true,
      order: orderRes.data,
      payments,
    });
  } catch (error) {
    const cfErrorData = error.response?.data;
    console.error('Cashfree Fetch Order Error:', cfErrorData || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: cfErrorData?.message || error.message || 'Failed to fetch Cashfree order status',
      error: cfErrorData || error.message,
    });
  }
});

// @route   POST /api/payment/verify
// @desc    Verify Cashfree order payment status & persist order into MongoDB
// @access  Public / Authenticated
router.post('/verify', protectUserOptional, async (req, res) => {
  try {
    const { orderId, orderDetails } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID (orderId) is required for payment verification',
      });
    }

    const cashfree = getCashfreeClient();

    // Fetch order state from Cashfree Gateway
    const orderRes = await cashfree.PGFetchOrder(orderId);
    const cfOrder = orderRes.data;

    // Fetch payment entities to obtain cf_payment_id and verify payment success
    let payments = [];
    try {
      const paymentsRes = await cashfree.PGOrderFetchPayments(orderId);
      payments = paymentsRes.data || [];
    } catch (e) {
      console.warn('Could not fetch payment entities for order:', orderId, e.message);
    }

    const successfulPayment = payments.find((p) => p.payment_status === 'SUCCESS');
    const isPaid = cfOrder.order_status === 'PAID' || !!successfulPayment;

    if (!isPaid) {
      return res.status(400).json({
        success: false,
        message: `Payment verification failed. Order status is '${cfOrder.order_status}'`,
        orderStatus: cfOrder.order_status,
      });
    }

    const resolvedCfOrderId = String(cfOrder.cf_order_id || '');
    const resolvedCfPaymentId = String(successfulPayment?.cf_payment_id || cfOrder.cf_order_id || '');
    const resolvedSessionId = String(cfOrder.payment_session_id || '');

    // Idempotency: check if an order with this Cashfree order/payment already exists in MongoDB
    const existingOrder = await Order.findOne({
      $or: [
        { 'payment.cfOrderId': resolvedCfOrderId },
        { 'payment.cfPaymentId': resolvedCfPaymentId },
        { 'payment.paymentSessionId': resolvedSessionId },
      ].filter((cond) => Object.values(cond)[0] !== ''),
    });

    if (existingOrder) {
      return res.json({
        success: true,
        message: 'Payment already verified and order confirmed',
        orderId: existingOrder.orderId,
        order: existingOrder,
      });
    }

    // Generate unique Nathan Coffee Order ID
    const generatedOrderId = `NC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Resolve userId from authenticated session, order payload, or customer mobile lookup
    let effectiveUserId = req.user?._id;
    if (!effectiveUserId && orderDetails?.userId && String(orderDetails.userId).match(/^[0-9a-fA-F]{24}$/)) {
      effectiveUserId = orderDetails.userId;
    }

    const cleanCustomerPhone = orderDetails?.customer?.phone
      ? String(orderDetails.customer.phone).replace(/\D/g, '').slice(-10)
      : '';

    if (!effectiveUserId && cleanCustomerPhone && cleanCustomerPhone.length === 10) {
      const existingUser = await User.findOne({ mobileNumber: cleanCustomerPhone });
      if (existingUser) {
        effectiveUserId = existingUser._id;
      }
    }

    const paidTimestamp = successfulPayment?.payment_completion_time
      ? new Date(successfulPayment.payment_completion_time)
      : new Date();

    const newOrder = new Order({
      userId: effectiveUserId,
      orderId: generatedOrderId,
      customer: orderDetails?.customer || {
        name: cfOrder.customer_details?.customer_name || 'Valued Customer',
        email: cfOrder.customer_details?.customer_email || 'customer@Nathancoffee.com',
        phone: cfOrder.customer_details?.customer_phone || cleanCustomerPhone || '9443104462',
        address: {
          doorNo: '2928',
          street: 'South Street',
          city: 'Thanjavur',
          state: 'Tamil Nadu',
          pincode: '613001',
        },
      },
      items: orderDetails?.items || [],
      pricing: orderDetails?.pricing || {
        subtotal: cfOrder.order_amount,
        shippingFee: 0,
        discount: 0,
        totalAmount: cfOrder.order_amount,
      },
      payment: {
        status: 'paid',
        method: 'cashfree',
        cfOrderId: resolvedCfOrderId,
        cfPaymentId: resolvedCfPaymentId,
        paymentSessionId: resolvedSessionId,
        paidAt: paidTimestamp,
      },
      orderStatus: 'processing',
      trackingNumber: `NCTRACK-${Math.floor(10000000 + Math.random() * 90000000)}`,
    });

    const savedOrder = await newOrder.save();

    res.json({
      success: true,
      message: 'Payment verified and order placed successfully!',
      orderId: savedOrder.orderId,
      order: savedOrder,
    });
  } catch (error) {
    const cfErrorData = error.response?.data;
    console.error('Payment Verification Error:', cfErrorData || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: cfErrorData?.message || error.message || 'Server error during payment verification',
      error: cfErrorData || error.message,
    });
  }
});

export default router;
