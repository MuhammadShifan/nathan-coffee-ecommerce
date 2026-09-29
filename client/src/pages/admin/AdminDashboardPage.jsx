import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Clock,
  CheckCircle2,
  Phone,
  MessageCircle,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeProducts: 3,
    pendingOrders: 0,
    dispatchedOrders: 0,
    deliveredOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/api/orders/stats/summary'),
        api.get('/api/orders?limit=8'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (ordersRes.data.success) {
        setRecentOrders(ordersRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-300">
            Delivered
          </span>
        );
      case 'dispatched':
        return (
          <span className="bg-sky-100 text-sky-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-sky-300">
            Dispatched
          </span>
        );
      case 'processing':
      default:
        return (
          <span className="bg-amber-100 text-amber-900 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-amber-300">
            Processing
          </span>
        );
    }
  };

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="space-y-8">
        {/* Top Summary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-3xl border border-brand-coffee-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-coffee-600 uppercase tracking-wider">
                Total Revenue
              </span>
              <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-200">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-brand-coffee-950">
                ₹{stats.totalRevenue ? stats.totalRevenue.toLocaleString('en-IN') : '0'}
              </h3>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Verified Razorpay & COD Sales
              </p>
            </div>
          </div>

          {/* Total Orders Count */}
          <div className="bg-white p-6 rounded-3xl border border-brand-coffee-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-coffee-600 uppercase tracking-wider">
                Total Orders
              </span>
              <div className="p-2.5 bg-brand-pink-50 rounded-2xl text-brand-pink-600 border border-brand-pink-200">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-brand-coffee-950">
                {stats.totalOrders || 0}
              </h3>
              <p className="text-[11px] text-brand-coffee-500 font-medium mt-1">
                {stats.pendingOrders || 0} currently processing
              </p>
            </div>
          </div>

          {/* Active Products Count */}
          <div className="bg-white p-6 rounded-3xl border border-brand-coffee-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-coffee-600 uppercase tracking-wider">
                Active Products
              </span>
              <div className="p-2.5 bg-brand-yellow-50 rounded-2xl text-brand-yellow-600 border border-brand-yellow-200">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-brand-coffee-950">
                {stats.activeProducts || 3}
              </h3>
              <p className="text-[11px] text-brand-coffee-500 font-medium mt-1">
                Pure Coffee & Chicory Blends
              </p>
            </div>
          </div>

          {/* Pending Shipments */}
          <div className="bg-white p-6 rounded-3xl border border-brand-coffee-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-coffee-600 uppercase tracking-wider">
                Pending Shipments
              </span>
              <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-600 border border-amber-200">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-brand-coffee-950">
                {stats.pendingOrders || 0}
              </h3>
              <p className="text-[11px] text-amber-700 font-semibold mt-1">
                Requires batch grinding/packing
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="p-4 rounded-2xl bg-brand-coffee-100/70 border border-brand-coffee-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-pink-600" />
            <span className="text-xs font-bold text-brand-coffee-900">Admin Quick Actions:</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              to="/admin/products"
              className="px-4 py-2 bg-white hover:bg-brand-pink-50 text-brand-pink-700 rounded-xl text-xs font-bold border border-brand-coffee-200 hover:border-brand-pink-300 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Package className="w-3.5 h-3.5" /> Manage Product Stock
            </Link>
            <Link
              to="/admin/orders"
              className="px-4 py-2 bg-brand-pink-600 hover:bg-brand-pink-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> View All Orders
            </Link>
            <button
              onClick={fetchDashboardData}
              className="p-2 bg-white hover:bg-brand-coffee-50 text-brand-coffee-700 rounded-xl border border-brand-coffee-200 text-xs"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-3xl border border-brand-coffee-200 shadow-md overflow-hidden space-y-4">
          <div className="p-6 border-b border-brand-coffee-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-brand-coffee-950">Recent Customer Transactions</h2>
              <p className="text-xs text-brand-coffee-500">
                Latest orders received from website checkout
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-brand-pink-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-coffee-900">
              <thead className="bg-brand-coffee-50/70 border-b border-brand-coffee-100 text-[11px] font-extrabold uppercase text-brand-coffee-600">
                <tr>
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Customer & Contact</th>
                  <th className="p-4">Destination</th>
                  <th className="p-4">Coffee Items & Qty</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4 text-center">Contact Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-coffee-100 font-medium">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-brand-coffee-500">
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-brand-pink-50/30 transition-colors">
                      {/* Order ID */}
                      <td className="p-4 font-mono font-bold text-brand-coffee-950">
                        <div>{order.orderId}</div>
                        <div className="text-[10px] font-sans text-brand-coffee-400 font-normal">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <div className="font-bold text-brand-coffee-950">{order.customer?.name}</div>
                        <div className="text-[11px] text-brand-coffee-600">{order.customer?.phone}</div>
                      </td>

                      {/* Destination */}
                      <td className="p-4 max-w-[150px] truncate text-brand-coffee-700">
                        {order.customer?.address?.city}, {order.customer?.address?.state} - {order.customer?.address?.pincode}
                      </td>

                      {/* Items */}
                      <td className="p-4">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="text-[11px]">
                            {item.title} ({item.weight}) × <strong className="text-brand-pink-700">{item.quantity}</strong>
                          </div>
                        ))}
                      </td>

                      {/* Amount */}
                      <td className="p-4 font-black text-brand-coffee-950 text-sm">
                        ₹{order.pricing?.totalAmount}
                      </td>

                      {/* Payment */}
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                            order.payment?.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.payment?.method || 'Razorpay'}: {order.payment?.status}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">{getStatusBadge(order.orderStatus)}</td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <a
                            href={`tel:${order.customer?.phone}`}
                            className="p-1.5 bg-brand-pink-50 hover:bg-brand-pink-100 text-brand-pink-600 rounded-lg transition-colors"
                            title="Call Customer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/91${order.customer?.phone?.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(
                              order.customer?.name || ''
                            )}%2C%20we%20have%20received%20your%20Nadhan%20Coffee%20order%20${order.orderId}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                            title="WhatsApp Customer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
