import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
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
  Loader2,
  MapPin,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { initiateCashfreeCheckout } from '../services/cashfree';
import SEOMeta from '../components/SEOMeta';

const BASE_PRODUCT_PRICE = 399;
const STANDARD_DELIVERY_CHARGE = 40;
const INDIA_POST_PINCODE_API = 'https://api.postalpincode.in/pincode';
const TAMIL_NADU_PINCODE_FALLBACK_REGEX = /^6[0-4][0-9]{4}$/;

const CheckoutPage = () => {
  const location = useLocation();
  const { cartItems, subtotal: cartSubtotal, clearCart } = useCart();
  const { user, isUserAuthenticated, openAuthModal, logoutUser } = useAuth();
  const navigate = useNavigate();

  // Resolve Buy Now item independently from location.state or sessionStorage
  const [buyNowItem, setBuyNowItem] = useState(() => {
    if (location.state?.buyNowItem) {
      return location.state.buyNowItem;
    }
    if (location.state?.buyNowItem === null) {
      return null;
    }
    try {
      const saved = sessionStorage.getItem('Nathan_buy_now_item');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (location.state?.buyNowItem) {
      setBuyNowItem(location.state.buyNowItem);
      try {
        sessionStorage.setItem('Nathan_buy_now_item', JSON.stringify(location.state.buyNowItem));
      } catch (e) { }
    } else if (location.state?.buyNowItem === null) {
      setBuyNowItem(null);
      try {
        sessionStorage.removeItem('Nathan_buy_now_item');
      } catch (e) { }
    }
  }, [location.state]);

  const isBuyNow = Boolean(buyNowItem);
  const checkoutItems = isBuyNow ? [buyNowItem] : cartItems;

  // Prepaid-only (Cashfree Online Payment)
  const paymentMethod = 'Prepaid';

  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + (Number(item.price) || BASE_PRODUCT_PRICE) * (Number(item.quantity) || 1),
    0
  );
  const deliveryCharge = checkoutItems.length > 0 ? STANDARD_DELIVERY_CHARGE : 0;
  const finalTotal = subtotal + deliveryCharge;

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

  const [pincodeStatus, setPincodeStatus] = useState('idle'); // 'idle' | 'checking' | 'valid' | 'invalid'
  const [pincodeInfo, setPincodeInfo] = useState('');
  const [pincodeError, setPincodeError] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const cleanPincode = formData.pincode.trim();
  const isDeliveryUnavailable =
    pincodeError ||
    pincodeStatus === 'invalid' ||
    pincodeStatus === 'checking' ||
    (cleanPincode.length > 0 && pincodeStatus !== 'valid');

  const completeOrderSuccess = (confirmedOrderId, confirmedOrder, replace = false) => {
    try {
      localStorage.setItem('Nathan_last_order_id', confirmedOrderId);
      sessionStorage.removeItem('Nathan_pending_checkout');
      if (isBuyNow) {
        sessionStorage.removeItem('Nathan_buy_now_item');
      }
    } catch (e) { }

    if (!isBuyNow) {
      clearCart();
    }

    navigate(`/order-success/${confirmedOrderId}`, {
      state: { order: confirmedOrder },
      replace,
    });
  };

  // Check for Cashfree redirect callback in URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cfOrderId = params.get('cf_order_id') || params.get('order_id');

    if (cfOrderId) {
      setProcessing(true);
      let savedOrderDetails = null;
      try {
        const raw = sessionStorage.getItem('Nathan_pending_checkout');
        if (raw) savedOrderDetails = JSON.parse(raw);
      } catch (e) { }

      api
        .post('/api/payment/verify', {
          orderId: cfOrderId,
          orderDetails: savedOrderDetails || undefined,
        })
        .then((res) => {
          if (res.data.success) {
            completeOrderSuccess(res.data.orderId, res.data.order, true);
          } else {
            setErrorMessage(res.data.message || 'Cashfree payment verification failed');
            setProcessing(false);
          }
        })
        .catch((err) => {
          console.error('Redirect verification error:', err);
          setErrorMessage(
            err.response?.data?.message || err.message || 'Failed to verify Cashfree payment'
          );
          setProcessing(false);
        });
    }
  }, [location.search]);

  // Real-time India Post API validation whenever a 6-digit pincode is entered
  useEffect(() => {
    if (!/^\d{6}$/.test(cleanPincode)) {
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    const verifyPincodeWithIndiaPost = async () => {
      setPincodeStatus('checking');
      setPincodeError(false);
      setPincodeInfo('');

      try {
        const response = await axios.get(`${INDIA_POST_PINCODE_API}/${cleanPincode}`, {
          signal: controller.signal,
          timeout: 8000,
        });

        if (!isActive) return;

        const apiResult = Array.isArray(response.data) ? response.data[0] : null;
        const postOffices = Array.isArray(apiResult?.PostOffice) ? apiResult.PostOffice : [];
        const primaryOffice = postOffices[0] || null;
        const isTamilNadu = primaryOffice?.State?.trim() === 'Tamil Nadu';

        if (apiResult?.Status === 'Success' && postOffices.length > 0 && isTamilNadu) {
          const officeName = primaryOffice.Name || primaryOffice.District || cleanPincode;
          const districtName =
            primaryOffice.District && primaryOffice.District !== officeName
              ? `, ${primaryOffice.District}`
              : '';

          setPincodeStatus('valid');
          setPincodeError(false);
          setPincodeInfo(`${officeName}${districtName}`);
        } else {
          setPincodeStatus('invalid');
          setPincodeError(true);
          setPincodeInfo('');
        }
      } catch (err) {
        if (!isActive || axios.isCancel(err)) return;

        console.warn('India Post API lookup failed, using Tamil Nadu range fallback:', err.message);
        if (TAMIL_NADU_PINCODE_FALLBACK_REGEX.test(cleanPincode)) {
          setPincodeStatus('valid');
          setPincodeError(false);
          setPincodeInfo('Tamil Nadu');
        } else {
          setPincodeStatus('invalid');
          setPincodeError(true);
          setPincodeInfo('');
        }
      }
    };

    verifyPincodeWithIndiaPost();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [cleanPincode]);

  // Auto-fill user information if logged in
  useEffect(() => {
    if (isUserAuthenticated && user) {
      const savedAddress = user.addresses && user.addresses.length > 0 ? user.addresses[0] : null;
      const savedPin = savedAddress?.pincode
        ? String(savedAddress.pincode).replace(/\D/g, '').slice(0, 6)
        : '';

      setFormData((prev) => ({
        ...prev,
        phone: user.mobileNumber || prev.phone,
        name: user.name || prev.name,
        email: user.email || prev.email,
        ...(savedAddress
          ? {
            doorNo: savedAddress.doorNo || prev.doorNo,
            street: savedAddress.street || prev.street,
            landmark: savedAddress.landmark || prev.landmark,
            city: savedAddress.city || prev.city,
            state: 'Tamil Nadu',
            pincode: savedPin || prev.pincode,
          }
          : {}),
      }));
    }
  }, [isUserAuthenticated, user]);

  // If guest lands on checkout with items, auto-prompt auth modal
  useEffect(() => {
    if (!isUserAuthenticated && checkoutItems.length > 0) {
      openAuthModal();
    }
  }, [isUserAuthenticated, checkoutItems.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'pincode') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
      setFormData((prev) => ({ ...prev, pincode: digitsOnly }));

      if (digitsOnly.length < 6) {
        setPincodeStatus('idle');
        setPincodeError(false);
        setPincodeInfo('');
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePincodeBlur = () => {
    const trimmedPin = formData.pincode.trim();
    if (trimmedPin.length > 0 && trimmedPin.length < 6) {
      setPincodeStatus('invalid');
      setPincodeError(true);
      setPincodeInfo('');
    }
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
    if (pincodeStatus === 'checking') {
      return 'Verifying your delivery pincode, please wait a moment.';
    }
    if (cleanPincode.length !== 6 || pincodeStatus !== 'valid' || pincodeError) {
      setPincodeError(true);
      return 'Delivery is currently available only for valid Tamil Nadu pincodes.';
    }
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

    if (checkoutItems.length === 0) {
      setErrorMessage('Your checkout is empty. Please add coffee powder before checking out.');
      return;
    }

    setProcessing(true);

    try {
      // Build order details payload
      const orderDetailsPayload = {
        userId: user?._id || undefined,
        paymentMethod,
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
        items: checkoutItems.map((i) => ({
          productId: i.productId,
          title: i.title,
          weight: i.weight,
          price: Number(i.price) || BASE_PRODUCT_PRICE,
          quantity: Number(i.quantity) || 1,
          image: i.image,
        })),
        pricing: {
          subtotal,
          shippingFee: deliveryCharge,
          codFee: 0,
          discount: 0,
          totalAmount: finalTotal,
        },
        deliveryCharge,
        codFee: 0,
        finalTotal,
      };

      // Step 1: Validate Tamil Nadu pincode & totals server-side and create Prepaid Cashfree order
      const checkoutRes = await api.post('/api/orders/checkout', {
        ...orderDetailsPayload,
        returnUrl: `${window.location.origin}/checkout?cf_order_id={order_id}`,
      });

      if (!checkoutRes.data.success) {
        throw new Error(checkoutRes.data.message || 'Failed to process checkout order');
      }

      const paymentSessionId =
        checkoutRes.data.payment_session_id || checkoutRes.data.paymentSessionId;
      const cfMerchantOrderId = checkoutRes.data.orderId;

      if (!paymentSessionId || !cfMerchantOrderId) {
        throw new Error(checkoutRes.data.message || 'Failed to initialize Cashfree payment session');
      }

      // Sync authoritative backend pricing if needed and persist pending checkout for redirect fallback
      try {
        sessionStorage.setItem('Nathan_pending_checkout', JSON.stringify(orderDetailsPayload));
      } catch (e) { }

      // Step 2: Open Cashfree Checkout Modal in production mode
      await initiateCashfreeCheckout({
        paymentSessionId,
        redirectTarget: '_modal',
        mode: 'production',
        onSuccess: async () => {
          try {
            // Step 3: Verify Payment & Save confirmed order into MongoDB
            const verifyRes = await api.post('/api/payment/verify', {
              orderId: cfMerchantOrderId,
              orderDetails: orderDetailsPayload,
            });

            if (verifyRes.data.success) {
              completeOrderSuccess(verifyRes.data.orderId, verifyRes.data.order);
            } else {
              setErrorMessage(verifyRes.data.message || 'Payment verification failed');
              setProcessing(false);
            }
          } catch (err) {
            console.error('Verification error:', err);
            const msg =
              err.response?.data?.message ||
              err.message ||
              'Payment verification failed. Please check your network or contact support.';
            setErrorMessage(msg);
            setProcessing(false);
          }
        },
        onFailure: (err) => {
          console.warn('Payment failed or modal closed:', err);
          // Check backend status in case payment was completed right before modal closed
          api
            .get(`/api/payment/order-status/${cfMerchantOrderId}`)
            .then(async (statusRes) => {
              if (statusRes.data?.order?.order_status === 'PAID') {
                const verifyRes = await api.post('/api/payment/verify', {
                  orderId: cfMerchantOrderId,
                  orderDetails: orderDetailsPayload,
                });
                if (verifyRes.data.success) {
                  completeOrderSuccess(verifyRes.data.orderId, verifyRes.data.order);
                  return;
                }
              }
              setErrorMessage(
                err?.message || 'Payment was cancelled or could not be completed. Please retry.'
              );
              setProcessing(false);
            })
            .catch(() => {
              setErrorMessage(err?.message || 'Payment was cancelled or failed. Please retry.');
              setProcessing(false);
            });
        },
      });
    } catch (error) {
      console.error('Checkout processing error:', error);
      setErrorMessage(error.response?.data?.message || error.message || 'Failed to process order. Please try again.');
      setProcessing(false);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-brand-pink-50 border-2 border-dashed border-brand-pink-300 flex items-center justify-center text-4xl mx-auto">
          ☕
        </div>
        <h1 className="text-2xl font-bold text-brand-coffee-950">Your Checkout is Empty</h1>
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
        title="Secure Checkout - Nathan Coffee"
        description="Fast and secure Cashfree payment checkout for Nathan Pure Filter Coffee Powder with all-India shipping."
        canonicalUrl="/checkout"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      placeholder="e.g. Thanjavur / Chennai / Coimbatore"
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-xs text-brand-coffee-900 bg-brand-coffee-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-coffee-800 mb-1">
                      State (Tamil Nadu Only) *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-xs text-brand-coffee-900 bg-brand-coffee-50/50"
                    >
                      <option value="Tamil Nadu">Tamil Nadu</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-coffee-800 mb-1">
                    Shipping Pincode
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="pincode"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={formData.pincode}
                      onChange={handleChange}
                      onBlur={handlePincodeBlur}
                      placeholder="e.g. 613001"
                      className={`w-full px-4 py-2.5 pr-10 rounded-xl border focus:ring-2 focus:outline-none text-xs text-brand-coffee-900 bg-brand-coffee-50/50 ${pincodeError
                          ? 'border-red-500 focus:ring-red-400 bg-red-50/40'
                          : pincodeStatus === 'valid'
                            ? 'border-emerald-500 focus:ring-emerald-400 bg-emerald-50/30'
                            : 'border-brand-coffee-200 focus:ring-brand-pink-500'
                        }`}
                    />
                    {pincodeStatus === 'checking' && (
                      <Loader2 className="w-4 h-4 text-brand-pink-600 animate-spin absolute right-3 top-2.5" />
                    )}
                    {pincodeStatus === 'valid' && !pincodeError && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-2.5" />
                    )}
                  </div>

                  {pincodeStatus === 'checking' && (
                    <p className="mt-1.5 text-xs font-medium text-brand-coffee-600 flex items-center gap-1.5">
                      <span>Checking delivery availability for {cleanPincode}...</span>
                    </p>
                  )}

                  {/* {pincodeStatus === 'valid' && !pincodeError && pincodeInfo && (
                    <p className="mt-1.5 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Delivery available to {pincodeInfo}</span>
                    </p>
                  )} */}

                  {pincodeError && (
                    <p className="mt-1.5 text-xs font-semibold text-red-600 leading-snug" role="alert">
                      Delivery not available for this location. Please contact{' '}
                      <a
                        href="https://wa.me/916383805976?text=Hi,%20I%20want%20to%20order%20Nathan%20Coffee%20but%20delivery%20is%20showing%20unavailable%20for%20my%20pincode."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-bold text-red-700 hover:text-red-800"
                      >
                        +91 63838 05976
                      </a>{' '}
                      on WhatsApp.
                    </p>
                  )}
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
                  {/* Online Payment Only (Cashfree Payments) */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-brand-pink-600 bg-brand-pink-50/60 shadow-sm">
                    <div className="flex items-start sm:items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Prepaid"
                        checked={true}
                        readOnly
                        className="mt-1 sm:mt-0 text-brand-pink-600 focus:ring-brand-pink-500 w-4 h-4 cursor-default"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-brand-coffee-950">
                            Online Payment (Cashfree Payments)
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md">
                            PREPAID ONLY • 100% SECURE
                          </span>
                        </div>
                        <p className="text-xs text-brand-coffee-600 mt-0.5">
                          UPI (GPay, PhonePe, Paytm), Debit/Credit Cards & NetBanking via Cashfree
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 pl-2">
                      <span className="text-sm font-black text-brand-pink-700">
                        ₹{finalTotal}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit / Pay Button */}
              <button
                type="submit"
                disabled={processing || isDeliveryUnavailable}
                className="w-full py-4 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 text-white rounded-2xl font-black text-base shadow-xl shadow-brand-pink-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ring-4 ring-brand-yellow-400/40 btn-shimmer"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {processing
                    ? 'Connecting to Secure Gateway...'
                    : pincodeStatus === 'checking'
                      ? 'Verifying Pincode...'
                      : !isUserAuthenticated
                        ? 'Login with Mobile to Complete Order'
                        : `Pay Now • ₹${finalTotal}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white p-4 sm:p-8 rounded-3xl border border-brand-coffee-200 shadow-xl space-y-4 sm:space-y-6 lg:sticky lg:top-24 w-full">
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-brand-coffee-100">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-brand-coffee-950 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-brand-pink-600 flex-shrink-0" /> Order Summary
                  </h2>
                  {isBuyNow && (
                    <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Express Direct Order
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-brand-coffee-500">
                  {checkoutItems.length} item{checkoutItems.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Cart / Buy Now Items List */}
              <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {checkoutItems.map((item) => (
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
              <div className="space-y-2.5 pt-4 border-t border-brand-coffee-100 text-xs text-brand-coffee-700">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-brand-coffee-950">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span className="font-bold text-brand-coffee-950">₹{deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-base font-black text-brand-coffee-950 pt-3 border-t border-brand-coffee-200">
                  <span>Final Total:</span>
                  <span className="text-brand-pink-600 text-lg">₹{finalTotal}</span>
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
