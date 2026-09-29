import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  const [copiedOrderId, setCopiedOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isUserAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await api.get('/api/orders/my-orders');
        if (res.data.success) {
          setOrders(res.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        showToast('Failed to load your orders. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isUserAuthenticated]);

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
            <span>Dispatched / On the Way</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Cancelled</span>
          </span>
        );
      case 'processing':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>Order Processing</span>
          </span>
        );
    }
  };

  // Payment Badge Helper
  const getPaymentBadge = (payment) => {
    if (payment?.method === 'cod') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          💵 Cash on Delivery ({payment?.status === 'paid' ? 'Paid' : 'Pending'})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
        💳 Paid Online (Razorpay)
      </span>
    );
  };

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const date = new Date(dateString);
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

  return (
    <>
      <SEOMeta
        title="My Orders & Order History - Nathan Coffee Mart"
        description="View and track your Nathan Coffee filter coffee orders, shipping statuses, and order history."
      />

      <div className="bg-brand-coffee-50 min-h-[80vh] py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-coffee-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-brand-pink-50 border border-brand-pink-200 text-brand-pink-600 rounded-2xl shadow-inner">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-brand-coffee-950 tracking-tight font-sans">
                  My Orders
                </h1>
                {isUserAuthenticated && user ? (
                  <p className="text-xs sm:text-sm text-brand-coffee-600 flex items-center gap-1.5 mt-0.5">
                    <span>Logged in as:</span>
                    <strong className="text-brand-pink-700 font-extrabold">+91 {user.mobileNumber}</strong>
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-brand-coffee-600 mt-0.5">
                    Track your orders and past purchases
                  </p>
                )}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                to="/shop"
                className="px-4 py-2 bg-brand-pink-50 hover:bg-brand-pink-100 text-brand-pink-700 rounded-xl text-xs font-bold border border-brand-pink-200 transition-colors flex items-center gap-1.5"
              >
                <Coffee className="w-4 h-4" />
                <span>Shop Coffee Powder</span>
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

          {/* GUEST VIEW: PROMPT LOGIN */}
          {!isUserAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-pink-200 shadow-md text-center max-w-xl mx-auto space-y-5"
            >
              <div className="w-20 h-20 rounded-full bg-brand-pink-50 border-2 border-brand-pink-300 flex items-center justify-center text-4xl mx-auto shadow-inner">
                ☕
              </div>
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-brand-coffee-950">
                  Please Log In with Mobile OTP
                </h2>
                <p className="text-xs sm:text-sm text-brand-coffee-600 max-w-md mx-auto">
                  To view and track your previous filter coffee orders, please verify your 10-digit mobile number.
                </p>
              </div>

              <button
                onClick={() => openAuthModal()}
                className="px-8 py-3.5 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-pink-600/30 inline-flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 btn-shimmer"
              >
                <Phone className="w-4 h-4" />
                <span>Log In with Mobile Number</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* LOGGED IN VIEW */}
          {isUserAuthenticated && (
            <>
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
                      No Orders Yet!
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-coffee-600 max-w-md mx-auto">
                      You haven't placed any orders with this mobile number (+91 {user?.mobileNumber}). Taste the legendary Coimbatore-Thanjavur heritage filter coffee today!
                    </p>
                  </div>

                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-pink-600/30 transition-transform hover:scale-105 btn-shimmer"
                  >
                    <span>Browse Fresh Roast Coffee Powder</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ) : (
                /* Orders List */
                <div className="space-y-6">
                  {orders.map((order) => (
                    <motion.div
                      key={order._id || order.orderId}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl border border-brand-coffee-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
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
                            {getPaymentBadge(order.payment)}
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
                              <span>Delivered to: {order.customer.name}</span>
                            </div>
                            <p className="pl-4 text-[11px] text-brand-coffee-500 truncate">
                              {order.customer.address.doorNo}, {order.customer.address.street},{' '}
                              {order.customer.address.city} - {order.customer.address.pincode}
                            </p>
                          </div>
                        )}

                        {/* Price & Reorder Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                          <div className="text-right">
                            <span className="text-[11px] text-brand-coffee-500 uppercase tracking-wider block font-bold">
                              Grand Total
                            </span>
                            <span className="text-lg sm:text-xl font-black text-brand-pink-700">
                              ₹{order.pricing?.totalAmount || 0}
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
                  ))}
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
