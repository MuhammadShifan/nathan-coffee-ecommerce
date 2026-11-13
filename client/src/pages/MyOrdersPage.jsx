import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ShoppingBag,
  Calendar,
  Clock,
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
  Copy,
  Check,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Coffee,
  RotateCcw,
  LogOut,
  User as UserIcon,
  RefreshCw,
  Search,
  Printer,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SEOMeta from '../components/SEOMeta';

const MyOrdersPage = () => {
  const { user, isUserAuthenticated, openAuthModal, logoutUser } = useAuth();
  const { addToCart, showToast, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  // Guest / Direct Tracking Lookup state
  const [trackQuery, setTrackQuery] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState(null);
  const [guestOrders, setGuestOrders] = useState(null);

  // Check if a recent order was placed from this browser
  const [lastOrderId, setLastOrderId] = useState(() => {
    try {
      return localStorage.getItem('Nathan_last_order_id') || null;
    } catch {
      return null;
    }
  });

  const fetchOrders = async (isManualRefresh = false) => {
    if (!isUserAuthenticated) {
      setLoading(false);
      return;
    }

    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setSessionExpiredNotice(false);

    try {
      const res = await api.get('/api/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch user orders:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setSessionExpiredNotice(true);
        logoutUser();
        showToast('Your session has expired. Please log in with your mobile number to view orders.', 'info');
      } else {
        showToast('Failed to load your orders. Please try refreshing.', 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isUserAuthenticated]);

  // If guest lands on page with a lastOrderId saved, pre-populate trackQuery and auto-lookup
  useEffect(() => {
    if (!isUserAuthenticated && lastOrderId && !guestOrders) {
      const cleanId = String(lastOrderId).trim().replace(/^#+/, '');
      setTrackQuery(cleanId);
      api
        .post('/api/orders/track', { orderId: cleanId })
        .then((res) => {
          if (res.data.success && res.data.data?.length > 0) {
            setGuestOrders(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [isUserAuthenticated, lastOrderId]);

  // Copy order ID to clipboard
  const handleCopyOrderId = (orderId) => {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(orderId);
    showToast(`Order ID ${orderId} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Reorder items
  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;

    order.items.forEach((item) => {
      addToCart(
        {
          _id: item.productId,
          slug: item.productId,
          title: item.title,
          price: item.price,
          images: [{ url: item.image, isPrimary: true }],
        },
        item.weight,
        item.quantity,
        false
      );
    });

    showToast(`Added items from #${order.orderId} to your cart! ☕`, 'success');
    setIsCartOpen(true);
  };

  // Handle Guest Direct Track Lookup
  const handleTrackSubmit = async (e) => {
    e?.preventDefault();
    const query = trackQuery.trim();
    if (!query) {
      setTrackError('Please enter an Order ID or 10-digit mobile number');
      return;
    }

    setTrackLoading(true);
    setTrackError(null);

    try {
      const cleanDigits = query.replace(/\D/g, '');
      const isMobile = cleanDigits.length === 10;

      const payload = isMobile
        ? { phone: cleanDigits }
        : { orderId: query.trim().replace(/^#+/, '') };

      const res = await api.post('/api/orders/track', payload);
      if (res.data.success && res.data.data) {
        if (res.data.data.length === 0) {
          setTrackError(`No orders found matching "${query}". Please check the Order ID or Mobile Number.`);
          setGuestOrders([]);
        } else {
          setGuestOrders(res.data.data);
          showToast(`Found ${res.data.data.length} order(s)! ☕`, 'success');
        }
      }
    } catch (err) {
      setTrackError(err.response?.data?.message || 'Failed to search order. Please try again.');
    } finally {
      setTrackLoading(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Delivered</span>
          </span>
        );
      case 'dispatched':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>Dispatched / In Transit</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Cancelled</span>
          </span>
        );
      case 'Placed':
      case 'placed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Order Placed</span>
          </span>
        );
      case 'processing':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>Order Processing / Roasting</span>
          </span>
        );
    }
  };

  // Payment Badge Helper
  const getPaymentBadge = (payment, paymentMethod) => {
    if (paymentMethod === 'COD' || payment?.method === 'cod') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          💵 Cash on Delivery ({payment?.status === 'paid' ? 'Paid' : 'Pay on Delivery'})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
        💳 Paid Online ({paymentMethod === 'Prepaid' ? 'Prepaid • Cashfree' : (payment?.method === 'cashfree' ? 'Cashfree' : (payment?.method || 'Online'))})
      </span>
    );
  };

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recent';
      return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Orders to display: authenticated orders or guest tracked orders
  const activeOrders = isUserAuthenticated ? orders : (guestOrders || []);

  // Filter orders by search term if provided
  const filteredOrders = searchFilter.trim()
    ? activeOrders.filter((o) => {
        const term = searchFilter.toLowerCase();
        return (
          o.orderId?.toLowerCase().includes(term) ||
          o.orderStatus?.toLowerCase().includes(term) ||
          o.trackingNumber?.toLowerCase().includes(term) ||
          o.customer?.name?.toLowerCase().includes(term) ||
          o.items?.some((i) => i.title?.toLowerCase().includes(term))
        );
      })
    : activeOrders;

  // Render Single Order Card
  const renderOrderCard = (order) => {
    const isLatestPlaced = lastOrderId && (order.orderId === lastOrderId);

    return (
      <motion.div
        key={order._id || order.orderId}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-3xl border ${
          isLatestPlaced
            ? 'border-brand-pink-500 ring-2 ring-brand-pink-300/40 shadow-lg'
            : 'border-brand-coffee-200/90 shadow-sm hover:shadow-md'
        } transition-all overflow-hidden`}
      >
        {/* Latest Order Banner */}
        {isLatestPlaced && (
          <div className="bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 px-5 py-2 text-white text-xs font-extrabold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-yellow-300" />
              <span>Your Most Recently Placed Order</span>
            </span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Just Now
            </span>
          </div>
        )}

        {/* Order Header Bar */}
        <div className="p-5 sm:p-6 bg-brand-coffee-50/60 border-b border-brand-coffee-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-brand-coffee-600 font-medium">Order ID:</span>
              <span className="font-extrabold text-sm sm:text-base text-brand-pink-700 font-mono">
                #{order.orderId}
              </span>
              <button
                onClick={() => handleCopyOrderId(order.orderId)}
                className="p-1 hover:bg-brand-pink-100 rounded text-brand-coffee-600 hover:text-brand-pink-700 transition-colors"
                title="Copy Order ID"
              >
                {copiedOrderId === order.orderId ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <span className="text-brand-coffee-300 hidden sm:inline">•</span>
              <span className="text-xs text-brand-coffee-600 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-brand-coffee-400" />
                {formatDate(order.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              {getPaymentBadge(order.payment, order.paymentMethod)}
              {order.trackingNumber && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
                  🚚 Tracking: <strong>{order.trackingNumber}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            {getStatusBadge(order.orderStatus)}
          </div>
        </div>

        {/* Items List */}
        <div className="p-5 sm:p-6 divide-y divide-brand-coffee-100">
          {order.items?.map((item, index) => (
            <div
              key={index}
              className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-brand-coffee-50 border border-brand-coffee-200 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.image || '/images/250g front.png'}
                    alt={item.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = '/images/250g front.png';
                    }}
                  />
                </div>

                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-brand-coffee-950 truncate">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-brand-coffee-600 mt-0.5">
                    <span className="bg-brand-pink-50 text-brand-pink-700 px-2 py-0.5 rounded-md font-bold text-[10px] border border-brand-pink-200">
                      {item.weight}
                    </span>
                    <span>•</span>
                    <span>₹{item.price} × {item.quantity}</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="font-black text-sm sm:text-base text-brand-coffee-950">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Breakdown & Action Buttons */}
        <div className="p-5 sm:p-6 bg-brand-coffee-50/40 border-t border-brand-coffee-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Address Summary */}
          {order.customer?.address && (
            <div className="text-xs text-brand-coffee-600 space-y-0.5 max-w-sm">
              <div className="flex items-center gap-1 font-bold text-brand-coffee-900">
                <MapPin className="w-3.5 h-3.5 text-brand-pink-600 flex-shrink-0" />
                <span>Shipping to: {order.customer.name}</span>
              </div>
              <p className="pl-4 text-[11px] text-brand-coffee-500 truncate">
                {order.customer.address.doorNo}, {order.customer.address.street},{' '}
                {order.customer.address.city} - {order.customer.address.pincode}
              </p>
            </div>
          )}

          {/* Price & Action Buttons */}
          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
            <div className="text-right">
              <span className="text-[11px] text-brand-coffee-500 uppercase tracking-wider block font-bold">
                Grand Total
              </span>
              <span className="text-lg sm:text-xl font-black text-brand-pink-700">
                ₹{order.finalTotal ?? order.pricing?.totalAmount ?? 0}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Reorder Button */}
              <button
                onClick={() => handleReorder(order)}
                className="px-3.5 py-2.5 bg-brand-pink-600 hover:bg-brand-pink-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-pink-600/20 flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reorder</span>
              </button>

              {/* View Success Receipt */}
              <Link
                to={`/order-success/${order.orderId}`}
                state={{ order }}
                className="p-2.5 bg-brand-coffee-100 hover:bg-brand-coffee-200 text-brand-coffee-800 border border-brand-coffee-300 rounded-xl text-xs font-bold transition-colors"
                title="View Receipt"
              >
                <Printer className="w-4 h-4" />
              </Link>

              {/* WhatsApp Support Button */}
              <a
                href={`https://wa.me/916383805976?text=Hello%20Nathan%20Coffee%2C%20I%20have%20an%20inquiry%20regarding%20my%20Order%20%23${order.orderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold transition-colors"
                title="Order Support via WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <SEOMeta
        title="My Orders & Order History - Nathan Coffee"
        description="View and track your Nathan Coffee filter coffee orders, shipping statuses, and past purchase history."
        canonicalUrl="/my-orders"
        includeLocalBusiness={false}
      />

      <div className="bg-brand-coffee-50 min-h-[85vh] py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-coffee-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-brand-pink-50 border border-brand-pink-200 text-brand-pink-600 rounded-2xl shadow-inner">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-brand-coffee-950 tracking-tight font-sans">
                  My Orders & Order History
                </h1>
                {isUserAuthenticated && user ? (
                  <p className="text-xs sm:text-sm text-brand-coffee-600 flex items-center gap-1.5 mt-0.5">
                    <span>Account:</span>
                    <strong className="text-brand-pink-700 font-extrabold">+91 {user.mobileNumber}</strong>
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-brand-coffee-600 mt-0.5">
                    Track your orders, live roasting, and delivery status
                  </p>
                )}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {isUserAuthenticated && (
                <button
                  onClick={() => fetchOrders(true)}
                  disabled={refreshing}
                  className="px-3.5 py-2 bg-white hover:bg-brand-pink-50 text-brand-coffee-800 hover:text-brand-pink-700 rounded-xl text-xs font-bold border border-brand-coffee-200 shadow-sm transition-colors flex items-center gap-1.5"
                  title="Refresh Orders"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-brand-pink-600 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
              )}

              <Link
                to="/shop"
                className="px-4 py-2 bg-brand-pink-50 hover:bg-brand-pink-100 text-brand-pink-700 rounded-xl text-xs font-bold border border-brand-pink-200 transition-colors flex items-center gap-1.5"
              >
                <Coffee className="w-4 h-4" />
                <span>Shop Coffee</span>
              </Link>

              {isUserAuthenticated && (
                <button
                  onClick={() => {
                    logoutUser();
                    showToast('Logged out successfully', 'info');
                  }}
                  className="px-3.5 py-2 bg-brand-coffee-100 hover:bg-brand-coffee-200 text-brand-coffee-800 rounded-xl text-xs font-bold border border-brand-coffee-200 transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>

          {/* Session Expired Banner if user token expired */}
          {sessionExpiredNotice && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Your session has expired.</strong> Please verify your 10-digit mobile number to view and track your orders.
                </span>
              </div>
              <button
                onClick={() => openAuthModal()}
                className="px-4 py-2 bg-brand-pink-600 hover:bg-brand-pink-700 text-white rounded-xl text-xs font-bold shadow-sm whitespace-nowrap self-start sm:self-auto"
              >
                Log In with Mobile Number
              </button>
            </motion.div>
          )}

          {/* GUEST VIEW / DIRECT TRACKING BOX */}
          {!isUserAuthenticated && (
            <div className="space-y-6">
              {/* Option 1: Direct Order Tracking Form */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-coffee-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-brand-coffee-100">
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-brand-pink-600 flex-shrink-0" />
                    <h2 className="text-base sm:text-lg font-black text-brand-coffee-950">
                      Quick Order Lookup & Tracking
                    </h2>
                  </div>
                  <span className="text-[11px] font-bold text-brand-pink-700 bg-brand-pink-50 px-2.5 py-0.5 rounded-full border border-brand-pink-200">
                    No Password Needed
                  </span>
                </div>

                <p className="text-xs text-brand-coffee-600">
                  Just placed an order? Enter your <strong>Order ID</strong> (e.g. <code>NC-2026-XXXXXX</code>) or your <strong>10-digit mobile number</strong> to instantly track your order status and items:
                </p>

                <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-brand-coffee-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={trackQuery}
                      onChange={(e) => {
                        setTrackQuery(e.target.value);
                        setTrackError(null);
                      }}
                      placeholder="Enter Order ID (e.g. NC-2026-451405) or Mobile Number"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-xs text-brand-coffee-950 bg-brand-coffee-50/50 font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={trackLoading || !trackQuery.trim()}
                    className="px-6 py-3 bg-brand-pink-600 hover:bg-brand-pink-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md shadow-brand-pink-600/25 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {trackLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Searching...</span>
                      </div>
                    ) : (
                      <>
                        <Truck className="w-4 h-4" />
                        <span>Track Order</span>
                      </>
                    )}
                  </button>
                </form>

                {trackError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{trackError}</span>
                  </div>
                )}
              </div>

              {/* Guest Tracked Orders Results */}
              {guestOrders && guestOrders.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-brand-coffee-950 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Found {guestOrders.length} Order(s)</span>
                    </h3>
                  </div>

                  <div className="space-y-6">
                    {guestOrders.map((order) => renderOrderCard(order))}
                  </div>
                </div>
              )}

              {/* Option 2: Full Mobile Login CTA Card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-pink-200 shadow-md text-center max-w-xl mx-auto space-y-5"
              >
                <div className="w-16 h-16 rounded-full bg-brand-pink-50 border-2 border-brand-pink-300 flex items-center justify-center text-3xl mx-auto shadow-inner">
                  ☕
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-brand-coffee-950">
                    Log In to Access Your Full Order History
                  </h2>
                  <p className="text-xs sm:text-sm text-brand-coffee-600 max-w-md mx-auto">
                    Verify your 10-digit mobile number with instant OTP to view all your previous coffee powder orders and manage addresses.
                  </p>
                </div>

                <button
                  onClick={() => openAuthModal()}
                  className="px-8 py-3.5 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-pink-600/30 inline-flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 btn-shimmer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Log In with Mobile OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
          )}

          {/* LOGGED IN VIEW */}
          {isUserAuthenticated && (
            <>
              {/* Search & Filter Bar */}
              {orders.length > 0 && (
                <div className="bg-white rounded-2xl p-3 border border-brand-coffee-200 shadow-xs flex items-center gap-3">
                  <Search className="w-4 h-4 text-brand-coffee-400 ml-2" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search by Order ID, Product Title, or Status..."
                    className="w-full text-xs text-brand-coffee-900 placeholder-brand-coffee-400 focus:outline-none"
                  />
                  {searchFilter && (
                    <button
                      onClick={() => setSearchFilter('')}
                      className="text-xs text-brand-coffee-400 hover:text-brand-coffee-700 font-bold px-2"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}

              {loading ? (
                /* Loading Skeleton */
                <div className="space-y-4">
                  {[1, 2].map((n) => (
                    <div
                      key={n}
                      className="bg-white rounded-3xl p-6 border border-brand-coffee-200 animate-pulse space-y-4"
                    >
                      <div className="h-6 bg-brand-coffee-100 rounded-md w-1/3" />
                      <div className="h-20 bg-brand-coffee-50 rounded-xl w-full" />
                      <div className="h-8 bg-brand-coffee-100 rounded-md w-1/4" />
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                /* Empty Orders State */
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-8 sm:p-14 border border-brand-coffee-200 shadow-sm text-center space-y-6"
                >
                  <div className="w-24 h-24 rounded-full bg-brand-pink-50 border-2 border-dashed border-brand-pink-300 flex items-center justify-center text-5xl mx-auto shadow-inner">
                    ☕
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-black text-brand-coffee-950">
                      No Orders Found for +91 {user?.mobileNumber}
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-coffee-600 max-w-md mx-auto">
                      If you recently placed an order using a different mobile number or as a guest, try looking it up by Order ID below, or explore our freshly roasted coffee powder!
                    </p>
                  </div>

                  {/* Manual Order ID Finder */}
                  <div className="max-w-md mx-auto pt-2">
                    <form onSubmit={handleTrackSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={trackQuery}
                        onChange={(e) => setTrackQuery(e.target.value)}
                        placeholder="Look up Order ID (e.g. NC-2026-XXXXXX)"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-brand-coffee-200 text-xs focus:ring-2 focus:ring-brand-pink-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={trackLoading || !trackQuery.trim()}
                        className="px-4 py-2.5 bg-brand-pink-600 hover:bg-brand-pink-700 text-white font-bold text-xs rounded-xl shadow-sm"
                      >
                        {trackLoading ? 'Searching...' : 'Find Order'}
                      </button>
                    </form>
                    {trackError && (
                      <p className="text-xs text-rose-600 mt-2 font-medium">{trackError}</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-pink-600/30 transition-transform hover:scale-105 btn-shimmer"
                    >
                      <span>Browse Fresh Roast Coffee Powder</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ) : filteredOrders.length === 0 ? (
                /* No matching search filter */
                <div className="bg-white rounded-3xl p-8 border border-brand-coffee-200 text-center space-y-3">
                  <p className="text-sm font-bold text-brand-coffee-800">
                    No orders matching "{searchFilter}"
                  </p>
                  <button
                    onClick={() => setSearchFilter('')}
                    className="text-xs text-brand-pink-600 hover:text-brand-pink-700 font-bold underline"
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                /* Orders List */
                <div className="space-y-6">
                  {filteredOrders.map((order) => renderOrderCard(order))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MyOrdersPage;
