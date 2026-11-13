import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Package,
  Truck,
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
import newLogo from '../assets/images/newLogo.png';

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
    `Hello Nathan Coffee, I have placed an order with Order ID: ${orderId || order?.orderId}. Please confirm my fresh batch roasting and dispatch!`
  );

  const formattedDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  const customer = order?.customer || {};
  const address = customer.address || {};
  const fullAddress = [
    address.doorNo,
    address.street,
    address.landmark,
    address.city,
    address.state || 'Tamil Nadu',
    address.pincode ? `PIN: ${address.pincode}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  const items = Array.isArray(order?.items) ? order.items : [];
  const subtotal =
    order?.pricing?.subtotal ??
    items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const deliveryCharge = order?.deliveryCharge ?? order?.pricing?.shippingFee ?? 40;
  const codFee = order?.codFee ?? order?.pricing?.codFee ?? 0;
  const finalTotal =
    order?.finalTotal ??
    order?.pricing?.totalAmount ??
    (subtotal + deliveryCharge + codFee);

  const isPrepaid =
    order?.paymentMethod === 'Prepaid' ||
    order?.payment?.method === 'cashfree' ||
    order?.payment?.method !== 'cod';
  const isPaid = order?.payment?.status === 'paid' || isPrepaid;
  const paymentTxnId =
    order?.payment?.cfPaymentId ||
    order?.payment?.razorpayPaymentId ||
    order?.payment?.paymentSessionId;

  return (
    <>
      <SEOMeta
        title={`Order Confirmed #${orderId || ''} - Nathan Coffee`}
        description="Your Nathan Coffee order is placed successfully. Thank you for choosing authentic South Indian filter coffee."
        canonicalUrl={`/order-success/${orderId}`}
        includeLocalBusiness={false}
      />

      <div className="order-success-page-container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        {/* Success Banner Card (Hidden on Print) */}
        <div className="no-print bg-white rounded-3xl p-8 sm:p-12 border-2 border-emerald-200 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-yellow-100/50 rounded-full blur-3xl pointer-events-none" />

          {/* Animated Success Icon */}
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border-4 border-emerald-200">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black uppercase px-3 py-1 rounded-full border border-emerald-300">
              {order?.paymentMethod === 'COD' || order?.payment?.method === 'cod'
                ? 'Cash on Delivery Order Placed'
                : 'Payment & Order Successful'}
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
              disabled={loading || !order}
              className="px-5 py-3.5 bg-brand-coffee-100 hover:bg-brand-coffee-200 text-brand-coffee-900 font-bold text-xs sm:text-sm rounded-xl border border-brand-coffee-200 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-brand-coffee-700" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>

        {/* Live Delivery Progress Tracker Card (Hidden on Print) */}
        <div className="no-print bg-white rounded-3xl p-6 sm:p-8 border border-brand-coffee-200 shadow-md space-y-4">
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
              <p className="text-[10px] text-emerald-700">
                {order?.paymentMethod === 'COD' || order?.payment?.method === 'cod'
                  ? 'Pay Cash on Delivery'
                  : 'Payment Verified'}
              </p>
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
              <p className="text-[10px] text-brand-coffee-600">Across Tamil Nadu</p>
            </div>
          </div>
        </div>

        {/* Loading Spinner Fallback */}
        {loading && !order && (
          <div className="bg-white rounded-3xl p-12 text-center border border-brand-coffee-200 shadow-sm space-y-3">
            <div className="w-8 h-8 border-3 border-brand-pink-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-brand-coffee-700">Loading your order receipt details...</p>
          </div>
        )}

        {/* Printable Retail Invoice Card */}
        {order && (
          <div
            id="printable-receipt"
            className="printable-receipt bg-white rounded-3xl p-6 sm:p-8 border border-brand-coffee-200 shadow-lg space-y-5"
            style={{
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            {/* Invoice Top Header */}
            <div className="receipt-header flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b-2 border-brand-pink-500/30">
              <div className="flex items-start gap-3.5">
                <div className="p-1.5 bg-brand-pink-600 rounded-xl border border-brand-yellow-400/40 flex-shrink-0 shadow-sm">
                  <img
                    src={newLogo}
                    alt="Nathan Coffee Logo"
                    className="receipt-logo h-12 sm:h-14 w-auto object-contain bg-white rounded-lg p-0.5"
                    style={{
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact',
                    }}
                  />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-lg sm:text-xl text-brand-pink-600 tracking-tight">Nathan</span>
                    <span className="font-bold text-lg sm:text-xl text-brand-coffee-950">COFFEE</span>
                  </div>
                  <p className="text-[11px] font-semibold text-brand-coffee-800">
                    Freshly Roasted Authentic South Indian Filter Coffee
                  </p>
                  <p className="text-[10px] text-brand-coffee-600">
                    Roastery: Thanjavur & Thanjavur, Tamil Nadu, India
                  </p>
                  <p className="text-[10px] text-brand-coffee-600">
                    WhatsApp / Support: +91 63838 05976 • support@nadhancoffee.com
                  </p>
                </div>
              </div>

              <div className="sm:text-right space-y-1 bg-brand-coffee-50/80 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-brand-coffee-200">
                <span className="receipt-badge inline-block bg-brand-pink-50 text-brand-pink-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-brand-pink-200">
                  Retail Invoice / Cash Receipt
                </span>
                <div className="font-mono text-sm font-extrabold text-brand-coffee-950">
                  #{orderId || order.orderId}
                </div>
                <div className="text-[11px] text-brand-coffee-700 flex items-center sm:justify-end gap-1">
                  <Calendar className="w-3 h-3 text-brand-coffee-400 no-print" />
                  <span>{formattedDate}</span>
                </div>
                <div className="pt-0.5">
                  <span
                    className={`receipt-badge inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border ${
                      isPaid
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {isPaid ? '✓ PAID • VERIFIED' : 'PAY ON DELIVERY'}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer & Shipping / Payment Information */}
            <div className="receipt-info-grid grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-brand-coffee-900 pb-4 border-b border-brand-coffee-100">
              {/* Shipping / Billed To */}
              <div className="p-3.5 rounded-xl bg-brand-coffee-50/70 border border-brand-coffee-200 space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand-coffee-500 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-pink-600 no-print" />
                  Billed & Shipped To:
                </p>
                <p className="font-black text-brand-coffee-950 text-sm">
                  {customer.name || 'Valued Customer'}
                </p>
                <p className="font-semibold text-brand-coffee-800">
                  Phone: +91 {customer.phone || 'N/A'}
                </p>
                {customer.email && (
                  <p className="text-brand-coffee-600">Email: {customer.email}</p>
                )}
                <p className="text-brand-coffee-700 pt-0.5 leading-relaxed">
                  {fullAddress || 'Tamil Nadu, India'}
                </p>
              </div>

              {/* Order & Payment Summary */}
              <div className="p-3.5 rounded-xl bg-brand-coffee-50/70 border border-brand-coffee-200 space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand-coffee-500 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-brand-yellow-600 no-print" />
                  Order & Payment Details:
                </p>
                <p>
                  <strong className="text-brand-coffee-950">Payment Method:</strong>{' '}
                  <span>
                    {order.paymentMethod === 'COD' || order.payment?.method === 'cod'
                      ? 'Cash on Delivery (COD)'
                      : 'Online Prepaid (Cashfree)'}
                  </span>
                </p>
                {paymentTxnId && (
                  <p className="font-mono text-[10.5px] text-brand-coffee-700 truncate">
                    <strong>Txn Ref:</strong> {paymentTxnId}
                  </p>
                )}
                <p>
                  <strong className="text-brand-coffee-950">Order Status:</strong>{' '}
                  <span className="font-bold text-emerald-800 uppercase">
                    {order.orderStatus || 'Confirmed / Fresh Roasting'}
                  </span>
                </p>
                <p className="text-brand-coffee-600 text-[11px]">
                  <strong>Courier:</strong> ST Couriers / Professional Couriers (Tamil Nadu)
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="receipt-table-wrapper space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-brand-coffee-950 uppercase tracking-wider">
                  Itemized Coffee Order
                </h3>
                <span className="text-[10px] font-semibold text-brand-coffee-500">
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-brand-coffee-200">
                <table className="receipt-table w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-brand-coffee-100/80 text-brand-coffee-950 border-b border-brand-coffee-200">
                      <th className="py-2 px-3 font-extrabold w-10 text-center">#</th>
                      <th className="py-2 px-3 font-extrabold">Item Description</th>
                      <th className="py-2 px-3 font-extrabold text-center">Weight</th>
                      <th className="py-2 px-3 font-extrabold text-right">Unit Price</th>
                      <th className="py-2 px-3 font-extrabold text-center">Qty</th>
                      <th className="py-2 px-3 font-extrabold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-coffee-100">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-brand-coffee-50/50">
                        <td className="py-2.5 px-3 text-center text-brand-coffee-500 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-brand-coffee-950">{item.title}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="receipt-badge bg-brand-yellow-100 text-brand-coffee-900 font-bold px-1.5 py-0.5 rounded text-[10px]">
                            {item.weight}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-brand-coffee-800">
                          ₹{item.price}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-brand-coffee-900">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-brand-coffee-950">
                          ₹{item.price * item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Totals Breakdown */}
            <div className="receipt-totals pt-3 border-t border-brand-coffee-100 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="text-[10px] text-brand-coffee-600 space-y-1 sm:max-w-xs">
                <p className="font-bold text-brand-coffee-800">Order Notes & Quality Assurance:</p>
                <p>• Roasted in small batches in Thanjavur & Thanjavur to guarantee authentic filter coffee taste.</p>
                <p>• Packed fresh with aroma-lock valve packaging.</p>
                <p>• All prices are inclusive of GST.</p>
              </div>

              <div className="w-full sm:w-72 space-y-1.5 text-xs">
                <div className="flex justify-between text-brand-coffee-700">
                  <span>Subtotal:</span>
                  <span className="font-bold text-brand-coffee-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-brand-coffee-700">
                  <span>Delivery Charge:</span>
                  <span className="font-bold text-brand-coffee-900">₹{deliveryCharge}</span>
                </div>
                {codFee > 0 && (
                  <div className="flex justify-between text-amber-800">
                    <span>COD Handling Fee:</span>
                    <span className="font-bold">₹{codFee}</span>
                  </div>
                )}
                <div className="pt-2 border-t-2 border-brand-coffee-300 flex justify-between items-center text-sm font-black text-brand-coffee-950 bg-brand-pink-50/50 p-2 rounded-lg">
                  <span>{isPrepaid ? 'Total Amount Paid:' : 'Final Payable (COD):'}</span>
                  <span className="text-base text-brand-pink-700 font-black">
                    ₹{finalTotal}
                  </span>
                </div>
              </div>
            </div>

            {/* Receipt Bottom Note */}
            <div className="receipt-footer pt-3 border-t border-brand-coffee-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-brand-coffee-600">
              <p>This is a computer-generated invoice and requires no physical signature.</p>
              <p className="font-semibold text-brand-pink-600">Thank you for ordering with Nathan Coffee!</p>
            </div>
          </div>
        )}

        {/* Navigation CTAs (Hidden on Print) */}
        <div className="no-print flex flex-wrap items-center justify-center gap-3 pt-4">
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
