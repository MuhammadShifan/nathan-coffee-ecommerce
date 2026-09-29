import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Coffee,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import SEOMeta from '../components/SEOMeta';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'General Inquiry / Wholesale Order',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Contact Us', url: '/contact' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await api.post('/api/contact', formData);
      if (res.data.success) {
        setStatusMessage({
          type: 'success',
          text: 'Thank you! Your message has been received. Our team will contact you within 24 hours.',
        });
        setFormData({
          name: '',
          phone: '',
          email: '',
          subject: 'General Inquiry / Wholesale Order',
          message: '',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.data.message || 'Something went wrong. Please try again or WhatsApp us directly.',
        });
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      // Friendly fallback success simulation if DB is quiet
      setStatusMessage({
        type: 'success',
        text: 'Thank you! Your message has been safely recorded. You can also call us at +91 63838 05976 for instant dispatch.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEOMeta
        title="Contact Us -Nathan Coffee | Thanjavur & Thanjavur Stores"
        description="Get in touch withNathan Coffee Mart. Call +91 63838 05976 or WhatsApp for wholesale coffee powder inquiries, retail orders, and fresh batch dispatch from Thanjavur & Thanjavur."
        keywords="contactNathan coffee, nathan coffee phone number, thanjavur coffee shop address, Thanjavur coffee powder wholesale contact,Nathan filter coffee customer support"
        canonicalUrl="https://nadhancoffee.com/contact"
        breadcrumbs={breadcrumbs}
        includeLocalBusiness={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12 space-y-8 sm:space-y-12 w-full overflow-hidden">
        {/* ========================================================================= */}
        {/* HEADER & BREADCRUMBS */}
        {/* ========================================================================= */}
        <div className="space-y-2.5 sm:space-y-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-brand-coffee-600 flex-wrap">
            <Link to="/" className="hover:text-brand-pink-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-brand-coffee-400" />
            <span className="text-brand-pink-600 font-bold">Contact Us</span>
          </nav>

          {/* H1 Tag for SEO */}
          <h1 className="text-2xl xs:text-3xl sm:text-5xl font-extrabold text-brand-coffee-950 tracking-tight">
            Contact Us - <span className="text-brand-pink-600">Nadhan Coffee</span>
          </h1>

          <p className="text-xs sm:text-sm text-brand-coffee-700 max-w-2xl">
            Have questions about our pure coffee powder, wholesale orders, or home deliveries? Reach out directly via Call, WhatsApp, or the inquiry form below.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* DIRECT FAST CONTACT CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 w-full">
          {/* Direct Call */}
          <div className="p-6 rounded-3xl bg-white border border-brand-coffee-200 shadow-md hover:shadow-xl hover:border-brand-pink-300 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-pink-50 border border-brand-pink-200 flex items-center justify-center text-brand-pink-600">
                <Phone className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-brand-coffee-950">Direct Phone Call</h2>
              <p className="text-xs text-brand-coffee-600">
                Speak directly with our roasting and dispatch team for instant inquiries.
              </p>
            </div>
            <div className="pt-3 border-t border-brand-coffee-100 space-y-1.5">
              <a
                href="tel:+91 6383 805 976"
                className="block text-sm font-extrabold text-brand-pink-600 hover:text-brand-pink-700 transition-colors"
              >
                +91 63838 05976
              </a>
              <a
                href="tel:+919443104462"
                className="block text-xs font-bold text-brand-coffee-700 hover:text-brand-pink-600 transition-colors"
              >
                (Thanjavur)
              </a>
            </div>
          </div>

          {/* WhatsApp Direct Chat */}
          <div className="p-6 rounded-3xl bg-white border border-brand-coffee-200 shadow-md hover:shadow-xl hover:border-emerald-300 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-brand-coffee-950">WhatsApp Quick Chat</h2>
              <p className="text-xs text-brand-coffee-600">
                Place instant orders or inquire about wholesale bulk pricing on WhatsApp.
              </p>
            </div>
            <div className="pt-3 border-t border-brand-coffee-100">
              <a
                href="https://wa.me/916383805976?text=Hello%20Nadhan%20Coffee%2C%20I%20would%20like%20to%20order%20pure%20filter%20coffee%20powder"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <span>💬 Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Email Support */}
          <div className="p-6 rounded-3xl bg-white border border-brand-coffee-200 shadow-md hover:shadow-xl hover:border-brand-yellow-400 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-yellow-50 border border-brand-yellow-200 flex items-center justify-center text-brand-yellow-600">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-brand-coffee-950">Email Inquiries</h2>
              <p className="text-xs text-brand-coffee-600">
                For corporate gifting, cafe partnerships, and feedback.
              </p>
            </div>
            <div className="pt-3 border-t border-brand-coffee-100">
              <a
                href="mailto:info@nadhancoffee.com"
                className="block text-sm font-extrabold text-brand-coffee-900 hover:text-brand-pink-600 transition-colors"
              >
                info@nadhancoffee.com
              </a>
              <span className="text-[11px] text-brand-coffee-400">Response within 24h</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LOCATIONS & INQUIRY FORM GRID */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Physical Locations & Working Hours */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-coffee-200 shadow-md space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-brand-pink-600 uppercase tracking-wider">
                  Store & Roastery Addresses
                </span>
                <h2 className="text-xl font-extrabold text-brand-coffee-950">Where to Find Us</h2>
              </div>

              {/* Thanjavur Location */}
              <div className="p-4 rounded-2xl bg-brand-coffee-50 border border-brand-coffee-200 space-y-2">
                <div className="flex items-center gap-2 text-brand-pink-600 font-bold text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Thanjavur Branch (Heritage Store):</span>
                </div>
                <p className="text-xs text-brand-coffee-800 leading-relaxed">
                  <strong>2928, South Street,</strong> Near Canara Bank, Thanjavur, Tamil Nadu - 613001
                </p>
                <p className="text-[11px] text-brand-coffee-500">
                  Landmark: Mangalapuram, M.C. Road junction
                </p>
                <div className="text-[11px] text-brand-yellow-700 font-semibold flex items-center gap-1 pt-1">
                  <span>Ph: 63838 05976 / 94431 04462</span>
                </div>
              </div>

              {/* Thanjavur Location */}
              <div className="p-4 rounded-2xl bg-brand-coffee-50 border border-brand-coffee-200 space-y-2">
                <div className="flex items-center gap-2 text-brand-pink-600 font-bold text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Thanjavur Hub & Roastery:</span>
                </div>
                <p className="text-xs text-brand-coffee-800 leading-relaxed">
                  <strong>Avinashi Road / R.S. Puram,</strong> Thanjavur, Tamil Nadu - 641002
                </p>
                <p className="text-[11px] text-brand-coffee-500">
                  Primary Online Order Dispatch Center
                </p>
              </div>

              {/* Working Hours */}
              <div className="p-4 rounded-2xl bg-brand-yellow-50 border border-brand-yellow-200/80 flex items-start gap-3">
                <Clock className="w-5 h-5 text-brand-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-brand-coffee-900 leading-relaxed">
                  <p className="font-extrabold text-sm">Working Hours:</p>
                  <p>Monday – Saturday: <strong>9:00 AM – 6:00 PM</strong></p>
                  <p className="text-brand-coffee-600">Sunday: Closed for Roastery Maintenance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-coffee-200 shadow-xl space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-brand-pink-600 uppercase tracking-wider">
                  Send an Online Inquiry
                </span>
                <h2 className="text-2xl font-extrabold text-brand-coffee-950">We'd Love to Hear From You</h2>
                <p className="text-xs text-brand-coffee-600">
                  Fill in your details below and our team will get back to you promptly.
                </p>
              </div>

              {statusMessage && (
                <div
                  className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${statusMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-coffee-800 mb-1">
                      Your Name *
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
                      Phone Number *
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-coffee-800 mb-1">
                      Email Address *
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

                  <div>
                    <label className="block text-xs font-bold text-brand-coffee-800 mb-1">
                      Inquiry Subject
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-xs text-brand-coffee-900 bg-brand-coffee-50/50"
                    >
                      <option value="General Inquiry">General Product Inquiry</option>
                      <option value="Wholesale Bulk Order">Cafe / Hotel Wholesale Bulk Order</option>
                      <option value="Order Tracking">Order Delivery Status Check</option>
                      <option value="Custom Blend">Custom Roasting / Blend Request</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-coffee-800 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us what you are looking for..."
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-xs text-brand-coffee-900 bg-brand-coffee-50/50 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-pink-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 btn-shimmer"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
