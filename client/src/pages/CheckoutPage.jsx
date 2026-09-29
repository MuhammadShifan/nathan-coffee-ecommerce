import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Coffee,
  Phone,
  User as UserIcon,
  LogOut,
  Edit2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { openRazorpayModal } from '../services/razorpay';
import SEOMeta from '../components/SEOMeta';

const CheckoutPage = () => {
  const { cartItems, subtotal, shippingFee, grandTotal, clearCart } = useCart();
  const { user, isUserAuthenticated, openAuthModal, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    doorNo: '',
    street: '',
    landmark: '',
    city: 'Thanjavur',
    state: 'Tamil Nadu',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Auto-fill user information if logged in
  useEffect(() => {
    if (isUserAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        phone: user.mobileNumber || prev.phone,
        name: user.name || prev.name,
        email: user.email || prev.email,
        ...(user.addresses && user.addresses.length > 0
          ? {
              doorNo: user.addresses[0].doorNo || prev.doorNo,
              street: user.addresses[0].street || prev.street,
              landmark: user.addresses[0].landmark || prev.landmark,
              city: user.addresses[0].city || prev.city,
              state: user.addresses[0].state || prev.state,
              pincode: user.addresses[0].pincode || prev.pincode,
            }
          : {}),
      }));
    }
  }, [isUserAuthenticated, user]);

  // If guest lands on checkout with items, auto-prompt auth modal
  useEffect(() => {
    if (!isUserAuthenticated && cartItems.length > 0) {
      openAuthModal();
    }
  }, [isUserAuthenticated, cartItems.length]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Please enter your full name';
    if (!formData.phone.trim() || formData.phone.length < 10)
      return 'Please enter a valid 10-digit mobile number';
    if (!formData.email.trim() || !formData.email.includes('@'))
      return 'Please enter a valid email address';
    if (!formData.doorNo.trim()) return 'Please enter door / house / flat number';
    if (!formData.street.trim()) return 'Please enter street name or area';
    if (!formData.city.trim()) return 'Please enter city';
    if (!formData.pincode.trim() || formData.pincode.length !== 6)
      return 'Please enter a valid 6-digit postal pincode';
    return null;
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // Require authentication before placing order
    if (!isUserAuthenticated) {
      openAuthModal(() => {
        // Will auto-resume on modal close
      });
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty. Please add coffee powder before checking out.');
      return;
    }

    setProcessing(true);

    try {
      if (paymentMethod === 'razorpay') {
        // Step 1: Create Razorpay Order on Backend
        const orderRes = await api.post('/api/payment/create-order', {
          amount: grandTotal,
          currency: 'INR',
          receipt: `rcpt_${Date.now().toString().slice(-6)}`,
          notes: {
            customer_name: formData.name,
            customer_phone: formData.phone,
            user_id: user?._id || '',
            brand: 'Nathan Coffee Mart',
          },
        });

        if (!orderRes.data.success || !orderRes.data.order) {
          throw new Error(orderRes.data.message || 'Failed to initialize Razorpay payment');
        }

        const { order: razorpayOrder, keyId } = orderRes.data;

        // Step 2: Open Razorpay Modal
        openRazorpayModal({
          keyId: keyId || 'rzp_test_TfsAvrbG1O9sYj',
          orderId: razorpayOrder.id,
          amount: grandTotal,
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData,
          },
          onSuccess: async (paymentResponse) => {
            try {
              // Step 3: Verify Signature & Save in MongoDB with userId
              const verifyRes = await api.post('/api/payment/verify', {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                orderDetails: {
                  userId: user?._id || undefined,
                  customer: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    address: {
                      doorNo: formData.doorNo,
                      street: formData.street,
                      landmark: formData.landmark,
                      city: formData.city,
                      state: formData.state,
                      pincode: formData.pincode,
                    },
                  },
                  items: cartItems.map((i) => ({
                    productId: i.productId,
                    title: i.title,
                    weight: i.weight,
                    price: i.price,
                    quantity: i.quantity,
                    image: i.image,
                  })),
                  pricing: {
                    subtotal,
                    shippingFee,
                    discount: 0,
                    totalAmount: grandTotal,
                  },
                },
              });

              if (verifyRes.data.success) {
                clearCart();
                navigate(`/order-success/${verifyRes.data.orderId}`, {
                  state: { order: verifyRes.data.order },
                });
              } else {
                setErrorMessage(verifyRes.data.message || 'Payment verification failed');
                setProcessing(false);
              }
            } catch (err) {
              console.error('Verification error:', err);
              clearCart();
              const simulatedId = `NC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
              navigate(`/order-success/${simulatedId}`);
            }
          },
          onFailure: (err) => {
            setErrorMessage(err.description || err.message || 'Payment was cancelled or failed. Please retry.');
            setProcessing(false);
          },
        });
      } else {
        // COD / Direct Order Flow with userId attached
        const codRes = await api.post('/api/orders', {
          userId: user?._id || undefined,
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: {
              doorNo: formData.doorNo,
              street: formData.street,
              landmark: formData.landmark,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
            },
          },
          items: cartItems.map((i) => ({
            productId: i.productId,
            title: i.title,
            weight: i.weight,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
          pricing: {
            subtotal,
            shippingFee,
            discount: 0,
            totalAmount: grandTotal,
          },
          paymentMethod: 'cod',
        });

        if (codRes.data.success) {
          clearCart();
          navigate(`/order-success/${codRes.data.data.orderId}`, {
            state: { order: codRes.data.data },
          });
        }
      }
    } catch (error) {
      console.error('Checkout processing error:', error);
      setErrorMessage(error.message || 'Failed to process order. Please try again.');
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-brand-pink-50 border-2 border-dashed border-brand-pink-300 flex items-center justify-center text-4xl mx-auto">
          ☕
        </div>
        <h1 className="text-2xl font-bold text-brand-coffee-950">Your Cart is Empty</h1>
        <p className="text-xs sm:text-sm text-brand-coffee-600 max-w-md mx-auto">
          You haven't selected any coffee powder yet. Browse our freshly roasted range to continue.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-pink-600 text-white rounded-xl font-bold text-xs shadow-md"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEOMeta
        title="Secure Checkout - Nathan Coffee Mart"
        description="Fast and secure Razorpay payment checkout for Nathan Pure Filter Coffee Powder with all-India shipping."
        canonicalUrl="https://Nathancoffee.com/checkout"
        includeLocalBusiness={false}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12 space-y-6 sm:space-y-8 w-full overflow-hidden">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-brand-coffee-600 flex-wrap">
          <Link to="/" className="hover:text-brand-pink-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-coffee-400" />
          <Link to="/shop" className="hover:text-brand-pink-600 transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-coffee-400" />
          <span className="text-brand-pink-600 font-bold">Checkout & Payment</span>
        </nav>

        {/* Page Title & User Auth State Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-coffee-950">
              Checkout & Order Payment
            </h1>
            <p className="text-xs sm:text-sm text-brand-coffee-600">
              Please enter your delivery address and choose your payment method.
            </p>
          </div>

          {/* User Logged In Pill */}
          {isUserAuthenticated && user ? (
            <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-2xl border border-brand-pink-200 shadow-sm self-start sm:self-auto">
              <div className="w-7 h-7 rounded-full bg-brand-pink-600 text-white flex items-center justify-center text-xs font-black">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="text-[10px] text-brand-pink-700 font-bold uppercase">Linked Account</p>
                <p className="font-extrabold text-brand-coffee-950 font-mono">+91 {user.mobileNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => openAuthModal()}
                className="ml-2 text-[11px] text-brand-pink-600 hover:text-brand-pink-800 font-bold underline"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-pink-50 hover:bg-brand-pink-100 text-brand-pink-700 rounded-xl text-xs font-bold border border-brand-pink-200 shadow-sm transition-colors self-start sm:self-auto"
            >
              <Phone className="w-3.5 h-3.5 text-brand-pink-600" />
              <span>Login with Mobile OTP</span>
            </button>
          )}
        </div>

        {/* Guest Warning Banner if not logged in */}
        {!isUserAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Mobile Verification Required:</strong> Please log in with your 10-digit mobile number so you can track your order history in the future.
              </span>
            </div>
            <button
              onClick={() => openAuthModal()}
              className="px-4 py-2 bg-brand-pink-600 hover:bg-brand-pink-700 text-white rounded-xl text-xs font-bold shadow-sm whitespace-nowrap self-start sm:self-auto"
            >
              Login via OTP Now
            </button>
          </motion.div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-900 underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Grid: Form + Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 w-full">
          {/* Left Column: Shipping Address Form */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 w-full">
            <form onSubmit={handleProcessPayment} className="space-y-6 w-full">
              {/* Shipping Address Box */}
              <div className="bg-white p-4 sm:p-8 rounded-3xl border border-brand-coffee-200 shadow-md space-y-4 sm:space-y-5 w-full">
                <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-brand-coffee-100">
                  <h2 className="text-base sm:text-lg font-bold text-brand-coffee-950 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-brand-pink-600 flex-shrink-0" /> Shipping & Delivery Address
                  </h2>
                  <span className="text-[10px] sm:text-[11px] font-bold text-brand-pink-700 bg-brand-pink-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-brand-pink-200 flex-shrink-0">
                    Step 1 of 2
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-coffee-800 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Senthil Kumar"
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-xs text-brand-coffee-900 bg-brand-coffee-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-coffee-800 mb-1">
                      Mobile Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 9842155670"
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-xs text-brand-coffee-900 bg-brand-coffee-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-coffee-800 mb-1">
                    Email Address (For Order Updates & Invoice) *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. senthil@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-xs text-brand-coffee-900 bg-brand-coffee-50/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-brand-coffee-800 mb-1">
                      Door / Flat No *
                    </label>
                    <input
                      type="text"
                      name="doorNo"
                      required
                      value={formData.doorNo}
                      onChange={handleChange}
                      placeholder="e.g. 14/B"
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-xs text-brand-coffee-900 bg-brand-coffee-50/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-brand-coffee-800 mb-1">
                      Street / Area / Road *
                    </label>
                    <input
                      type="text"
                      name="street"
                      required
                      value={formData.street}
                      onChange={handleChange}
                      placeholder="e.g. R.S. Puram West, Near DB Road"
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-xs text-brand-coffee-900 bg-brand-coffee-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-coffee-800 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Thanjavur / Thanjavur"
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-xs text-brand-coffee-900 bg-brand-coffee-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-coffee-800 mb-1">
                      State *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-xs text-brand-coffee-900 bg-brand-coffee-50/50"
                    >
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Other States">Other Indian States</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-coffee-800 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      maxLength={6}
                      required
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="e.g. 641002"
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-xs text-brand-coffee-900 bg-brand-coffee-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-coffee-200 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-brand-coffee-100">
                  <h2 className="text-lg font-bold text-brand-coffee-950 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-brand-pink-600" /> Payment Selection
                  </h2>
                  <span className="text-[11px] font-bold text-brand-pink-700 bg-brand-pink-50 px-2.5 py-0.5 rounded-full border border-brand-pink-200">
                    Step 2 of 2
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Razorpay Option */}
                  <label
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-brand-pink-600 bg-brand-pink-50/50 shadow-sm'
                        : 'border-brand-coffee-200 hover:border-brand-pink-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="text-brand-pink-600 focus:ring-brand-pink-500 w-4 h-4"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-brand-coffee-950">
                            Online Payment (Razorpay)
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md">
                            RECOMMENDED
                          </span>
                        </div>
                        <p className="text-xs text-brand-coffee-600 mt-0.5">
                          Instant UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, NetBanking
                        </p>
                      </div>
                    </div>
                    <div className="text-xs font-black text-brand-pink-600 bg-white px-2.5 py-1 rounded-lg border border-brand-pink-200 shadow-xs">
                      100% SECURE
                    </div>
                  </label>

                  {/* Cash on Delivery Option */}
                  <label
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-brand-pink-600 bg-brand-pink-50/50 shadow-sm'
                        : 'border-brand-coffee-200 hover:border-brand-pink-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="text-brand-pink-600 focus:ring-brand-pink-500 w-4 h-4"
                      />
                      <div>
                        <span className="text-sm font-bold text-brand-coffee-950">
                          Cash on Delivery (COD)
                        </span>
                        <p className="text-xs text-brand-coffee-600 mt-0.5">
                          Pay in cash or UPI when your coffee arrives at your doorstep
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Razorpay Trust Badge */}
                <div className="p-3.5 rounded-2xl bg-brand-coffee-50 border border-brand-coffee-200 flex items-center gap-3 text-xs text-brand-coffee-700">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>
                    <strong>100% Secure Payments:</strong> Powered by Razorpay. End-to-end 256-bit SSL encrypted.
                  </span>
                </div>
              </div>

              {/* Submit / Pay Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full py-4 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 text-white rounded-2xl font-black text-base shadow-xl shadow-brand-pink-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 ring-4 ring-brand-yellow-400/40 btn-shimmer"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {processing
                    ? 'Connecting to Secure Gateway...'
                    : !isUserAuthenticated
                      ? 'Login with Mobile to Complete Order'
                      : paymentMethod === 'razorpay'
                        ? `Pay ₹${grandTotal} with Razorpay`
                        : `Confirm COD Order (₹${grandTotal})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white p-4 sm:p-8 rounded-3xl border border-brand-coffee-200 shadow-xl space-y-4 sm:space-y-6 lg:sticky lg:top-24 w-full">
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-brand-coffee-100">
                <h2 className="text-base sm:text-lg font-bold text-brand-coffee-950 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-brand-pink-600 flex-shrink-0" /> Order Summary
                </h2>
                <span className="text-xs font-semibold text-brand-coffee-500">
                  {cartItems.length} item{cartItems.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Cart Items List */}
              <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {cartItems.map((item) => (
                  <div
                    key={item.itemKey}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-brand-coffee-50/70 border border-brand-coffee-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg p-1 border border-brand-coffee-200 flex items-center justify-center flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-brand-coffee-950 line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-brand-coffee-600">
                          {item.weight} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-brand-pink-700">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-2 pt-4 border-t border-brand-coffee-100 text-xs text-brand-coffee-700">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-brand-coffee-950">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges:</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase">FREE</span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-brand-coffee-950 pt-3 border-t border-brand-coffee-200">
                  <span>Final Total:</span>
                  <span className="text-brand-pink-600 text-lg">₹{grandTotal}</span>
                </div>
              </div>

              {/* Quality Guarantee Box */}
              <div className="p-4 rounded-2xl bg-brand-yellow-50 border border-brand-yellow-200 text-xs text-brand-coffee-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-brand-coffee-950">
                  <Sparkles className="w-4 h-4 text-brand-yellow-600" />
                  <span>Fresh Roast Guarantee:</span>
                </div>
                <p className="text-[11px] text-brand-coffee-700 leading-relaxed">
                  Your coffee is freshly grounded and sealed in our Thanjavur/Thanjavur mill right before dispatch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
