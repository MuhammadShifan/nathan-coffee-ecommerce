import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, FileText, ChevronRight, Lock, AlertTriangle, Video, Clock } from 'lucide-react';
import SEOMeta from '../components/SEOMeta';

const PolicyPage = () => {
  const { type = 'shipping' } = useParams();

  const policies = {
    shipping: {
      title: 'Shipping & Delivery Policy',
      icon: <Truck className="w-6 h-6 text-brand-pink-600" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-brand-coffee-800 leading-relaxed">
          <p>
            At <strong>Nathan Coffee</strong>, we take pride in delivering freshly roasted and ground South Indian filter coffee powder right from our Thanjavur roasting units to your home.
          </p>
          <h3 className="text-base font-bold text-brand-coffee-950 mt-4">1. Dispatch Timelines</h3>
          <p>
            All orders are freshly roasted and carefully packaged to preserve their authentic aroma. Our Premium category coffee is packed in airtight stand-up zipper pouches, while our Super and Export categories are securely sealed in our standard packaging. Orders placed before 1:00 PM are dispatched on the same business day, while orders placed after 1:00 PM are dispatched the next business day (excluding Sundays & National Holidays).
          </p>
          <h3 className="text-base font-bold text-brand-coffee-950 mt-4">2. Delivery Timeframes</h3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Tamil Nadu & Pondicherry:</strong> 1 – 2 Business Days.</li>
            <li><strong>South India (Karnataka, Kerala, Andhra Pradesh, Telangana):</strong> 2 – 3 Business Days.</li>
            <li><strong>Rest of India:</strong> 3 – 5 Business Days via Express Courier.</li>
          </ul>
        </div>
      ),
    },
    refund: {
      title: 'Cancellation & Refund Policy',
      icon: <RotateCcw className="w-6 h-6 text-brand-pink-600" />,
      content: (
        <div className="space-y-5 text-xs sm:text-sm text-brand-coffee-800 leading-relaxed">
          <p>
            At <strong>Nathan Coffee</strong>, uncompromising freshness and customer trust are our foundational principles. Because our pure filter coffee powder is freshly roasted in small batches and ground immediately to lock in authentic aroma, please review our strict cancellation and refund terms:
          </p>

          {/* Critical Notice Callout Banner */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-amber-950 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Strict Policy Notice: No Cancellations (Cancellation கிடையாது)</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-900 font-medium">
              No cancellations are allowed once an order is placed, as our coffee powder is freshly roasted and packed immediately. <strong>(Cancellation கிடையாது)</strong>. For damaged or incorrect packages, claims must be reported within <strong>24 hours of delivery</strong> accompanied by an <strong>unboxing video</strong>.
            </p>
          </div>

          {/* Section 1: Order Cancellations */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-brand-coffee-950 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-pink-100 text-brand-pink-700 flex items-center justify-center text-xs font-black">1</span>
              <span>Order Cancellations (ஆர்டர் ரத்து செய்தல்)</span>
            </h3>
            <p className="pl-8 leading-relaxed">
              <strong>No cancellations are allowed once an order is placed, as our coffee powder is freshly roasted and packed immediately. (Cancellation கிடையாது).</strong>
            </p>
            <p className="pl-8 text-xs text-brand-coffee-600 leading-relaxed">
              To guarantee that every cup delivers authentic Thanjavur-style thick golden decoction, our roastery team initiates batch preparation and sealing immediately upon receipt of your prepaid order. Therefore, once an order is placed, it cannot be modified, recalled, or cancelled.
            </p>
          </div>

          {/* Section 2: Damaged or Incorrect Items */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-brand-coffee-950 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-pink-100 text-brand-pink-700 flex items-center justify-center text-xs font-black">2</span>
              <span>Damaged or Incorrect Items (சேதமடைந்த / தவறான பொருட்கள்)</span>
            </h3>
            <p className="pl-8 leading-relaxed">
              In the rare event that your package is physically damaged during transit, tampered with, or you receive an incorrect product variant or pack size:
            </p>
            <div className="pl-8 space-y-3 pt-1">
              <div className="p-3 bg-brand-coffee-50 rounded-xl border border-brand-coffee-200 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-brand-pink-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-brand-coffee-900 leading-relaxed">
                  <strong>Strict 24-Hour Time Limit:</strong> You must report the issue to us <strong>within 24 hours of delivery</strong>. Any claims submitted after 24 hours from the recorded courier delivery time will not be eligible for replacement or refund.
                </div>
              </div>

              <div className="p-3 bg-brand-coffee-50 rounded-xl border border-brand-coffee-200 flex items-start gap-2.5">
                <Video className="w-4 h-4 text-brand-pink-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-brand-coffee-900 leading-relaxed">
                  <strong>Mandatory Unboxing Video & Image Proofs:</strong> It is mandatory that customers must provide proper video (a continuous, uncut <strong>unboxing video</strong> showing the parcel from its sealed state, including outer shipping label, to opening) and clear <strong>image proofs</strong> of the damaged package or incorrect items to claim a replacement or refund.
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Replacement & Refund Resolution */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-brand-coffee-950 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-pink-100 text-brand-pink-700 flex items-center justify-center text-xs font-black">3</span>
              <span>Claim Verification & Resolution Process</span>
            </h3>
            <p className="pl-8 leading-relaxed">
              Once your unboxing video and photo proofs are verified by our dispatch inspection team:
            </p>
            <ul className="pl-12 list-disc space-y-1.5 text-xs text-brand-coffee-800">
              <li><strong>Free Replacement:</strong> We will immediately dispatch a fresh replacement packet at zero additional shipping cost.</li>
              <li><strong>100% Refund Option:</strong> If a replacement is unavailable, a full 100% refund will be credited back to your original payment method (Bank/UPI/Card) within <strong>3 – 5 business days</strong>.</li>
            </ul>
          </div>

          {/* Section 4: How to Reach Support */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-brand-coffee-950 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-pink-100 text-brand-pink-700 flex items-center justify-center text-xs font-black">4</span>
              <span>How to Submit Your Claim</span>
            </h3>
            <p className="pl-8 leading-relaxed">
              Please share your <strong>Order ID, Unboxing Video, and Photos</strong> within 24 hours of delivery via:
            </p>
            <div className="pl-8 flex flex-col sm:flex-row gap-2.5 pt-1">
              <a
                href="https://wa.me/916383805976?text=Hello%20Nathan%20Coffee%2C%20I%20have%20an%20issue%20with%20my%20delivery.%20Here%20is%20my%20Order%20ID%20and%20unboxing%20video."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <span>💬 WhatsApp Proof to +91 63838 05976</span>
              </a>
              <a
                href="mailto:nathancoffeethanjavur.official@gmail.com?subject=Damaged/Incorrect%20Item%20Proof"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-coffee-900 hover:bg-brand-pink-600 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <span>✉️ Email Video & Photo Proofs</span>
              </a>
            </div>
          </div>
        </div>
      ),
    },
    privacy: {
      title: 'Privacy Policy',
      icon: <Lock className="w-6 h-6 text-brand-pink-600" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-brand-coffee-800 leading-relaxed">
          <p>
            Nathan Coffee is committed to safeguarding your privacy. We only collect necessary contact and shipping details (Name, Phone, Delivery Address, Email) to fulfill your orders.
          </p>
          <h3 className="text-base font-bold text-brand-coffee-950 mt-4">1. Payment Security</h3>
          <p>
            All online transactions are securely encrypted and processed by Cashfree Payments. We do not store any credit card numbers, debit card details, or UPI PINs on our servers.
          </p>
          <h3 className="text-base font-bold text-brand-coffee-950 mt-4">2. Non-Disclosure</h3>
          <p>
            We will never sell, rent, or distribute your private contact details to third-party telemarketers or advertisers.
          </p>
        </div>
      ),
    },
    terms: {
      title: 'Terms & Conditions',
      icon: <FileText className="w-6 h-6 text-brand-pink-600" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-brand-coffee-800 leading-relaxed">
          <p>
            Welcome to Nathan Coffee. By purchasing our products or using our website, you agree to comply with and be bound by the terms and conditions outlined here.
          </p>
          <h3 className="text-base font-bold text-brand-coffee-950 mt-4">1. Product Purity & Shelf Life</h3>
          <p>
            All Nathan Coffee powder is 100% natural, manufactured under FSSAI Registration No. 22426461000422. Best consumed within 6 months from the date of manufacture. Keep in an airtight container away from direct moisture.
          </p>
          <h3 className="text-base font-bold text-brand-coffee-950 mt-4">2. Jurisdiction</h3>
          <p>
            Any legal claims or disputes related to Nathan Coffee transactions are subject to the exclusive jurisdiction of the competent courts in Thanjavur, Tamil Nadu.
          </p>
        </div>
      ),
    },
  };

  // Support both /policy/refund and /policy/cancellation-refund
  policies['cancellation-refund'] = policies.refund;

  const activePolicy = policies[type] || policies.shipping;

  return (
    <>
      <SEOMeta
        title={`${activePolicy.title} - Nathan Coffee`}
        description={`Read Nathan Coffee's ${activePolicy.title}. Transparent policies for fresh coffee powder dispatch, strict no cancellation, and customer assurance.`}
        canonicalUrl={`/policy/${type}`}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-brand-coffee-600">
          <Link to="/" className="hover:text-brand-pink-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-coffee-400" />
          <span className="text-brand-pink-600 font-bold">{activePolicy.title}</span>
        </nav>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-coffee-200 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-6 border-b border-brand-coffee-100">
            <div className="p-3 bg-brand-pink-50 rounded-2xl border border-brand-pink-200">
              {activePolicy.icon}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-coffee-950">
                {activePolicy.title}
              </h1>
              <p className="text-xs text-brand-coffee-500 mt-0.5">
                Nathan Coffee • Last Updated: November 2026
              </p>
            </div>
          </div>

          <div>{activePolicy.content}</div>

          <div className="pt-6 border-t border-brand-coffee-100 flex items-center justify-between text-xs text-brand-coffee-600">
            <span>FSSAI License: 22426461000422</span>
            <Link to="/contact" className="text-brand-pink-600 font-bold hover:underline">
              Have Questions? Contact Support
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PolicyPage;
