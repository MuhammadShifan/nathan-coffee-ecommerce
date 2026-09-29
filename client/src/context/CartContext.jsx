import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('nadhan_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [cartBadgePulse, setCartBadgePulse] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('nadhan_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const triggerBadgeAnimation = () => {
    setCartBadgePulse(true);
    setTimeout(() => setCartBadgePulse(false), 800);
  };

  const addToCart = (product, selectedWeight = '250g', quantity = 1, openDrawer = true) => {
    // Find matching variant
    const variant = product.variants?.find((v) => v.weight === selectedWeight) || {
      weight: selectedWeight,
      price: product.price || 299,
      mrp: product.mrp || 340,
    };

    const itemKey = `${product._id || product.slug}-${selectedWeight}`;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.itemKey === itemKey);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        const primaryImage =
          (Array.isArray(product.images) && product.images.length > 0
            ? (typeof product.images[0] === 'object' && product.images[0]?.url ? product.images[0].url : product.images[0])
            : product.image) || '/images/250g front.png';

        return [
          ...prevItems,
          {
            itemKey,
            productId: product._id || product.slug,
            title: product.title,
            weight: selectedWeight,
            price: variant.price,
            mrp: variant.mrp,
            quantity: quantity,
            image: primaryImage,
            slug: product.slug,
          },
        ];
      }
    });

    triggerBadgeAnimation();
    showToast(`Added "${product.title} (${selectedWeight})" to your cart! ☕`);

    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const updateQuantity = (itemKey, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemKey);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.itemKey === itemKey ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeFromCart = (itemKey) => {
    setCartItems((prev) => prev.filter((item) => item.itemKey !== itemKey));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem('nadhan_cart');
    } catch (e) {}
  };

  // Calculations
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  // Free delivery over ₹500, else ₹40 standard delivery charge
  const shippingFee = subtotal >= 500 || subtotal === 0 ? 0 : 40;
  const grandTotal = subtotal + shippingFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemsCount,
        subtotal,
        shippingFee,
        grandTotal,
        toastMessage,
        setToastMessage,
        showToast,
        cartBadgePulse,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
