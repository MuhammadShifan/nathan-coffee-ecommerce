import express from 'express';
import Order from '../models/Order.js';
import { protectUserOptional } from '../middleware/auth.js';
import { defaultProductsData } from './productRoutes.js';
import { getCashfreeClient, createCashfreeOrder } from '../utils/cashfreeClient.js';
import {
  STANDARD_DELIVERY_CHARGE,
  isValidTamilNaduPincode,
  resolveAuthoritativeCart,
  calculateCheckoutTotals,
} from '../utils/pricing.js';
import {
  generateNathanOrderId,
  generateTrackingNumber,
  resolveEffectiveUserId,
} from '../utils/orderHelpers.js';

const router = express.Router();

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
    const { amount, items, currency = 'INR', customer, pincode, orderNote, returnUrl } = req.body;

    // If delivery pincode is supplied on direct create-order calls, enforce Tamil Nadu restriction
    const incomingPincode = customer?.address?.pincode ?? pincode;
    if (incomingPincode !== undefined && !isValidTamilNaduPincode(incomingPincode)) {
      return res.status(400).json({
        success: false,
        message: 'Delivery restricted to Tamil Nadu only.',
      });
    }

    let orderAmount = Number(Number(amount).toFixed(2));

    // When items are provided, compute authoritative Prepaid total server-side
    if (Array.isArray(items) && items.length > 0) {
      const { subtotal } = await resolveAuthoritativeCart(items, defaultProductsData);
      const totals = calculateCheckoutTotals(subtotal);
      orderAmount = totals.finalTotal;
    }

    if (!orderAmount || orderAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order amount. Amount must be greater than 0.',
      });
    }

    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
    const { orderData } = await createCashfreeOrder({
      amount: orderAmount,
      currency,
      customer,
      reqUser: req.user,
      orderNote,
      returnUrl,
      origin,
    });

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

    const effectiveUserId = await resolveEffectiveUserId({
      reqUser: req.user,
      candidateUserId: orderDetails?.userId,
      customerPhone: orderDetails?.customer?.phone || cfOrder.customer_details?.customer_phone,
    });

    const paidAmount = Number(cfOrder.order_amount) || 439;
    let verifiedItems = orderDetails?.items || [];
    let resolvedSubtotal = Math.max(0, paidAmount - STANDARD_DELIVERY_CHARGE);

    if (Array.isArray(orderDetails?.items) && orderDetails.items.length > 0) {
      const cartResult = await resolveAuthoritativeCart(orderDetails.items, defaultProductsData);
      verifiedItems = cartResult.verifiedItems;
      resolvedSubtotal = cartResult.subtotal;
    }

    const paidTimestamp = successfulPayment?.payment_completion_time
      ? new Date(successfulPayment.payment_completion_time)
      : new Date();

    const newOrder = new Order({
      userId: effectiveUserId,
      orderId: generateNathanOrderId(),
      customer: orderDetails?.customer || {
        name: cfOrder.customer_details?.customer_name || 'Valued Customer',
        email: cfOrder.customer_details?.customer_email || 'customer@Nathancoffee.com',
        phone: cfOrder.customer_details?.customer_phone || '9443104462',
        address: {
          doorNo: '2928',
          street: 'South Street',
          city: 'Thanjavur',
          state: 'Tamil Nadu',
          pincode: '613001',
        },
      },
      items: verifiedItems,
      pricing: {
        subtotal: resolvedSubtotal,
        shippingFee: STANDARD_DELIVERY_CHARGE,
        codFee: 0,
        discount: 0,
        totalAmount: paidAmount,
      },
      paymentMethod: 'Prepaid',
      deliveryCharge: STANDARD_DELIVERY_CHARGE,
      codFee: 0,
      finalTotal: paidAmount,
      payment: {
        status: 'paid',
        method: 'cashfree',
        cfOrderId: resolvedCfOrderId,
        cfPaymentId: resolvedCfPaymentId,
        paymentSessionId: resolvedSessionId,
        paidAt: paidTimestamp,
      },
      orderStatus: 'processing',
      trackingNumber: generateTrackingNumber(),
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
