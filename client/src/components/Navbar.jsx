import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Menu,
  X,
  Phone,
  ShieldCheck,
  Sparkles,
  Package,
  LogOut,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { totalItemsCount, setIsCartOpen, cartBadgePulse, showToast } = useCart();
  const { user, isUserAuthenticated, openAuthModal, logoutUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown & mobile menu on route change or click outside
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUserDropdownOpen(false);
    showToast('Logged out successfully. See you soon! ☕', 'info');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products & Shop', path: '/shop' },
    { name: 'Our Heritage', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <>
      {/* Top Notification Bar */}
      <div className="bg-brand-pink-900 text-white text-xs sm:text-sm py-1.5 px-4 font-medium border-b border-brand-pink-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-brand-yellow-500 text-brand-pink-900 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full">
              Fresh Roast 2026
            </span>
            <span className="hidden sm:inline">100% Pure Filter Coffee Powder from Coimbatore & Thanjavur</span>
            <span className="sm:hidden">100% Pure Filter Coffee</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="hidden md:flex items-center gap-1 text-brand-yellow-300">
              <Sparkles className="w-3.5 h-3.5" /> Free Delivery on ₹500+
            </span>
            <a
              href="tel:+91 6383 805 976"
              className="flex items-center gap-1.5 hover:text-brand-yellow-300 transition-colors font-semibold"
            >
              <Phone className="w-3 h-3 text-brand-yellow-400" /> +91 63838 05976
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 w-full ${scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-brand-pink-100 py-2'
            : 'bg-white/90 backdrop-blur-sm border-b border-brand-coffee-100 py-2.5 sm:py-3.5'
          }`}
      >
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo & Name (Left Side) */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 flex-shrink">
            <div className="relative overflow-hidden rounded-lg border-2 border-brand-pink-500 shadow-sm bg-brand-pink-600 p-0.5 flex-shrink-0 transition-transform group-hover:scale-105">
              <picture>
                <source srcSet="/images/logo.avif" type="image/avif" />
                <img
                  src="/images/logo.jpeg"
                  alt="Nadhan Coffee Mart Logo"
                  className="h-8 sm:h-11 w-auto object-contain bg-white rounded"
                  width="130"
                  height="42"
                />
              </picture>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-extrabold text-sm sm:text-2xl tracking-tight text-brand-pink-600 group-hover:text-brand-pink-700 font-sans truncate">
                  Nathan
                </span>
                <span className="font-bold text-sm sm:text-2xl text-brand-coffee-950 truncate">COFFEE</span>
              </div>
              <span className="hidden sm:flex items-center gap-1 text-xs font-semibold tracking-wider text-brand-coffee-700 uppercase -mt-0.5 font-tamil truncate">
                நாடன் காப்பி மார்ட் <span className="text-brand-pink-500">•</span> <span>Since 1950</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Visible on md and above) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-lg text-xs lg:text-sm font-semibold transition-all relative ${isActive
                      ? 'text-brand-pink-600 bg-brand-pink-50 font-bold'
                      : 'text-brand-coffee-800 hover:text-brand-pink-600 hover:bg-brand-pink-50/60'
                    }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-pink-600 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Auth CTA */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Cart Button with animated Counter badge */}
            <motion.button
              id="cart-toggle-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:p-2.5 rounded-xl bg-brand-coffee-100/70 hover:bg-brand-pink-50 text-brand-coffee-900 hover:text-brand-pink-600 transition-all border border-brand-coffee-200 hover:border-brand-pink-300 flex-shrink-0"
              whileTap={{ scale: 0.95 }}
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <motion.span
                  id="cart-badge-count"
                  animate={cartBadgePulse ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="absolute -top-1.5 -right-1.5 bg-brand-pink-600 text-white font-black text-[10px] sm:text-xs min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-[20px] rounded-full flex items-center justify-center px-1 shadow-md border-2 border-white ring-1 ring-brand-yellow-400"
                >
                  {totalItemsCount}
                </motion.span>
              )}
            </motion.button>

            {/* AUTHENTICATION STATE: USER LOGGED IN vs GUEST */}
            {isUserAuthenticated && user ? (
              /* LOGGED IN: My Orders Button & Account Dropdown */
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* My Orders Button */}
                <Link
                  id="my-orders-nav-btn"
                  to="/my-orders"
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${location.pathname === '/my-orders'
                      ? 'bg-brand-pink-600 text-white shadow-brand-pink-600/30'
                      : 'bg-brand-pink-50 hover:bg-brand-pink-100 text-brand-pink-700 border border-brand-pink-200'
                    }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>My Orders</span>
                </Link>

                {/* User Profile / Logout Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    id="user-profile-menu-btn"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-xl bg-brand-coffee-100/80 hover:bg-brand-coffee-200 text-brand-coffee-950 font-bold text-xs border border-brand-coffee-200 transition-colors flex-shrink-0"
                    aria-label="User Account Menu"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-pink-600 text-white flex items-center justify-center text-[10px] font-black">
                      {user.mobileNumber ? user.mobileNumber.slice(-2) : 'U'}
                    </div>
                    <span className="hidden md:inline font-mono">
                      +91 {user.mobileNumber ? `${user.mobileNumber.slice(0, 5)} ${user.mobileNumber.slice(5)}` : ''}
                    </span>
                    <ChevronDown className="w-3 h-3 text-brand-coffee-600" />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-brand-coffee-200 p-2 z-50 text-xs font-medium"
                      >
                        <div className="px-3 py-2 border-b border-brand-coffee-100 mb-1">
                          <p className="text-[10px] uppercase font-bold text-brand-coffee-500">Logged in as</p>
                          <p className="font-extrabold text-brand-coffee-950 font-mono text-xs mt-0.5">
                            +91 {user.mobileNumber}
                          </p>
                        </div>

                        <Link
                          to="/my-orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-brand-coffee-800 hover:bg-brand-pink-50 hover:text-brand-pink-700 font-semibold transition-colors"
                        >
                          <Package className="w-4 h-4 text-brand-pink-600" />
                          <span>My Orders & History</span>
                        </Link>

                        <Link
                          to="/shop"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-brand-coffee-800 hover:bg-brand-pink-50 hover:text-brand-pink-700 font-semibold transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4 text-brand-coffee-600" />
                          <span>Shop Coffee Powder</span>
                        </Link>

                        <div className="pt-1 mt-1 border-t border-brand-coffee-100">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              /* GUEST: Login Button & Order Now CTA */
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Login Button */}
                <button
                  id="nav-login-btn"
                  onClick={() => openAuthModal()}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white hover:bg-brand-pink-50 text-brand-coffee-900 hover:text-brand-pink-600 font-bold text-xs border border-brand-coffee-200 hover:border-brand-pink-300 transition-all shadow-sm flex-shrink-0"
                >
                  <UserIcon className="w-3.5 h-3.5 text-brand-pink-600" />
                  <span>Login</span>
                </button>

                {/* Order Now CTA Button */}
                <Link
                  id="order-now-nav-btn"
                  to="/shop"
                  className="hidden sm:inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-md shadow-brand-pink-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] border border-brand-pink-500 ring-2 ring-brand-yellow-400/50 btn-shimmer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow-400 animate-ping" />
                  Order Now
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger (Visible on < md) */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-brand-coffee-800 hover:bg-brand-pink-50 hover:text-brand-pink-600 transition-colors flex-shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-brand-coffee-100 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 shadow-xl"
            >
              <nav className="flex flex-col gap-1.5">
                {/* Logged in User info banner in mobile menu */}
                {isUserAuthenticated && user && (
                  <div className="p-3 bg-brand-pink-50/70 border border-brand-pink-200 rounded-2xl flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-pink-600 text-white flex items-center justify-center text-xs font-black">
                        📱
                      </div>
                      <div>
                        <p className="text-[10px] text-brand-pink-800 font-bold uppercase">Logged in as</p>
                        <p className="text-xs font-extrabold text-brand-coffee-950 font-mono">+91 {user.mobileNumber}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-xs font-bold text-red-600 hover:text-red-700 bg-white px-2.5 py-1 rounded-lg border border-red-200 shadow-sm"
                    >
                      Logout
                    </button>
                  </div>
                )}

                {/* My Orders link in mobile menu */}
                <Link
                  to="/my-orders"
                  className={`px-4 py-3 rounded-xl text-base font-semibold flex items-center justify-between ${location.pathname === '/my-orders'
                      ? 'bg-brand-pink-50 text-brand-pink-600 font-bold border-l-4 border-brand-pink-600'
                      : 'text-brand-coffee-800 hover:bg-brand-coffee-50'
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-brand-pink-600" /> My Orders & History
                  </span>
                </Link>

                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`px-4 py-3 rounded-xl text-base font-semibold flex items-center justify-between ${isActive
                          ? 'bg-brand-pink-50 text-brand-pink-600 font-bold border-l-4 border-brand-pink-600'
                          : 'text-brand-coffee-800 hover:bg-brand-coffee-50'
                        }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}

                {/* Mobile Auth action */}
                {!isUserAuthenticated && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal();
                    }}
                    className="w-full py-3 bg-brand-pink-50 hover:bg-brand-pink-100 text-brand-pink-700 border border-brand-pink-300 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 mt-1"
                  >
                    <UserIcon className="w-4 h-4 text-brand-pink-600" />
                    <span>Login with Mobile Number</span>
                  </button>
                )}

                <div className="pt-3 border-t border-brand-coffee-100 mt-2 flex flex-col gap-2.5">
                  <Link
                    to="/shop"
                    className="w-full py-3 bg-brand-pink-600 text-white text-center rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
                  >
                    <span>☕</span> Browse All Products & Order
                  </Link>
                  <a
                    href="https://wa.me/916383805976?text=Hello%20Nathan%20Coffee%2C%20I%20would%20like%20to%20order%20filter%20coffee%20powder"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-center rounded-xl font-semibold text-sm shadow flex items-center justify-center gap-2"
                  >
                    <span>💬</span> WhatsApp Quick Order
                  </a>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Navbar;
