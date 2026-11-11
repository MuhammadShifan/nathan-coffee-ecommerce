import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protectAdmin, protectUser, protectUserOptional } from '../middleware/auth.js';
import { defaultProductsData } from './productRoutes.js';
import { createCashfreeOrder } from '../utils/cashfreeClient.js';
import {
  isPrepaidPaymentMethod,
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

// @route   POST /api/orders/checkout
// @desc    Validate Tamil Nadu pincode & cart totals server-side and create Cashfree Prepaid order
// @access  Public / Authenticated
router.post('/checkout', protectUserOptional, async (req, res) => {
  try {
    const { customer, items, paymentMethod: rawPaymentMethod, returnUrl } = req.body;

    if (!isPrepaidPaymentMethod(rawPaymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Cash on Delivery (COD) is not available. Only Online Payment (Prepaid) is accepted.',
      });
    }

    // Security check: restrict delivery strictly to Tamil Nadu pincodes (60xxxx - 64xxxx)
    const incomingPincode = String(customer?.address?.pincode ?? req.body.pincode ?? '').trim();
    if (!isValidTamilNaduPincode(incomingPincode)) {
      return res.status(400).json({
        success: false,
        message: 'Delivery restricted to Tamil Nadu only.',
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided for checkout.',
      });
    }

    // Recompute authoritative cart items and Prepaid total strictly on backend (₹399 product + ₹40 delivery = ₹439)
    const { verifiedItems, subtotal } = await resolveAuthoritativeCart(items, defaultProductsData);
    const totals = calculateCheckoutTotals(subtotal);

    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
    const { orderData } = await createCashfreeOrder({
      amount: totals.finalTotal,
      currency: 'INR',
      customer,
      reqUser: req.user,
      orderNote: 'Nathan Coffee Pure Filter Coffee Prepaid Order',
      returnUrl,
      origin,
    });

    return res.json({
      success: true,
      paymentMethod: 'Prepaid',
      message: 'Cashfree prepaid order initialized successfully',
      payment_session_id: orderData.payment_session_id,
      paymentSessionId: orderData.payment_session_id,
      orderId: orderData.order_id,
      cfOrderId: orderData.cf_order_id,
      orderAmount: orderData.order_amount,
      pricing: {
        subtotal: totals.subtotal,
        deliveryCharge: totals.deliveryCharge,
        finalTotal: totals.finalTotal,
      },
      items: verifiedItems,
    });
  } catch (error) {
    const cfErrorData = error.response?.data;
    console.error('Checkout Error:', cfErrorData || error.message);
    return res.status(error.response?.status || 500).json({
      success: false,
      message: cfErrorData?.message || error.message || 'Failed to process checkout order',
      error: cfErrorData || error.message,
    });
  }
});

// @route   POST /api/orders
// @desc    Create new Prepaid customer order (Tamil Nadu only)
// @access  Public / Authenticated
router.post('/', protectUserOptional, async (req, res) => {
  try {
    const { customer, items, paymentMethod: rawPaymentMethod, userId } = req.body;

    if (!isPrepaidPaymentMethod(rawPaymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Cash on Delivery (COD) is not available. Only Online Payment (Prepaid) is accepted.',
      });
    }

    const incomingPincode = String(customer?.address?.pincode ?? req.body.pincode ?? '').trim();
    if (!isValidTamilNaduPincode(incomingPincode)) {
      return res.status(400).json({
        success: false,
        message: 'Delivery restricted to Tamil Nadu only.',
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    const { verifiedItems, subtotal } = await resolveAuthoritativeCart(items, defaultProductsData);
    const totals = calculateCheckoutTotals(subtotal);

    const effectiveUserId = await resolveEffectiveUserId({
      reqUser: req.user,
      candidateUserId: userId,
      customerPhone: customer?.phone,
    });

    const order = new Order({
      userId: effectiveUserId,
      orderId: generateNathanOrderId(),
      customer,
      items: verifiedItems,
      pricing: {
        subtotal: totals.subtotal,
        shippingFee: totals.deliveryCharge,
        codFee: 0,
        discount: 0,
        totalAmount: totals.finalTotal,
      },
      paymentMethod: 'Prepaid',
      deliveryCharge: totals.deliveryCharge,
      codFee: 0,
      finalTotal: totals.finalTotal,
      payment: {
        status: 'paid',
        method: 'cashfree',
      },
      orderStatus: 'processing',
      trackingNumber: generateTrackingNumber(),
    });

    const createdOrder = await order.save();
    res.status(201).json({ success: true, data: createdOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   POST /api/orders/track
// @desc    Track order or get orders by Order ID or Mobile Number (Public lookup for customer convenience)
// @access  Public
router.post('/track', async (req, res) => {
  try {
    const { orderId, phone } = req.body;

    if (!orderId && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either an Order ID or a 10-digit mobile number',
      });
    }

    const orConditions = [];

    if (orderId && String(orderId).trim()) {
      const cleanOrderId = String(orderId).trim().replace(/^#+/, '');
      orConditions.push(
        { orderId: { $regex: `^${cleanOrderId}$`, $options: 'i' } },
        { trackingNumber: { $regex: `^${cleanOrderId}$`, $options: 'i' } }
      );
    }

    if (phone && String(phone).trim()) {
      const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      if (cleanPhone.length === 10) {
        orConditions.push(
          { 'customer.phone': { $regex: cleanPhone + '$' } },
          { 'customer.phone': cleanPhone }
        );
      }
    }

    if (orConditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search criteria. Please provide a valid Order ID or 10-digit phone number.',
      });
    }

    const orders = await Order.find({ $or: orConditions })
      .populate({ path: 'userId', select: 'mobileNumber name email' })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ success: false, message: 'Failed to track order', error: error.message });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Fetch only the orders belonging to the authenticated customer
// @access  Private (User)
router.get('/my-orders', protectUser, async (req, res) => {
  try {
    const userPhone = req.user.mobileNumber;
    const cleanPhone = String(userPhone || '').replace(/\D/g, '').slice(-10);
    const userId = req.user._id;

    // Comprehensive query:
    // 1. By userId ObjectId
    // 2. By customer.phone ending with clean 10-digit number (matches +91..., 0..., plain 10 digits)
    // 3. By customer.email matching req.user.email (if set)
    const orConditions = [{ userId: userId }];

    if (cleanPhone && cleanPhone.length === 10) {
      orConditions.push(
        { 'customer.phone': { $regex: cleanPhone + '$' } },
        { 'customer.phone': cleanPhone }
      );
    }

    if (req.user.email && req.user.email.trim()) {
      orConditions.push({
        'customer.email': { $regex: `^${req.user.email.trim()}$`, $options: 'i' },
      });
    }

    const orders = await Order.find({ $or: orConditions })
      .populate({ path: 'userId', select: 'mobileNumber name email' })
      .sort({ createdAt: -1 });

    // Retroactively link any unlinked orders for this user in background
    if (orders.length > 0) {
      const unlinkedIds = orders.filter((o) => !o.userId).map((o) => o._id);
      if (unlinkedIds.length > 0) {
        Order.updateMany({ _id: { $in: unlinkedIds } }, { $set: { userId } }).catch((err) => {
          console.warn('Failed to retro-link orders to userId:', err.message);
        });
      }
    }

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch your orders', error: error.message });
  }
});

// @route   GET /api/orders/stats/summary
// @desc    Get dashboard metrics across all orders (Admin)
// @access  Private (Admin)
router.get('/stats/summary', protectAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.find({ 'payment.status': 'paid' });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.pricing?.totalAmount || 0), 0);
    const activeProducts = await Product.countDocuments({ inStock: true });
    const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ['Placed', 'processing'] } });
    const dispatchedOrders = await Order.countDocuments({ orderStatus: 'dispatched' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        activeProducts,
        pendingOrders,
        dispatchedOrders,
        deliveredOrders,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/orders/all
// @desc    Get all orders with search & status filter (Admin alias)
// @access  Private (Admin)
router.get('/all', protectAdmin, async (req, res) => {
  return fetchAllAdminOrders(req, res);
});

// @route   GET /api/orders
// @desc    Get all orders with search & status filter (Admin)
// @access  Private (Admin)
router.get('/', protectAdmin, async (req, res) => {
  return fetchAllAdminOrders(req, res);
});

// Shared helper to retrieve ALL orders for Admin without filtering by userId
const fetchAllAdminOrders = async (req, res) => {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { orderId: { $regex: term, $options: 'i' } },
        { 'customer.name': { $regex: term, $options: 'i' } },
        { 'customer.phone': { $regex: term, $options: 'i' } },
        { 'customer.email': { $regex: term, $options: 'i' } },
        { trackingNumber: { $regex: term, $options: 'i' } },
      ];
    }

    // Explicitly query all orders regardless of userId
    const orders = await Order.find(query)
      .populate({ path: 'userId', select: 'mobileNumber name email' })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      total,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/orders/:idOrOrderId
// @desc    Get single order details by MongoDB _id or orderId (e.g. NC-2026-123456)
// @access  Public / Authenticated
router.get('/:idOrOrderId', async (req, res) => {
  try {
    const { idOrOrderId } = req.params;
    let order;

    if (idOrOrderId.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(idOrOrderId).populate({ path: 'userId', select: 'mobileNumber name email' });
    } else {
      const cleanOrderId = idOrOrderId.trim().replace(/^#+/, '');
      order = await Order.findOne({ orderId: { $regex: `^${cleanOrderId}$`, $options: 'i' } }).populate({ path: 'userId', select: 'mobileNumber name email' });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order shipping/delivery status (Admin)
// @access  Private (Admin)
router.put('/:id/status', protectAdmin, async (req, res) => {
  try {
    const { orderStatus, trackingNumber, courierPartner, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courierPartner) order.courierPartner = courierPartner;
    if (notes) order.notes = notes;

    const updatedOrder = await order.save();
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
