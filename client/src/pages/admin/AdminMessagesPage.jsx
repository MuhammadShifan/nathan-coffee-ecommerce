import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Mail,
  Phone,
  CheckCircle,
  Calendar,
  Clock,
  RefreshCw,
  Search,
} from 'lucide-react';
import api from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/contact');
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/contact/${id}/read`);
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, isRead: true } : m))
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  return (
    <AdminLayout title="Customer Inquiries & Wholesale Leads">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-brand-coffee-200 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-brand-coffee-950">Inbox & Contact Messages</h2>
            <p className="text-xs text-brand-coffee-500">
              Inquiries from web contact form, wholesale bulk quotes, and custom roast inquiries.
            </p>
          </div>
          <button
            onClick={fetchMessages}
            className="p-2.5 bg-brand-coffee-50 hover:bg-brand-coffee-100 text-brand-coffee-700 rounded-xl border border-brand-coffee-200 text-xs"
            title="Refresh Messages"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-brand-coffee-500 border border-brand-coffee-200">
              No customer inquiries yet.
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`bg-white p-6 rounded-3xl border transition-all shadow-sm space-y-3 ${
                  msg.isRead ? 'border-brand-coffee-200' : 'border-brand-pink-400 bg-brand-pink-50/20 shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-brand-coffee-100">
                  <div>
                    <span className="text-xs font-bold bg-brand-pink-100 text-brand-pink-800 px-2.5 py-0.5 rounded-full uppercase">
                      {msg.subject || 'General Inquiry'}
                    </span>
                    <h3 className="text-base font-extrabold text-brand-coffee-950 mt-1">
                      {msg.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-brand-coffee-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(msg.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {!msg.isRead && (
                      <button
                        onClick={() => markAsRead(msg._id)}
                        className="text-xs font-bold text-brand-pink-600 hover:underline"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>

                {/* Message Body */}
                <p className="text-xs sm:text-sm text-brand-coffee-800 leading-relaxed">
                  {msg.message}
                </p>

                {/* Sender Contact Info */}
                <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-brand-coffee-100 text-xs text-brand-coffee-700">
                  {msg.phone && (
                    <a
                      href={`tel:${msg.phone}`}
                      className="flex items-center gap-1 text-brand-pink-600 font-bold hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" /> {msg.phone}
                    </a>
                  )}
                  {msg.email && (
                    <a
                      href={`mailto:${msg.email}`}
                      className="flex items-center gap-1 text-brand-coffee-800 hover:underline"
                    >
                      <Mail className="w-3.5 h-3.5" /> {msg.email}
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMessagesPage;
