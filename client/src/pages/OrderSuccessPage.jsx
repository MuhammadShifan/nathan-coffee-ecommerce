import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Package,
  Truck,
  Phone,
  MessageCircle,
  ArrowRight,
  Printer,
  ShoppingBag,
  Sparkles,
  MapPin,
  Calendar,
} from 'lucide-react';
import api from '../services/api';
import SEOMeta from '../components/SEOMeta';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#e60067', '#ffd700', '#2c1810', '#10b981'],
      });
    } catch (e) { }

    // Fetch order from DB if not passed in route state
    if (!order && orderId) {
      api
        .get(`/api/orders/${orderId}`)
        .then((res) => {
          if (res.data.success) {
            setOrder(res.data.data);
          }
        })
        .catch((err) => console.log('Order fetch err:', err))
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = encodeURIComponent(
    `HelloNathan Coffee, I have placed an order with Order ID: ${orderId || order?.orderId}. Please confirm my fresh batch roasting and dispatch!`
  );

  return (
    <>
      <SEOMeta
        title={`Order Confirmed #${orderId || ''} -Nathan Coffee`}
        description="YourNathan Coffee order is placed successfully. Thank you for choosing authentic South Indian filter coffee."
        canonicalUrl={`https://Nathancoffee.com/order-success/${orderId}`}
        includeLocalBusiness={false}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        {/* Success Banner Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-emerald-200 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-yellow-100/50 rounded-full blur-3xl pointer-events-none" />

          {/* Animated Success Icon */}
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border-4 border-emerald-200">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black uppercase px-3 py-1 rounded-full border border-emerald-300">
              Payment & Order Successful
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-coffee-950">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-brand-coffee-700 max-w-lg mx-auto">
              We have received your order. Our master roasters in Thanjavur & Thanjavur will pack your fresh coffee powder and dispatch it right away.
            </p>
          </div>

          {/* Order ID Pill */}
          <div className="inline-flex items-center gap-2 bg-brand-coffee-50 border border-brand-coffee-200 px-4 py-2 rounded-2xl">
            <span className="text-xs font-semibold text-brand-coffee-600">Order Reference:</span>
            <span className="font-mono text-sm font-extrabold text-brand-pink-600">
              {orderId || order?.orderId || 'NC-2026-CONFIRMED'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              id="view-my-orders-btn"
              to="/my-orders"
              className="px-6 py-3.5 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-brand-pink-600/30 flex items-center gap-2 transition-all hover:scale-105 btn-shimmer"
            >
              <Package className="w-4 h-4" />
              <span>View in My Orders & History</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={`https://wa.me/916383805976?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Confirmation</span>
            </a>

            <button
              onClick={handlePrint}
              className="px-5 py-3.5 bg-brand-coffee-100 hover:bg-brand-coffee-200 text-brand-coffee-900 font-bold text-xs sm:text-sm rounded-xl border border-brand-coffee-200 flex items-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4 text-brand-coffee-700" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>

        {/* Live Delivery Progress Tracker Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-coffee-200 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-coffee-100">
            <h3 className="text-sm sm:text-base font-extrabold text-brand-coffee-950 flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-pink-600" /> Order Fulfillment Status
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Tracker
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xs font-black">
                ✓
              </div>
              <p className="text-xs font-extrabold text-emerald-900">Order Placed</p>
              <p className="text-[10px] text-emerald-700">Payment Verified</p>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto text-xs font-black animate-pulse">
                ☕
              </div>
              <p className="text-xs font-extrabold text-amber-900">Roasting & Pack</p>
              <p className="text-[10px] text-amber-700">In Thanjavur Mill</p>
            </div>

            <div className="p-3 rounded-2xl bg-brand-coffee-50 border border-brand-coffee-200 space-y-1 opacity-70">
              <div className="w-7 h-7 rounded-full bg-brand-coffee-200 text-brand-coffee-700 flex items-center justify-center mx-auto text-xs font-black">
                📦
              </div>
              <p className="text-xs font-bold text-brand-coffee-900">Courier Dispatch</p>
              <p className="text-[10px] text-brand-coffee-600">ST / Professional</p>
            </div>

            <div className="p-3 rounded-2xl bg-brand-coffee-50 border border-brand-coffee-200 space-y-1 opacity-70">
              <div className="w-7 h-7 rounded-full bg-brand-coffee-200 text-brand-coffee-700 flex items-center justify-center mx-auto text-xs font-black">
                🏠
              </div>
              <p className="text-xs font-bold text-brand-coffee-900">Door Delivery</p>
              <p className="text-[10px] text-brand-coffee-600">Across India</p>
            </div>
          </div>
        </div>

        {/* Order Details Breakdown */}
        {order && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-coffee-200 shadow-lg space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-brand-coffee-100">
              <h2 className="text-base font-bold text-brand-coffee-950 flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-pink-600" /> Package & Delivery Information
              </h2>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Status: {order.orderStatus ? order.orderStatus.toUpperCase() : 'PROCESSING'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-brand-coffee-800">
              {/* Shipping Details */}
              <div className="p-4 rounded-2xl bg-brand-coffee-50/70 border border-brand-coffee-200 space-y-1.5">
                <p className="font-extrabold text-brand-coffee-950 text-sm mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-pink-600" /> Shipping Destination
                </p>
                <p className="font-bold">{order.customer?.name}</p>
                <p>{order.customer?.phone}</p>
                <p>{order.customer?.email}</p>
                <p className="text-brand-coffee-600 pt-1">
                  {order.customer?.address?.doorNo}, {order.customer?.address?.street},{' '}
                  {order.customer?.address?.city}, {order.customer?.address?.state} -{' '}
                  {order.customer?.address?.pincode}
                </p>
              </div>

              {/* Payment Info */}
              <div className="p-4 rounded-2xl bg-brand-coffee-50/70 border border-brand-coffee-200 space-y-1.5">
                <p className="font-extrabold text-brand-coffee-950 text-sm mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-yellow-600" /> Payment & Dispatch
                </p>
                <p>
                  <strong>Payment Method:</strong>{' '}
                  <span className="capitalize">{order.payment?.method === 'cashfree' ? 'Cashfree Payments' : (order.payment?.method || 'Cashfree Online')}</span>
                </p>
                <p>
                  <strong>Payment Status:</strong>{' '}
                  <span className="text-emerald-700 font-extrabold uppercase">
                    {order.payment?.status || 'Paid'}
                  </span>
                </p>
                {(order.payment?.cfPaymentId || order.payment?.razorpayPaymentId) && (
                  <p className="font-mono text-[11px] text-brand-coffee-600">
                    <strong>Payment Txn:</strong> {order.payment.cfPaymentId || order.payment.razorpayPaymentId}
                  </p>
                )}
                <p className="text-brand-coffee-600">
                  <strong>Estimated Dispatch:</strong> Within 24 hours via ST Couriers / Professional Couriers
                </p>
              </div>
            </div>

            {/* Items Summary Table */}
            {order.items && order.items.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-brand-coffee-100">
                <h3 className="text-xs font-bold text-brand-coffee-900 uppercase tracking-wider">
                  Ordered Coffee Items
                </h3>
                <div className="divide-y divide-brand-coffee-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-brand-coffee-950">{item.title}</span>
                        <span className="ml-2 bg-brand-yellow-100 text-brand-coffee-900 font-bold px-1.5 py-0.5 rounded text-[10px]">
                          {item.weight}
                        </span>
                        <span className="ml-2 text-brand-coffee-500">Qty: {item.quantity}</span>
                      </div>
                      <span className="font-extrabold text-brand-pink-700">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t-2 border-brand-coffee-200 flex justify-between text-sm font-black text-brand-coffee-950">
                  <span>Grand Total Paid:</span>
                  <span className="text-brand-pink-600 text-base">
                    ₹{order.pricing?.totalAmount || 299}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            to="/my-orders"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-pink-600 hover:bg-brand-pink-700 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105"
          >
            <Package className="w-4 h-4" />
            <span>Track & View My Orders</span>
          </Link>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-coffee-100 hover:bg-brand-coffee-200 text-brand-coffee-900 font-bold text-xs rounded-xl border border-brand-coffee-200 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-coffee-950 hover:bg-brand-coffee-900 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default OrderSuccessPage;
