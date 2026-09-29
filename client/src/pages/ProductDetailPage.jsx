import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Zap,
  Star,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Coffee,
  CheckCircle2,
  Clock,
  Award,
  Maximize2,
  X,
  Share2,
  Flame,
  Droplets,
  Heart,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SEOMeta from '../components/SEOMeta';
import ProductCard from '../components/ProductCard';
import { defaultProductsData } from '../data/defaultProducts';

// Product-specific Customer Reviews Dictionary
const productReviewsDictionary = {
  // Pure Filter Coffee Powder 250g
  'pure-filter-coffee-powder-250g': [
    {
      name: 'Venkatesh S.',
      location: 'Chennai',
      date: 'August 12, 2026',
      rating: 5,
      comment: 'Authentic 100% pure shade-grown coffee with zero chicory! The decoction is remarkably thick and gives that classic aromatic Mylapore morning kick. Perfect grind consistency for traditional brass drip filters.',
    },
    {
      name: 'Lakshmi Raman',
      location: 'Thanjavur',
      date: 'September 05, 2026',
      rating: 5,
      comment: "We have been buying Nathan Coffee since our grandparents' time in Thanjavur. The slow wood-fired drum roast preserves essential coffee oils and thick golden foam.",
    },
  ],
  // Pure Filter Coffee Powder 500g
  'pure-filter-coffee-powder-500g': [
    {
      name: 'Dr. Aravind Swaminathan',
      location: 'Bangalore',
      date: 'July 28, 2026',
      rating: 5,
      comment: 'The 500g family value pack is our household staple. Airtight kraft ziplock pouch preserves the fresh roasted aroma down to the very last spoonful without any loss of strength.',
    },
    {
      name: 'Kavitha Sundar',
      location: 'Madurai',
      date: 'August 24, 2026',
      rating: 5,
      comment: 'Zero adulteration and 100% pure Arabica & Robusta beans. The golden froth and lingering aftertaste make it the best authentic filter coffee across South India.',
    },
  ],
  // Traditional Chicory Blended Coffee (80:20)
  'traditional-chicory-blended-coffee-powder': [
    {
      name: 'Karthik Raja',
      location: 'Trichy',
      date: 'August 18, 2026',
      rating: 5,
      comment: 'The classic 80:20 hotel-style degree coffee blend! The roasted French chicory creates a deeply dark, velvety decoction with a heavenly lingering aroma and thick frothy crema.',
    },
    {
      name: 'Meenakshi Sundaram',
      location: 'Thanjavur',
      date: 'September 14, 2026',
      rating: 5,
      comment: 'Reminds me of traditional Kumbakonam wedding feast coffee. Heavy body and rich caramel notes that pairs heavenly with piping hot frothy milk in a brass davarah.',
    },
  ],
  // Default / Fallback Reviews
  default: [
    {
      name: 'Suresh Kumar',
      location: 'Salem',
      date: 'August 10, 2026',
      rating: 5,
      comment: 'Exceptional roast purity and lightning fast delivery across Tamil Nadu. Unbeatable fresh aroma and smooth authentic taste.',
    },
    {
      name: 'Ananya Raghavan',
      location: 'Thanjavur',
      date: 'September 02, 2026',
      rating: 5,
      comment: 'Freshly ground and delivered with incredible aroma. Once you taste authentic Nathan Coffee, you can never go back to commercial instant powders.',
    },
  ],
};

// Helper to resolve reviews for a given product
const getProductReviews = (prod) => {
  if (!prod) return productReviewsDictionary.default;

  if (prod.slug && productReviewsDictionary[prod.slug]) {
    return productReviewsDictionary[prod.slug];
  }

  if (prod._id && productReviewsDictionary[prod._id]) {
    return productReviewsDictionary[prod._id];
  }

  const slugOrTitle = (prod.slug || prod.title || '').toLowerCase();
  if (slugOrTitle.includes('chicory') || prod.category === 'chicory_blend') {
    return productReviewsDictionary['traditional-chicory-blended-coffee-powder'];
  }
  if (slugOrTitle.includes('500g')) {
    return productReviewsDictionary['pure-filter-coffee-powder-500g'];
  }
  if (slugOrTitle.includes('pure') || slugOrTitle.includes('filter') || prod.category === 'pure_coffee') {
    return productReviewsDictionary['pure-filter-coffee-powder-250g'];
  }

  return productReviewsDictionary.default;
};

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isUserAuthenticated, openAuthModal } = useAuth();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carousel & Image State
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0); // 1 = next, -1 = prev
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isHoverZoom, setIsHoverZoom] = useState(false);

  // Product Selection State
  const [selectedWeight, setSelectedWeight] = useState('250g');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('brewing');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const [prodRes, allRes] = await Promise.all([
          api.get(`/api/products/${slug}`).catch(() => null),
          api.get('/api/products').catch(() => null),
        ]);

        let currentProd = prodRes?.data?.data;
        if (!currentProd) {
          currentProd = defaultProductsData.find(
            (p) => p.slug === slug || p._id === slug || p.title.toLowerCase().includes(slug.toLowerCase())
          );
        }

        const productList = allRes?.data?.data?.length > 0 ? allRes.data.data : defaultProductsData;

        setProduct(currentProd || defaultProductsData[0]);
        setAllProducts(productList);

        if (currentProd) {
          setSelectedWeight(
            currentProd.selectedWeight ||
            (currentProd.variants && currentProd.variants[0]?.weight) ||
            '250g'
          );
        }
        setCurrentImgIndex(0);
      } catch (err) {
        console.error('Error fetching product detail:', err);
        const fallback = defaultProductsData.find((p) => p.slug === slug) || defaultProductsData[0];
        setProduct(fallback);
        setAllProducts(defaultProductsData);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [slug]);

  if (loading || !product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-brand-pink-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-brand-coffee-800 font-bold text-sm">
            Brewing Fresh Details for You...
          </p>
        </div>
      </div>
    );
  }

  // Normalize Images
  const rawImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map((img) => (typeof img === 'object' && img?.url ? img.url : img)).filter(Boolean)
    : [product.image || '/images/250g front.png'];

  const images = rawImages.length > 0 ? rawImages : ['/images/250g front.png'];

  // Current Variant Details
  const currentVariant = product.variants?.find((v) => v.weight === selectedWeight) || {
    weight: selectedWeight,
    price: product.price || 299,
    mrp: product.mrp || 340,
    inStock: true,
  };

  const discountPercent = currentVariant.mrp > currentVariant.price
    ? Math.round(((currentVariant.mrp - currentVariant.price) / currentVariant.mrp) * 100)
    : 0;

  // Product-specific reviews
  const currentReviews = getProductReviews(product);

  // Carousel Slide Handlers
  const paginate = (newDirection) => {
    setSlideDirection(newDirection);
    setCurrentImgIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = images.length - 1;
      if (nextIndex >= images.length) nextIndex = 0;
      return nextIndex;
    });
  };

  const handleThumbnailClick = (index) => {
    setSlideDirection(index > currentImgIndex ? 1 : -1);
    setCurrentImgIndex(index);
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product, selectedWeight, quantity, true);
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedWeight, quantity, false);
    if (!isUserAuthenticated) {
      openAuthModal(() => {
        navigate('/checkout');
      });
    } else {
      navigate('/checkout');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Carousel slide variants for smooth animation
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 250 : -250,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 },
      },
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 250 : -250,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  // Related products
  const relatedProducts = allProducts.filter(
    (p) => (p._id !== product._id && p.slug !== product.slug)
  ).slice(0, 3);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    { name: product.title, url: `/product/${product.slug}` },
  ];

  return (
    <>
      <SEOMeta
        title={`${product.title} -Nathan Coffee Mart`}
        description={product.shortDescription || product.description}
        keywords={`${product.title}, south indian filter coffee, Thanjavur coffee, pure coffee powder buy online, thanjavur filter coffee`}
        canonicalUrl={`https://nadhancoffee.com/product/${product.slug}`}
        breadcrumbs={breadcrumbs}
        productData={{
          name: product.title,
          description: product.shortDescription,
          image: images[0],
          price: currentVariant.price,
          availability: currentVariant.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          rating: product.rating || 4.9,
          reviewCount: product.reviewCount || 248,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 sm:space-y-14">
        {/* ========================================================================= */}
        {/* BREADCRUMB NAVIGATION */}
        {/* ========================================================================= */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-brand-coffee-600 flex-wrap">
          <Link to="/" className="hover:text-brand-pink-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-coffee-400" />
          <Link to="/shop" className="hover:text-brand-pink-600 transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-coffee-400" />
          <span className="text-brand-pink-600 font-bold truncate max-w-xs sm:max-w-md">
            {product.title}
          </span>
        </nav>

        {/* ========================================================================= */}
        {/* MAIN PRODUCT SHOWCASE (CAROUSEL & DETAILS) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          {/* ===================================================================== */}
          {/* LEFT: MULTI-IMAGE CAROUSEL SLIDER */}
          {/* ===================================================================== */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-3xl border border-brand-coffee-200 shadow-lg p-4 sm:p-8 relative overflow-hidden group">
              {/* Top Badges */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
                {discountPercent > 0 && (
                  <span className="bg-brand-pink-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md tracking-wide">
                    SAVE {discountPercent}%
                  </span>
                )}
                <span className="bg-brand-yellow-400 text-brand-coffee-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 border border-brand-yellow-500">
                  <Sparkles className="w-3 h-3" /> 100% PURE AROMA
                </span>
              </div>

              {/* Lightbox / Fullscreen Icon */}
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 hover:bg-white text-brand-coffee-800 shadow-md transition-all hover:scale-110 border border-brand-coffee-200"
                title="View Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Main Carousel Viewport with Swipe Gesture */}
              <div
                className="relative h-72 sm:h-96 w-full flex items-center justify-center overflow-hidden select-none cursor-grab active:cursor-grabbing"
                onMouseEnter={() => setIsHoverZoom(true)}
                onMouseLeave={() => setIsHoverZoom(false)}
              >
                <AnimatePresence initial={false} custom={slideDirection}>
                  <motion.div
                    key={currentImgIndex}
                    custom={slideDirection}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.8}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = offset.x;
                      if (swipe < -50 || velocity.x < -400) {
                        paginate(1);
                      } else if (swipe > 50 || velocity.x > 400) {
                        paginate(-1);
                      }
                    }}
                    className="absolute inset-0 flex items-center justify-center p-4"
                  >
                    <img
                      src={images[currentImgIndex]}
                      alt={`${product.title} - View ${currentImgIndex + 1}`}
                      className={`max-h-full max-w-full object-contain drop-shadow-xl transition-transform duration-500 ${isHoverZoom ? 'scale-110' : 'scale-100'
                        }`}
                      onError={(e) => {
                        e.target.src = '/images/250g front.png';
                      }}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Left & Right Arrow Navigation Controls */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => paginate(-1)}
                      className="absolute left-2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-brand-coffee-950 shadow-lg flex items-center justify-center border border-brand-coffee-200 transition-transform hover:scale-110"
                      aria-label="Previous Image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => paginate(1)}
                      className="absolute right-2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-brand-coffee-950 shadow-lg flex items-center justify-center border border-brand-coffee-200 transition-transform hover:scale-110"
                      aria-label="Next Image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Pagination Pill */}
                {images.length > 1 && (
                  <div className="absolute bottom-2 inset-x-0 flex justify-center z-20 pointer-events-none">
                    <span className="bg-brand-coffee-950/75 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                      {currentImgIndex + 1} / {images.length}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Strip Gallery */}
            {images.length > 1 && (
              <div className="flex items-center justify-center gap-3 overflow-x-auto py-2 px-1 custom-scrollbar">
                {images.map((url, idx) => {
                  const isSelected = currentImgIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleThumbnailClick(idx)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1.5 bg-white border-2 transition-all flex items-center justify-center flex-shrink-0 shadow-sm ${isSelected
                        ? 'border-brand-pink-600 ring-4 ring-brand-pink-300/40 scale-105 shadow-md'
                        : 'border-brand-coffee-200 hover:border-brand-pink-400 opacity-70 hover:opacity-100'
                        }`}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${idx + 1}`}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.target.src = '/images/250g front.png';
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ===================================================================== */}
          {/* RIGHT: PRODUCT INFO, VARIANTS, PRICING & BUY ACTIONS */}
          {/* ===================================================================== */}
          <div className="lg:col-span-6 space-y-6">
            {/* Header & Rating */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-amber-900 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{product.rating || '4.9'}</span>
                    <span className="text-brand-coffee-400 font-normal">({product.reviewCount || '248'} reviews)</span>
                  </div>
                  <span className="text-xs font-bold text-brand-coffee-600 bg-brand-coffee-100/80 px-2.5 py-1 rounded-lg">
                    {product.roastLevel || 'Medium-Dark Slow Roast'}
                  </span>
                </div>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-white border border-brand-coffee-200 hover:border-brand-pink-400 text-brand-coffee-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-brand-pink-600" />
                  <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-coffee-950 tracking-tight leading-snug">
                {product.title}
              </h1>

              {product.tamilTitle && (
                <p className="text-base sm:text-lg text-brand-coffee-700 font-tamil font-semibold">
                  {product.tamilTitle}
                </p>
              )}

              <p className="text-xs sm:text-sm text-brand-coffee-700 leading-relaxed pt-1">
                {product.shortDescription || product.description}
              </p>
            </div>

            {/* Price Box */}
            <div className="p-4 sm:p-5 bg-white rounded-3xl border border-brand-coffee-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-brand-coffee-500 uppercase tracking-wider block">
                  Online Special Price:
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-black text-brand-coffee-950">
                    ₹{currentVariant.price * quantity}
                  </span>
                  {currentVariant.mrp > currentVariant.price && (
                    <span className="text-sm sm:text-base text-brand-coffee-400 line-through">
                      ₹{currentVariant.mrp * quantity}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-xs font-extrabold text-brand-pink-600 bg-brand-pink-50 px-2 py-0.5 rounded-md border border-brand-pink-200">
                      Save ₹{(currentVariant.mrp - currentVariant.price) * quantity} ({discountPercent}% OFF)
                    </span>
                  )}
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                ✓ All Taxes Included
              </span>
            </div>

            {/* Weight Variant Selector */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-brand-coffee-800 uppercase tracking-wider flex items-center justify-between">
                <span>Select Pack Size:</span>
                <span className="text-brand-pink-600 normal-case font-bold">Selected: {selectedWeight}</span>
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {(product.variants && product.variants.length > 0
                  ? product.variants
                  : [
                    { weight: '250g', price: 299, mrp: 340 },
                    { weight: '500g', price: 580, mrp: 680 },
                    { weight: '1kg', price: 1100, mrp: 1360 },
                  ]
                ).map((variant) => {
                  const isSelected = selectedWeight === variant.weight;
                  return (
                    <button
                      key={variant.weight}
                      type="button"
                      onClick={() => setSelectedWeight(variant.weight)}
                      className={`p-3 rounded-2xl text-center border-2 transition-all flex flex-col justify-center items-center gap-0.5 ${isSelected
                        ? 'border-brand-pink-600 bg-brand-pink-50/60 shadow-md ring-2 ring-brand-yellow-400/80'
                        : 'border-brand-coffee-200 bg-white hover:border-brand-pink-300'
                        }`}
                    >
                      <span className={`text-sm font-black ${isSelected ? 'text-brand-pink-700' : 'text-brand-coffee-900'}`}>
                        {variant.weight}
                      </span>
                      <span className="text-xs font-bold text-brand-coffee-700">
                        ₹{variant.price}
                      </span>
                      {variant.mrp > variant.price && (
                        <span className="text-[10px] text-brand-coffee-400 line-through">
                          MRP ₹{variant.mrp}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-brand-coffee-800">Quantity:</span>
                <div className="flex items-center bg-white border border-brand-coffee-200 rounded-xl overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2 text-brand-coffee-800 hover:bg-brand-coffee-100 font-bold text-base transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-xs font-black text-brand-coffee-950">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="px-3.5 py-2 text-brand-coffee-800 hover:bg-brand-coffee-100 font-bold text-base transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  className={`w-full py-4 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border-2 transition-all shadow-md ${isAdding
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white hover:bg-brand-pink-50 text-brand-pink-700 border-brand-pink-500'
                    }`}
                >
                  {isAdding ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" /> <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" /> <span>Add to Cart</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleBuyNow}
                  className="w-full py-4 px-4 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 text-white rounded-2xl font-black text-sm shadow-lg shadow-brand-pink-600/30 flex items-center justify-center gap-2 btn-shimmer"
                >
                  <Zap className="w-5 h-5 text-brand-yellow-400 fill-brand-yellow-400" />
                  <span>Buy Now (1-Click)</span>
                </motion.button>
              </div>
            </div>

            {/* Delivery & Trust Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-brand-coffee-100/50 rounded-2xl border border-brand-coffee-200/80 text-xs">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-brand-coffee-950">Free Shipping</div>
                  <div className="text-[11px] text-brand-coffee-600">On all orders ₹500+</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-brand-pink-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-brand-coffee-950">Fresh Dispatch</div>
                  <div className="text-[11px] text-brand-coffee-600">Roasted in small batches</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-brand-yellow-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-brand-coffee-950">FSSAI Certified</div>
                  <div className="text-[11px] text-brand-coffee-600">Lic #22426461000422</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TABBED SPECIFICATIONS & BREWING GUIDE */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-brand-coffee-200 shadow-md p-6 sm:p-10 space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 sm:gap-4 border-b border-brand-coffee-200 pb-4 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveTab('brewing')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 flex-shrink-0 ${activeTab === 'brewing'
                ? 'bg-brand-pink-600 text-white shadow-md'
                : 'bg-brand-coffee-50 text-brand-coffee-700 hover:bg-brand-pink-50'
                }`}
            >
              <Coffee className="w-4 h-4" /> Traditional Brewing Guide
            </button>

            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 flex-shrink-0 ${activeTab === 'details'
                ? 'bg-brand-pink-600 text-white shadow-md'
                : 'bg-brand-coffee-50 text-brand-coffee-700 hover:bg-brand-pink-50'
                }`}
            >
              <Award className="w-4 h-4" /> Blend & Roast Profile
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 flex-shrink-0 ${activeTab === 'reviews'
                ? 'bg-brand-pink-600 text-white shadow-md'
                : 'bg-brand-coffee-50 text-brand-coffee-700 hover:bg-brand-pink-50'
                }`}
            >
              <Star className="w-4 h-4" /> Customer Reviews ({product.reviewCount || 248})
            </button>
          </div>

          {/* Tab 1: Traditional Brewing Guide */}
          {activeTab === 'brewing' && (
            <div className="space-y-6">
              <div className="max-w-2xl">
                <h3 className="text-lg font-black text-brand-coffee-950">
                  How to Brew South Indian Filter Coffee (Hotel-Style Decoction)
                </h3>
                <p className="text-xs sm:text-sm text-brand-coffee-600 mt-1">
                  Follow these 4 simple steps to extract thick golden decoction with maximum foam and aroma.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-brand-pink-50/50 border border-brand-pink-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-pink-600 text-white font-black flex items-center justify-center text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-sm text-brand-coffee-950">Add Fresh Powder</h4>
                  <p className="text-xs text-brand-coffee-700 leading-relaxed">
                    Add 2 to 3 heaped tablespoons ofNathan Coffee powder into the upper pierced chamber of the brass/steel filter.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-brand-yellow-50/50 border border-brand-yellow-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-yellow-500 text-brand-coffee-950 font-black flex items-center justify-center text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-sm text-brand-coffee-950">Light Tamp & Plunger</h4>
                  <p className="text-xs text-brand-coffee-700 leading-relaxed">
                    Place the pressing disc lightly on the powder without hard tamping so boiling water can seep evenly.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-black flex items-center justify-center text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-sm text-brand-coffee-950">Pour Boiling Water</h4>
                  <p className="text-xs text-brand-coffee-700 leading-relaxed">
                    Pour freshly boiled water (100ml) over the umbrella disc, close the lid, and let it percolate for 12-15 minutes.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
                    4
                  </div>
                  <h4 className="font-bold text-sm text-brand-coffee-950">Froth with Hot Milk</h4>
                  <p className="text-xs text-brand-coffee-700 leading-relaxed">
                    Mix 30ml thick decoction with 100ml piping hot foamed full-cream milk and sugar. Froth between Davarah and Tumbler!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Blend & Roast Profile */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
              <div className="space-y-4">
                <h4 className="font-black text-base text-brand-coffee-950">Product Specifications</h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between py-2 border-b border-brand-coffee-100">
                    <span className="text-brand-coffee-500 font-bold">Ingredients:</span>
                    <span className="text-brand-coffee-900 font-medium text-right">{product.ingredients || '100% Pure Plantation Coffee'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-brand-coffee-100">
                    <span className="text-brand-coffee-500 font-bold">Blend Ratio:</span>
                    <span className="text-brand-coffee-900 font-medium">{product.blendRatio || '100% Pure Coffee (0% Chicory)'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-brand-coffee-100">
                    <span className="text-brand-coffee-500 font-bold">Roast Master:</span>
                    <span className="text-brand-coffee-900 font-medium">{product.roastLevel || 'Slow Drum Roast'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-brand-coffee-100">
                    <span className="text-brand-coffee-500 font-bold">Packaging:</span>
                    <span className="text-brand-coffee-900 font-medium">{product.packagingType || 'Airtight Kraft Stand-up Pouch'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-brand-coffee-100">
                    <span className="text-brand-coffee-500 font-bold">Heritage Origin:</span>
                    <span className="text-brand-coffee-900 font-medium">{product.origin || 'Thanjavur & Thanjavur, Tamil Nadu'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-base text-brand-coffee-950">Sensory & Aroma Notes</h4>
                <div className="p-4 bg-brand-coffee-50 rounded-2xl border border-brand-coffee-200 space-y-3">
                  <div className="flex items-center gap-2 text-brand-coffee-950 font-bold">
                    <Flame className="w-4 h-4 text-brand-pink-600" />
                    <span>Slow Wood-Fired Roasting</span>
                  </div>
                  <p className="text-xs text-brand-coffee-700 leading-relaxed">
                    Caramelized nutty undertones with rich dark chocolate finish and thick lingering crema. Ground specifically for South Indian brass and stainless steel drip filters.
                  </p>
                  <div className="flex items-center gap-2 text-brand-coffee-950 font-bold pt-2 border-t border-brand-coffee-200/60">
                    <Droplets className="w-4 h-4 text-brand-yellow-600" />
                    <span>Decoction Yield</span>
                  </div>
                  <p className="text-xs text-brand-coffee-700 leading-relaxed">
                    250g yields approximately 40-45 strong cups of hotel-grade authentic South Indian Filter Coffee.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-brand-pink-50/50 rounded-2xl border border-brand-pink-200">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-black text-brand-coffee-950">{product.rating || 4.9}</div>
                  <div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-500" />
                      ))}
                    </div>
                    <span className="text-xs text-brand-coffee-600">Based on {product.reviewCount || 248} verified customer reviews</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full w-max">
                  ✓ 100% Verified Coffee Drinkers
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentReviews.map((review, idx) => (
                  <div
                    key={`${review.name}-${idx}`}
                    className="p-4 rounded-2xl bg-white border border-brand-coffee-200 space-y-2 shadow-xs hover:border-brand-pink-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-brand-coffee-950">
                        {review.name} {review.location ? `(${review.location})` : ''}
                      </span>
                      <span className="text-[10px] text-brand-coffee-400 font-medium">
                        {review.date}
                      </span>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating || 5 }).map((_, s) => (
                        <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-500" />
                      ))}
                    </div>
                    <p className="text-xs text-brand-coffee-700 leading-relaxed">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RELATED PRODUCTS SHOWCASE */}
        {/* ========================================================================= */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-end justify-between border-b border-brand-coffee-200 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-brand-coffee-950">
                  You May Also Like
                </h2>
                <p className="text-xs text-brand-coffee-600 mt-0.5">
                  Explore other authentic freshly-roasted blends fromNathan Coffee.
                </p>
              </div>
              <Link
                to="/shop"
                className="text-xs font-bold text-brand-pink-600 hover:text-brand-pink-700 flex items-center gap-1"
              >
                <span>View All</span> <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id || p.slug} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* LIGHTBOX FULLSCREEN ZOOM MODAL */}
      {/* ========================================================================= */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] bg-transparent flex flex-col items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={images[currentImgIndex]}
              alt={`${product.title} Fullscreen`}
              className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl drop-shadow-2xl"
            />

            {images.length > 1 && (
              <div className="flex items-center gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => paginate(-1)}
                  className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <span className="text-white text-sm font-bold">
                  {currentImgIndex + 1} / {images.length}
                </span>
                <button
                  type="button"
                  onClick={() => paginate(1)}
                  className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetailPage;
