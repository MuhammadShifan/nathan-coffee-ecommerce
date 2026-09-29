import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, FileText, ChevronRight, Lock } from 'lucide-react';
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
            At <strong>Nadhan Coffee Mart</strong>, we take pride in delivering freshly roasted and ground South Indian filter coffee powder right from our Thanjavur and Thanjavur roasting units to your home.
          </p>
          <h3 className="text-base font-bold text-brand-coffee-950 mt-4">1. Dispatch Timelines</h3>
          <p>
            All orders are freshly roasted and packaged in airtight stand-up zipper pouches. Orders placed before 1:00 PM are dispatched on the same business day, while orders placed after 1:00 PM are dispatched the next business day (excluding Sundays & National Holidays).
          </p>
          <h3 className="text-base font-bold text-brand-coffee-950 mt-4">2. Delivery Timeframes</h3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Tamil Nadu & Pondicherry:</strong> 1 – 2 Business Days.</li>
            <li><strong>South India (Karnataka, Kerala, Andhra Pradesh, Telangana):</strong> 2 – 3 Business Days.</li>
            <li><strong>Rest of India:</strong> 3 – 5 Business Days via Express Courier.</li>
          </ul>
          <h3 className="text-base font-bold text-brand-coffee-950 mt-4">3. Shipping Rates</h3>
          <p>
            We provide <strong>FREE Standard Home Delivery across India on all orders of ₹500 and above</strong>. For orders below ₹500, a nominal standard shipping fee of ₹40 is applied at checkout.
          </p>
        </div>
      ),
    },
    refund: {
      title: 'Cancellation & Refund Policy',
      icon: <RotateCcw className="w-6 h-6 text-brand-pink-600" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-brand-coffee-800 leading-relaxed">
          <p>
            Customer satisfaction and freshness are our highest priorities.
          </p>
          <h3 className="text-base font-bold text-brand-coffee-950 mt-4">1. Order Cancellations</h3>
          <p>
            You can cancel your order within 2 hours of placing it by contacting our support team via WhatsApp at +91 63838 05976 or emailing info@nadhancoffee.com. Once an order has been freshly ground and dispatched, it cannot be cancelled.
          </p>
          <h3 className="text-base font-bold text-brand-coffee-950 mt-4">2. Damaged or Incorrect Items</h3>
          <p>
            In the rare event that your package is damaged in transit or you receive an incorrect product variant, please notify us within 48 hours of delivery with photos of the outer package. We will immediately dispatch a fresh replacement or process a 100% full refund via original payment method within 3-5 business days.
          </p>
        </div>
      ),
    },
    privacy: {
      title: 'Privacy Policy',
      icon: <Lock className="w-6 h-6 text-brand-pink-600" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-brand-coffee-800 leading-relaxed">
          <p>
            Nathan Coffee Mart is committed to safeguarding your privacy. We only collect necessary contact and shipping details (Name, Phone, Delivery Address, Email) to fulfill your orders.
          </p>
          <h3 className="text-base font-bold text-brand-coffee-950 mt-4">1. Payment Security</h3>
          <p>
            All online transactions are securely encrypted and processed by Razorpay. We do not store any credit card numbers, debit card details, or UPI PINs on our servers.
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
            Welcome toNathan Coffee Mart. By purchasing our products or using our website, you agree to comply with and be bound by the terms and conditions outlined here.
          </p>
          <h3 className="text-base font-bold text-brand-coffee-950 mt-4">1. Product Purity & Shelf Life</h3>
          <p>
            AllNathan Coffee powder is 100% natural, manufactured under FSSAI Registration No. 22426461000422. Best consumed within 6 months from the date of manufacture. Keep in an airtight container away from direct moisture.
          </p>
          <h3 className="text-base font-bold text-brand-coffee-950 mt-4">2. Jurisdiction</h3>
          <p>
            Any legal claims or disputes related toNathan Coffee Mart transactions are subject to the exclusive jurisdiction of the competent courts in Thanjavur / Thanjavur, Tamil Nadu.
          </p>
        </div>
      ),
    },
  };

  const activePolicy = policies[type] || policies.shipping;

  return (
    <>
      <SEOMeta
        title={`${activePolicy.title} -Nathan Coffee`}
        description={`ReadNathan Coffee Mart's ${activePolicy.title}. Transparent policies for fresh coffee powder dispatch and customer assurance.`}
        canonicalUrl={`https://nadhancoffee.com/policy/${type}`}
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
                Nathan Coffee Mart • Last Updated: 2026
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
