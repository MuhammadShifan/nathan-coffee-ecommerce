import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartDrawer = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingFee,
    grandTotal,
    totalItemsCount,
  } = useCart();

  const { isUserAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const freeShippingThreshold = 500;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleCheckoutRedirect = () => {
    setIsCartOpen(false);
    if (!isUserAuthenticated) {
      openAuthModal(() => {
        navigate('/checkout');
      });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-brand-coffee-950/60 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-brand-coffee-200"
            >
              {/* Header */}
              <div className="p-5 border-b border-brand-coffee-100 bg-brand-pink-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-brand-pink-600 text-white rounded-xl shadow-sm">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-brand-coffee-950">Your Coffee Bag</h2>
                    <p className="text-xs text-brand-pink-700 font-semibold">
                      {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} selected
                    </p>
                  </div>
                </div>
                <button
                  id="close-cart-btn"
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-xl text-brand-coffee-600 hover:bg-brand-pink-100/60 hover:text-brand-pink-600 transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Meter */}
              <div className="px-5 py-3 bg-brand-yellow-50 border-b border-brand-yellow-200/60 text-xs">
                {subtotal >= freeShippingThreshold ? (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>🎉 You unlocked FREE Delivery across India!</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-brand-coffee-800">
                      <span>Add ₹{remainingForFreeShipping} more for FREE Delivery</span>
                      <span className="font-extrabold text-brand-pink-700">{Math.round(freeShippingProgress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-brand-yellow-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-pink-600 to-brand-yellow-500 rounded-full transition-all duration-300"
                        style={{ width: `${freeShippingProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-brand-pink-50 border-2 border-dashed border-brand-pink-300 flex items-center justify-center text-4xl shadow-inner">
                      ☕
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-brand-coffee-900">Your cart is empty</h3>
                      <p className="text-xs text-brand-coffee-600 max-w-xs mt-1">
                        Start your day with the authentic aroma ofNathan Fresh Filter Coffee powder.
                      </p>
                    </div>
                    <button
                      id="cart-explore-btn"
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/shop');
                      }}
                      className="px-6 py-2.5 bg-brand-pink-600 hover:bg-brand-pink-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                    >
                      Explore Products
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <motion.div
                      layout
                      key={item.itemKey}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex gap-3.5 p-3 rounded-2xl border border-brand-coffee-200 bg-white hover:border-brand-pink-200 shadow-sm transition-all"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-20 h-20 bg-brand-coffee-50 rounded-xl overflow-hidden flex-shrink-0 border border-brand-coffee-100 p-1 flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-sm font-bold text-brand-coffee-950 line-clamp-1 leading-snug">
                              {item.title}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.itemKey)}
                              className="text-brand-coffee-400 hover:text-red-600 p-1 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-extrabold bg-brand-yellow-100 text-brand-coffee-900 px-2 py-0.5 rounded-md border border-brand-yellow-300">
                              {item.weight}
                            </span>
                            {item.mrp > item.price && (
                              <span className="text-[11px] text-brand-coffee-400 line-through">
                                ₹{item.mrp}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Quantity Controls */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-coffee-50">
                          <div className="flex items-center border border-brand-coffee-200 rounded-lg bg-brand-coffee-50 overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}
                              className="p-1 hover:bg-brand-pink-100 text-brand-coffee-700 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-bold text-brand-coffee-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}
                              className="p-1 hover:bg-brand-pink-100 text-brand-coffee-700 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-sm font-extrabold text-brand-pink-700">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer Summary & Checkout CTA */}
              {cartItems.length > 0 && (
                <div className="p-5 border-t border-brand-coffee-200 bg-brand-coffee-50/70 space-y-3">
                  <div className="space-y-1.5 text-xs text-brand-coffee-700">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-brand-coffee-950">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Fee</span>
                      <span>
                        {shippingFee === 0 ? (
                          <span className="text-emerald-700 font-bold uppercase">FREE</span>
                        ) : (
                          `₹${shippingFee}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-brand-coffee-950 pt-2 border-t border-brand-coffee-200">
                      <span>Final Total:</span>
                      <span className="text-brand-pink-600 text-base">₹{grandTotal}</span>
                    </div>
                  </div>

                  <button
                    id="cart-checkout-proceed-btn"
                    onClick={handleCheckoutRedirect}
                    className="w-full py-3.5 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-pink-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] btn-shimmer"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-brand-coffee-500 text-center pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Secure Razorpay Checkout with UPI & Cards</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
