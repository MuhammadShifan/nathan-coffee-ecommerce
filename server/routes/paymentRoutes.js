import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import { protectUserOptional } from '../middleware/auth.js';

const router = express.Router();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_TfsAvrbG1O9sYj',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'q7r0zudm2LjpLv8x72GKbhvp',
});

// @route   GET /api/payment/config
// @desc    Get Razorpay public Key ID
router.get('/config', (req, res) => {
  res.json({
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TfsAvrbG1O9sYj',
  });
});

// @route   POST /api/payment/create-order
// @desc    Create Razorpay Order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid order amount' });
    }

    // Razorpay accepts amount in paise (1 INR = 100 paise)
    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `rec_${Date.now().toString().slice(-8)}`,
      notes: notes || { business: 'Nadhan Coffee Mart' },
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    res.json({
      success: true,
      order: razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TfsAvrbG1O9sYj',
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay payment order',
      error: error.message,
    });
  }
});

// @route   POST /api/payment/verify
// @desc    Verify Razorpay payment signature & save complete order
router.post('/verify', protectUserOptional, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing Razorpay signature or payment details',
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'q7r0zudm2LjpLv8x72GKbhvp';
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid Signature',
      });
    }

    // Generate unique Nathan Coffee Order ID
    const generatedOrderId = `NC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Resolve userId from authenticated session or order payload
    const effectiveUserId = req.user?._id || (orderDetails?.userId && orderDetails.userId.match(/^[0-9a-fA-F]{24}$/) ? orderDetails.userId : undefined);

    const newOrder = new Order({
      userId: effectiveUserId,
      orderId: generatedOrderId,
      customer: orderDetails?.customer || {
        name: 'Valued Customer',
        email: 'customer@nadhancoffee.com',
        phone: '9443104462',
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
        subtotal: orderDetails?.totalAmount || 299,
        shippingFee: 0,
        discount: 0,
        totalAmount: orderDetails?.totalAmount || 299,
      },
      payment: {
        status: 'paid',
        method: 'razorpay',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt: new Date(),
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
    console.error('Payment Verification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during payment verification',
      error: error.message,
    });
  }
});

export default router;
