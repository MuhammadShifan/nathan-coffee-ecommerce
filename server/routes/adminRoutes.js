import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign(
    { id, role: 'admin' },
    process.env.JWT_SECRET || 'Nathan_coffee_super_secret_jwt_key_2026_Thanjavur_thanjavur',
    { expiresIn: '30d' }
  );
};

// @route   POST /api/admin/login
// @desc    Admin authentication & token generation
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (admin && (await admin.matchPassword(password))) {
      admin.lastLogin = new Date();
      await admin.save();

      return res.json({
        success: true,
        data: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          token: generateToken(admin._id),
        },
      });
    }

    // Default master admin fallback for instant setup if DB was freshly started
    const defaultEmail = (process.env.ADMIN_EMAIL || 'admin@Nathancoffee.com').toLowerCase();
    const defaultPassword = process.env.ADMIN_PASSWORD || 'Nathan@2026';

    if (email.toLowerCase().trim() === defaultEmail && password === defaultPassword) {
      // Auto-create in DB if not exists
      let existingAdmin = await Admin.findOne({ email: defaultEmail });
      if (!existingAdmin) {
        existingAdmin = await Admin.create({
          name: 'Nathan Master Admin',
          email: defaultEmail,
          password: defaultPassword,
          role: 'admin',
          lastLogin: new Date(),
        });
      }

      return res.json({
        success: true,
        data: {
          _id: existingAdmin._id,
          name: existingAdmin.name,
          email: existingAdmin.email,
          role: existingAdmin.role,
          token: generateToken(existingAdmin._id),
        },
      });
    }

    res.status(401).json({ success: false, message: 'Invalid admin email or password' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/me
// @desc    Get current admin profile
router.get('/me', protectAdmin, async (req, res) => {
  res.json({
    success: true,
    data: req.admin,
  });
});

// @route   GET /api/admin/orders
// @desc    Get ALL customer orders without userId filtering (Admin)
router.get('/orders', protectAdmin, async (req, res) => {
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
    console.error('Error in /api/admin/orders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/orders/stats/summary
// @desc    Get dashboard metrics across all orders
router.get('/orders/stats/summary', protectAdmin, async (req, res) => {
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

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status, courier, tracking
router.put('/orders/:id/status', protectAdmin, async (req, res) => {
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
