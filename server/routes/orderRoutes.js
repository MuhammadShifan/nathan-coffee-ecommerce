import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protectAdmin, protectUser, protectUserOptional } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new customer order (COD or Direct)
// @access  Public / Authenticated
router.post('/', protectUserOptional, async (req, res) => {
  try {
    const { customer, items, pricing, paymentMethod = 'cod', userId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    const generatedOrderId = `NC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Resolve userId from authenticated user or request payload
    const effectiveUserId = req.user?._id || (userId && String(userId).match(/^[0-9a-fA-F]{24}$/) ? userId : undefined);

    const order = new Order({
      userId: effectiveUserId,
      orderId: generatedOrderId,
      customer,
      items,
      pricing,
      payment: {
        status: paymentMethod === 'cod' ? 'pending' : 'paid',
        method: paymentMethod,
      },
      orderStatus: 'processing',
      trackingNumber: `NCTRACK-${Math.floor(10000000 + Math.random() * 90000000)}`,
    });

    const createdOrder = await order.save();
    res.status(201).json({ success: true, data: createdOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Fetch only the orders belonging to the authenticated customer
// @access  Private (User)
router.get('/my-orders', protectUser, async (req, res) => {
  try {
    const userPhone = req.user.mobileNumber;
    const userId = req.user._id;

    // Find orders matching user ID or mobile number
    const orders = await Order.find({
      $or: [
        { userId: userId },
        { 'customer.phone': userPhone },
        { 'customer.phone': `+91${userPhone}` },
        { 'customer.phone': userPhone.slice(-10) },
      ],
    })
      .populate({ path: 'userId', select: 'mobileNumber name email' })
      .sort({ createdAt: -1 });

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
    const pendingOrders = await Order.countDocuments({ orderStatus: 'processing' });
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
      order = await Order.findOne({ orderId: idOrOrderId }).populate({ path: 'userId', select: 'mobileNumber name email' });
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
