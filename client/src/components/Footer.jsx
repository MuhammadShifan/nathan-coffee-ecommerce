import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Award, CheckCircle2, ShieldCheck, Heart, Coffee } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-coffee-950 text-brand-coffee-100 relative overflow-hidden border-t-4 border-brand-pink-600">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-pink-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info & Story */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src="/images/logo.jpeg"
                alt="Nadhan Coffee Logo"
                className="h-11 w-auto bg-white rounded-lg p-0.5 border-2 border-brand-pink-500"
              />
              <div>
                <span className="font-extrabold text-xl tracking-tight text-brand-pink-400">NADHAN </span>
                <span className="font-bold text-xl text-white">COFFEE</span>
                <p className="text-[11px] text-brand-yellow-400 font-medium">Thanjavur & Thanjavur</p>
              </div>
            </Link>
            <p className="text-sm text-brand-coffee-300 leading-relaxed">
              Crafting traditional, authentic South Indian filter coffee powder since 1950. Slow-roasted in small batches with pure plantation beans to bring the nostalgic aroma of Tamil Nadu filter coffee to your cup.
            </p>
            <div className="flex items-center gap-2 text-xs bg-brand-coffee-900/80 p-2.5 rounded-xl border border-brand-coffee-800 text-brand-yellow-300">
              <ShieldCheck className="w-4 h-4 text-brand-yellow-400 flex-shrink-0" />
              <span><strong>FSSAI Lic. No:</strong> 22426461000422</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <Coffee className="w-4 h-4 text-brand-pink-500" /> Quick Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-brand-coffee-300 hover:text-brand-pink-400 transition-colors flex items-center gap-1.5">
                  <span>›</span> Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-brand-coffee-300 hover:text-brand-pink-400 transition-colors flex items-center gap-1.5">
                  <span>›</span> Buy Coffee Powder (Shop)
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-brand-coffee-300 hover:text-brand-pink-400 transition-colors flex items-center gap-1.5">
                  <span>›</span> Our Heritage & Legacy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-brand-coffee-300 hover:text-brand-pink-400 transition-colors flex items-center gap-1.5">
                  <span>›</span> Contact & Bulk Wholesale
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-brand-coffee-400 hover:text-brand-yellow-400 transition-colors flex items-center gap-1.5 text-xs pt-2">
                  <span>🔒</span> Admin Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Quality Assurances */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-yellow-400" /> Customer Assurance
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/policy/shipping" className="text-brand-coffee-300 hover:text-brand-yellow-400 transition-colors flex items-center gap-1.5">
                  <span>›</span> Shipping & Delivery Policy
                </Link>
              </li>
              <li>
                <Link to="/policy/refund" className="text-brand-coffee-300 hover:text-brand-yellow-400 transition-colors flex items-center gap-1.5">
                  <span>›</span> Cancellation & Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/policy/privacy" className="text-brand-coffee-300 hover:text-brand-yellow-400 transition-colors flex items-center gap-1.5">
                  <span>›</span> Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/policy/terms" className="text-brand-coffee-300 hover:text-brand-yellow-400 transition-colors flex items-center gap-1.5">
                  <span>›</span> Terms & Conditions
                </Link>
              </li>
            </ul>

            <div className="mt-4 p-3 rounded-xl bg-brand-pink-950/40 border border-brand-pink-900/60 text-xs text-brand-pink-200">
              <p className="font-semibold text-brand-yellow-300 mb-1">☕ 100% Freshness Guarantee</p>
              <p>Roasted, ground and packed within 24 hours of your dispatch.</p>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-pink-500" /> Store Locations & Contact
            </h3>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-yellow-400 mt-1 flex-shrink-0" />
                <div className="text-brand-coffee-300 text-xs leading-relaxed">
                  <p className="text-white font-semibold">Thanjavur Branch:</p>
                  <p>2928, South Street, Near Canara Bank, Thanjavur, Tamil Nadu - 613001</p>
                  <p className="text-brand-yellow-300/80 mt-0.5">Mangalapuram, MC Road</p>
                </div>
              </div>

              <div className="pt-2 border-t border-brand-coffee-800 space-y-2">
                <a
                  href="tel:+91 6383 805 976"
                  className="flex items-center gap-2 text-brand-yellow-400 hover:text-brand-yellow-300 font-semibold text-xs"
                >
                  <Phone className="w-3.5 h-3.5" /> +91 63838 05976
                </a>
                <a
                  href="mailto:info@nadhancoffee.com"
                  className="flex items-center gap-2 text-brand-coffee-300 hover:text-white text-xs"
                >
                  <Mail className="w-3.5 h-3.5 text-brand-pink-400" /> info@nadhancoffee.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with SEO Keywords */}
        <div className="mt-12 pt-8 border-t border-brand-coffee-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-coffee-400">
          <p>© 2026Nathan Coffee Mart. All Rights Reserved. Pure Filter Coffee from Thanjavur & Thanjavur.</p>
          <div className="flex items-center gap-3">
            <span className="text-brand-pink-400 font-medium flex items-center gap-1">
              Crafted with <Heart className="w-3 h-3 fill-brand-pink-500 text-brand-pink-500 inline" /> for South Indian Coffee Lovers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
