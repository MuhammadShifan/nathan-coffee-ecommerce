import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Zap, Star, Sparkles, Eye, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isUserAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();

  // Find default or first variant
  const [selectedWeight, setSelectedWeight] = useState(
    product.selectedWeight || (product.variants && product.variants[0]?.weight) || '250g'
  );
  const [isHovered, setIsHovered] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const currentVariant = product.variants?.find((v) => v.weight === selectedWeight) || {
    weight: selectedWeight,
    price: product.price || 299,
    mrp: product.mrp || 340,
    inStock: true,
  };

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map((img) => (typeof img === 'object' && img?.url ? img.url : img)).filter(Boolean)
    : [product.image || '/images/250g front.png'];

  const hasMultipleImages = images.length > 1;
  const primaryImage = images[0] || '/images/250g front.png';
  const secondaryImage = images[1] || primaryImage;

  const discountPercent = currentVariant.mrp > currentVariant.price
    ? Math.round(((currentVariant.mrp - currentVariant.price) / currentVariant.mrp) * 100)
    : 0;

  const handleCardClick = () => {
    navigate(`/product/${product.slug || product._id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, selectedWeight, 1, true);
    setTimeout(() => setIsAdding(false), 600);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    addToCart(product, selectedWeight, 1, false);
    if (!isUserAuthenticated) {
      openAuthModal(() => {
        navigate('/checkout');
      });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveImageIndex(null);
      }}
      onClick={handleCardClick}
      className="bg-white rounded-3xl border border-brand-coffee-200/80 hover:border-brand-pink-400/80 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group relative cursor-pointer"
    >
      {/* Discount & Purity Badges */}
      <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-1.5 pointer-events-none">
        {discountPercent > 0 && (
          <span className="bg-brand-pink-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md tracking-wide">
            SAVE {discountPercent}%
          </span>
        )}
        <span className="bg-brand-yellow-400 text-brand-coffee-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 border border-brand-yellow-500">
          <Sparkles className="w-2.5 h-2.5" /> 100% PURE
        </span>
      </div>

      <div className="absolute top-3.5 right-3.5 z-20 pointer-events-none">
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          In Stock
        </span>
      </div>

      {/* Product Image Section with Smooth Hover Fade & Slide Transition */}
      <div className="relative pt-6 px-6 pb-4 bg-gradient-to-b from-brand-coffee-50/60 to-white flex items-center justify-center min-h-[230px] sm:min-h-[270px] overflow-hidden select-none">
        {/* If manual pip index selected, show that specific image */}
        {activeImageIndex !== null ? (
          <img
            src={images[activeImageIndex] || primaryImage}
            alt={`${product.title} - View ${activeImageIndex + 1}`}
            className="max-h-48 sm:max-h-60 w-auto object-contain transition-all duration-500 transform scale-105 drop-shadow-md"
          />
        ) : (
          /* Multi-image smooth dual-layer crossfade on hover */
          <div className="relative w-full h-48 sm:h-60 flex items-center justify-center">
            {/* Primary Image Layer */}
            <img
              src={primaryImage}
              alt={product.title}
              loading="lazy"
              decoding="async"
              className={`absolute max-h-full max-w-full object-contain drop-shadow-md transition-all duration-500 ease-out will-change-transform ${
                isHovered && hasMultipleImages
                  ? 'opacity-0 scale-95 -translate-y-2'
                  : 'opacity-100 scale-100 translate-y-0 group-hover:scale-105'
              }`}
              onError={(e) => {
                e.target.src = '/images/250g front.png';
              }}
            />

            {/* Secondary Image Layer (fades & slides smoothly into view on hover) */}
            {hasMultipleImages && (
              <img
                src={secondaryImage}
                alt={`${product.title} back pack packaging`}
                loading="lazy"
                decoding="async"
                className={`absolute max-h-full max-w-full object-contain drop-shadow-md transition-all duration-500 ease-out will-change-transform ${
                  isHovered
                    ? 'opacity-100 scale-105 translate-y-0'
                    : 'opacity-0 scale-90 translate-y-3 pointer-events-none'
                }`}
                onError={(e) => {
                  e.target.src = primaryImage;
                }}
              />
            )}
          </div>
        )}

        {/* Quick View Prompt Badge on Hover */}
        <div className="absolute inset-x-0 bottom-8 flex justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <span className="bg-brand-coffee-950/80 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-brand-yellow-400" /> Click for 360° Carousel
          </span>
        </div>

        {/* Interactive Thumbnail Pips */}
        {hasMultipleImages && (
          <div className="absolute bottom-2.5 inset-x-0 flex justify-center gap-1.5 z-20">
            {images.map((_, idx) => {
              const isCurrent =
                activeImageIndex !== null
                  ? activeImageIndex === idx
                  : isHovered
                  ? idx === 1
                  : idx === 0;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCurrent
                      ? 'bg-brand-pink-600 w-5 shadow-xs'
                      : 'bg-brand-coffee-300 hover:bg-brand-pink-300 w-2'
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5 sm:space-y-4">
        <div>
          {/* Rating and Reviews */}
          <div className="flex items-center justify-between text-xs text-brand-coffee-600 mb-1">
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-amber-900 font-bold text-[11px]">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span>{product.rating || '4.9'}</span>
              <span className="text-brand-coffee-400 font-normal">({product.reviewCount || '148'})</span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-brand-coffee-500 uppercase tracking-wider">
              {product.roastLevel || 'Slow Drum Roast'}
            </span>
          </div>

          {/* Title & Tamil Subtitle */}
          <h3 className="font-bold text-base sm:text-lg text-brand-coffee-950 leading-snug group-hover:text-brand-pink-700 transition-colors">
            {product.title}
          </h3>
          {product.tamilTitle && (
            <p className="text-[11px] sm:text-xs text-brand-coffee-600 font-tamil mt-0.5 font-medium">
              {product.tamilTitle}
            </p>
          )}

          {/* Short Description */}
          <p className="text-xs text-brand-coffee-700 mt-1.5 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Weight Variant Selector */}
          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-brand-coffee-100">
            <label className="text-[10px] sm:text-[11px] font-bold text-brand-coffee-700 uppercase tracking-wider block mb-1.5">
              Select Pack Size:
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWeight(variant.weight);
                    }}
                    className={`py-1.5 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all border text-center ${
                      isSelected
                        ? 'bg-brand-pink-600 text-white border-brand-pink-600 shadow-sm ring-2 ring-brand-yellow-400'
                        : 'bg-brand-coffee-50 text-brand-coffee-800 border-brand-coffee-200 hover:border-brand-pink-300'
                    }`}
                  >
                    <div className="truncate">{variant.weight}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-brand-yellow-300' : 'text-brand-pink-600'}`}>
                      ₹{variant.price}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pricing & CTA Buttons */}
        <div className="pt-2 border-t border-brand-coffee-100" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-baseline justify-between mb-2.5 sm:mb-3">
            <div>
              <span className="text-xl sm:text-2xl font-extrabold text-brand-coffee-950">
                ₹{currentVariant.price}
              </span>
              {currentVariant.mrp > currentVariant.price && (
                <span className="ml-1.5 sm:ml-2 text-xs text-brand-coffee-400 line-through">
                  ₹{currentVariant.mrp}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Tax Included
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleAddToCart}
              className={`w-full py-2.5 px-1 sm:px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 sm:gap-1.5 border transition-all ${
                isAdding
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-brand-pink-50 hover:bg-brand-pink-100 text-brand-pink-700 border-brand-pink-300'
              }`}
            >
              {isAdding ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" /> <span className="truncate">Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" /> <span className="truncate">Add to Cart</span>
                </>
              )}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleBuyNow}
              className="w-full py-2.5 px-1 sm:px-2 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 text-white rounded-xl font-bold text-xs shadow-md shadow-brand-pink-600/25 flex items-center justify-center gap-1 sm:gap-1.5 transition-all btn-shimmer"
            >
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-yellow-400 fill-brand-yellow-400 flex-shrink-0" />
              <span>Buy Now</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;
