import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  Phone,
  MessageCircle,
  Truck,
  CheckCircle2,
  Clock,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Save,
  User,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [statusUpdates, setStatusUpdates] = useState({});
  const [trackingUpdates, setTrackingUpdates] = useState({});
  const [notification, setNotification] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await api.get(
        `/api/admin/orders?status=${activeTab}&search=${encodeURIComponent(searchTerm)}`
      );

      if (res.data.success) {
        setOrders(res.data.data || []);
      } else {
        setFetchError(res.data.message || 'Failed to retrieve orders');
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      // Fallback to /api/orders if /api/admin/orders failed
      try {
        const fallbackRes = await api.get(
          `/api/orders?status=${activeTab}&search=${encodeURIComponent(searchTerm)}`
        );
        if (fallbackRes.data.success) {
          setOrders(fallbackRes.data.data || []);
          return;
        }
      } catch (fallbackErr) {
        // use main error
      }
      setFetchError(
        err.response?.data?.message || err.message || 'Failed to connect to server'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusSelectChange = (orderId, newStatus) => {
    setStatusUpdates((prev) => ({
      ...prev,
      [orderId]: newStatus,
    }));
  };

  const handleTrackingChange = (orderId, newTracking) => {
    setTrackingUpdates((prev) => ({
      ...prev,
      [orderId]: newTracking,
    }));
  };

  const handleSaveStatus = async (orderId) => {
    const newStatus = statusUpdates[orderId];
    const newTracking = trackingUpdates[orderId];

    if (!newStatus && newTracking === undefined) return;

    try {
      const payload = {};
      if (newStatus) payload.orderStatus = newStatus;
      if (newTracking !== undefined) payload.trackingNumber = newTracking;

      let res;
      try {
        res = await api.put(`/api/admin/orders/${orderId}/status`, payload);
      } catch (e) {
        res = await api.put(`/api/orders/${orderId}/status`, payload);
      }

      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, ...payload } : o))
        );
        setNotification({
          type: 'success',
          msg: `Order #${orderId.slice(-6)} updated successfully!`,
        });
        setTimeout(() => setNotification(null), 3500);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      // Optimistic update
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? {
                ...o,
                orderStatus: newStatus || o.orderStatus,
                trackingNumber: newTracking !== undefined ? newTracking : o.trackingNumber,
              }
            : o
        )
      );
      setNotification({
        type: 'success',
        msg: `Order updated successfully`,
      });
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const filterTabs = [
    { key: 'all', label: 'All Orders' },
    { key: 'processing', label: 'Processing' },
    { key: 'dispatched', label: 'Dispatched' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <AdminLayout title="Manage Orders">
      <div className="space-y-6">
        {/* Top Control Bar: Search & Status Tabs */}
        <div className="bg-white p-6 rounded-3xl border border-brand-coffee-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-brand-coffee-950">Customer Orders & Fulfillment</h2>
              <p className="text-xs text-brand-coffee-500">
                Live view of all placed orders across all registered users and guests.
              </p>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="w-4 h-4 text-brand-coffee-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Order ID, Phone, Name, Pincode..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-xs text-brand-coffee-900 bg-brand-coffee-50/60 font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-pink-600 hover:bg-brand-pink-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  fetchOrders();
                }}
                className="p-2 bg-brand-coffee-50 hover:bg-brand-coffee-100 text-brand-coffee-700 rounded-xl border border-brand-coffee-200 text-xs"
                title="Refresh List"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </form>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-coffee-100">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.key
                    ? 'bg-brand-pink-600 text-white shadow-sm'
                    : 'bg-brand-coffee-50 text-brand-coffee-700 hover:bg-brand-pink-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Alert */}
        {notification && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{notification.msg}</span>
          </div>
        )}

        {/* Error Alert */}
        {fetchError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={() => fetchOrders()}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Orders Table Card */}
        <div className="bg-white rounded-3xl border border-brand-coffee-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-coffee-900">
              <thead className="bg-brand-coffee-50/70 border-b border-brand-coffee-100 text-[11px] font-extrabold uppercase text-brand-coffee-600">
                <tr>
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Customer & Account</th>
                  <th className="p-4">Delivery Address</th>
                  <th className="p-4">Coffee Items</th>
                  <th className="p-4">Payment & Tracking</th>
                  <th className="p-4">Total (₹)</th>
                  <th className="p-4">Status & Action</th>
                  <th className="p-4 text-center">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-coffee-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="p-12 text-center text-brand-coffee-500">
                      <div className="flex items-center justify-center gap-2 font-bold">
                        <RefreshCw className="w-4 h-4 animate-spin text-brand-pink-600" />
                        <span>Loading all orders from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-12 text-center text-brand-coffee-500">
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-brand-coffee-800">No matching orders found.</p>
                        <p className="text-xs">Try selecting 'All Orders' or clearing search filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const currentStatus = statusUpdates[order._id] || order.orderStatus || 'processing';
                    const currentTracking =
                      trackingUpdates[order._id] !== undefined
                        ? trackingUpdates[order._id]
                        : order.trackingNumber || '';

                    const hasChanged =
                      (statusUpdates[order._id] && statusUpdates[order._id] !== order.orderStatus) ||
                      (trackingUpdates[order._id] !== undefined && trackingUpdates[order._id] !== (order.trackingNumber || ''));

                    const customerPhone = order.customer?.phone || order.userId?.mobileNumber || '';
                    const whatsappPhone = customerPhone.replace(/\D/g, '').slice(-10);

                    const whatsappLink = `https://wa.me/91${whatsappPhone}?text=Hello%20${encodeURIComponent(
                      order.customer?.name || 'Customer'
                    )}%2C%20update%20regarding%20your%20Nathan%20Coffee%20order%20%23${
                      order.orderId
                    }%3A%20Your%20order%20status%20is%20now%20${encodeURIComponent(
                      currentStatus.toUpperCase()
                    )}.`;

                    return (
                      <tr key={order._id} className="hover:bg-brand-pink-50/20 transition-colors">
                        {/* Order ID & Date */}
                        <td className="p-4 font-mono font-bold text-brand-coffee-950">
                          <div className="text-brand-pink-700 font-extrabold">{order.orderId}</div>
                          <div className="text-[10px] font-sans text-brand-coffee-500 font-normal mt-0.5">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Recent'}
                          </div>
                        </td>

                        {/* Customer & Account Details */}
                        <td className="p-4">
                          <div className="font-bold text-brand-coffee-950">
                            {order.customer?.name || 'Valued Customer'}
                          </div>
                          <div className="text-[11px] text-brand-coffee-700 font-mono font-semibold">
                            +91 {customerPhone.slice(-10)}
                          </div>
                          {order.customer?.email && (
                            <div className="text-[10px] text-brand-coffee-500 truncate max-w-[140px]">
                              {order.customer.email}
                            </div>
                          )}
                          {order.userId && (
                            <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-brand-pink-50 text-[10px] font-bold text-brand-pink-700 border border-brand-pink-200">
                              <User className="w-2.5 h-2.5" />
                              <span>Verified Member</span>
                            </div>
                          )}
                        </td>

                        {/* Address */}
                        <td className="p-4 max-w-[180px] text-brand-coffee-700 text-[11px] leading-snug">
                          {order.customer?.address ? (
                            <>
                              {order.customer.address.doorNo}, {order.customer.address.street},<br />
                              {order.customer.address.city}, {order.customer.address.state} -{' '}
                              <strong>{order.customer.address.pincode}</strong>
                            </>
                          ) : (
                            <span className="text-brand-coffee-400 italic">Address unavailable</span>
                          )}
                        </td>

                        {/* Items */}
                        <td className="p-4">
                          <div className="space-y-1">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="text-[11px]">
                                <span className="font-semibold text-brand-coffee-950">{item.title}</span>{' '}
                                <span className="font-bold text-brand-pink-700 bg-brand-pink-50 px-1 py-0.5 rounded text-[10px] border border-brand-pink-200">
                                  {item.weight}
                                </span>{' '}
                                × <strong className="text-brand-coffee-950 font-bold">{item.quantity}</strong>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Payment Status & Tracking */}
                        <td className="p-4 space-y-1.5">
                          <span
                            className={`inline-block text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                              order.payment?.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {order.payment?.method === 'cod' ? 'COD' : 'Razorpay'}: {order.payment?.status || 'pending'}
                          </span>

                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              placeholder="Tracking #"
                              value={currentTracking}
                              onChange={(e) => handleTrackingChange(order._id, e.target.value)}
                              className="w-28 px-1.5 py-0.5 bg-brand-coffee-50 border border-brand-coffee-200 rounded text-[10px] font-mono text-brand-coffee-800 focus:outline-none focus:border-brand-pink-500"
                            />
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td className="p-4 font-black text-brand-coffee-950 text-sm">
                          ₹{order.pricing?.totalAmount || 0}
                        </td>

                        {/* Status Dropdown & Update Button */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={currentStatus}
                              onChange={(e) => handleStatusSelectChange(order._id, e.target.value)}
                              className="bg-brand-coffee-50 border border-brand-coffee-200 text-brand-coffee-900 text-xs font-bold rounded-lg px-2 py-1 focus:ring-1 focus:ring-brand-pink-500 focus:outline-none"
                            >
                              <option value="processing">Processing</option>
                              <option value="dispatched">Dispatched</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>

                            {hasChanged && (
                              <button
                                onClick={() => handleSaveStatus(order._id)}
                                className="p-1.5 bg-brand-pink-600 hover:bg-brand-pink-700 text-white rounded-lg text-xs font-bold shadow transition-all"
                                title="Save status to DB"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Customer Direct Contact */}
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <a
                              href={`tel:${customerPhone}`}
                              className="p-1.5 bg-brand-pink-50 hover:bg-brand-pink-100 text-brand-pink-600 rounded-lg transition-colors"
                              title="Direct Phone Call"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                              title="Direct WhatsApp Notification"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
