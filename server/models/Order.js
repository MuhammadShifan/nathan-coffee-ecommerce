import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
  productId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  weight: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: {
        doorNo: { type: String, required: true },
        street: { type: String, required: true },
        landmark: { type: String, default: '' },
        city: { type: String, required: true },
        state: { type: String, required: true, default: 'Tamil Nadu' },
        pincode: { type: String, required: true },
      },
    },
    items: [orderItemSchema],
    pricing: {
      subtotal: { type: Number, required: true },
      shippingFee: { type: Number, default: 40 },
      codFee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['Prepaid', 'COD'],
      default: 'Prepaid',
    },
    deliveryCharge: {
      type: Number,
      default: 40,
      min: 0,
    },
    codFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    payment: {
      status: {
        type: String,
        enum: ['paid', 'pending', 'failed', 'refunded'],
        default: 'pending',
      },
      method: {
        type: String,
        enum: ['cashfree', 'razorpay', 'cod', 'upi'],
        default: 'cashfree',
      },
      cfOrderId: { type: String },
      cfPaymentId: { type: String },
      paymentSessionId: { type: String },
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      paidAt: { type: Date },
    },
    orderStatus: {
      type: String,
      enum: ['Placed', 'processing', 'dispatched', 'delivered', 'cancelled'],
      default: 'Placed',
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    courierPartner: {
      type: String,
      default: 'Professional Couriers / ST Couriers',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
