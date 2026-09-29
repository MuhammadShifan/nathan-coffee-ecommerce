import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles, Filter, ShieldCheck, CheckCircle2, ChevronRight, Coffee, Truck } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SEOMeta from '../components/SEOMeta';
import { defaultProductsData } from '../data/defaultProducts';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/api/products');
        if (res.data.success && res.data.data?.length > 0) {
          setProducts(res.data.data);
        } else {
          setProducts(defaultProductsData);
        }
      } catch (err) {
        console.warn('Using default products on shop page:', err.message);
        setProducts(defaultProductsData);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = products.filter((p) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'pure_coffee') return p.category === 'pure_coffee';
    if (activeCategory === 'chicory_blend') return p.category === 'chicory_blend';
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.variants?.[0]?.price || a.price || 0;
    const priceB = b.variants?.[0]?.price || b.price || 0;
    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Products & Shop', url: '/shop' },
  ];

  return (
    <>
      <SEOMeta
        title="Buy Pure Filter Coffee Powder Online -Nathan Coffee"
        description="Shop fresh authentic South Indian filter coffee powder online fromNathan Coffee Mart. Available in 250g, 500g, 1kg packs. 100% Pure & Chicory Blends roasted in Thanjavur & Thanjavur. Fast shipping across India."
        keywords="buy pure filter coffee powder online,Nathan coffee shop, filter coffee 250g, filter coffee 500g, pure coffee powder buy online, nathan coffee shop, Thanjavur filter coffee order, chicory coffee powder buy"
        canonicalUrl="https://nadhancoffee.com/shop"
        breadcrumbs={breadcrumbs}
        includeLocalBusiness={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12 space-y-8 sm:space-y-10 w-full overflow-hidden">
        {/* ========================================================================= */}
        {/* HEADER & BREADCRUMBS */}
        {/* ========================================================================= */}
        <div className="space-y-3 sm:space-y-4">
          {/* Breadcrumbs Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-brand-coffee-600 flex-wrap">
            <Link to="/" className="hover:text-brand-pink-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-brand-coffee-400" />
            <span className="text-brand-pink-600 font-bold">Products & Shop</span>
          </nav>

          {/* H1 Tag for SEO */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 sm:pb-6 border-b border-brand-coffee-200">
            <div>
              <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-brand-coffee-950 tracking-tight">
                Buy Pure Filter Coffee Powder Online -{' '}
                <span className="text-brand-pink-600">Nadhan Coffee</span>
              </h1>
              <p className="text-xs sm:text-sm text-brand-coffee-700 mt-1 max-w-2xl">
                Freshly ground and packed in airtight ziplock kraft pouches to lock in original aroma. Choose from 100% Pure Filter Coffee or Traditional Chicory blends.
              </p>
            </div>

            {/* Fast Dispatch Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-2xl text-xs font-bold shadow-xs flex-shrink-0 self-start md:self-auto">
              <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Free Express Delivery on ₹500+</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FILTER & SORT CONTROLS */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 sm:gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-brand-coffee-200 shadow-sm w-full">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === 'all'
                  ? 'bg-brand-pink-600 text-white shadow-sm'
                  : 'bg-brand-coffee-50 text-brand-coffee-700 hover:bg-brand-pink-50'
                }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setActiveCategory('pure_coffee')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === 'pure_coffee'
                  ? 'bg-brand-pink-600 text-white shadow-sm'
                  : 'bg-brand-coffee-50 text-brand-coffee-700 hover:bg-brand-pink-50'
                }`}
            >
              100% Pure Coffee
            </button>
            <button
              onClick={() => setActiveCategory('chicory_blend')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === 'chicory_blend'
                  ? 'bg-brand-pink-600 text-white shadow-sm'
                  : 'bg-brand-coffee-50 text-brand-coffee-700 hover:bg-brand-pink-50'
                }`}
            >
              Chicory Blends (80:20)
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-coffee-100">
            <span className="text-xs font-bold text-brand-coffee-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-brand-coffee-50 border border-brand-coffee-200 text-brand-coffee-900 text-xs font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none"
            >
              <option value="featured">Featured / Best Match</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRODUCT GRID */}
        {/* ========================================================================= */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl p-6 border border-brand-coffee-100 shadow-sm animate-pulse space-y-4"
              >
                <div className="h-60 bg-brand-coffee-100 rounded-2xl" />
                <div className="h-4 bg-brand-coffee-100 rounded w-3/4" />
                <div className="h-3 bg-brand-coffee-100 rounded w-1/2" />
                <div className="h-10 bg-brand-coffee-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
            {sortedProducts.map((product) => (
              <ProductCard key={product._id || product.slug} product={product} />
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TRUST & PURITY BANNER */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-brand-pink-600 via-brand-pink-700 to-brand-coffee-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-brand-yellow-400/40 w-full">
          <div className="space-y-2 text-center md:text-left">
            <span className="bg-brand-yellow-400 text-brand-coffee-950 font-black text-xs uppercase px-2.5 py-1 rounded-full">
              FSSAI Lic. No: 22426461000422
            </span>
            <h2 className="text-lg sm:text-2xl font-extrabold">
              100% Traditional Slow Wood-Fired Drum Roast Guarantee
            </h2>
            <p className="text-xs sm:text-sm text-brand-pink-100 max-w-xl">
              Every pack ofNathan Coffee is sealed fresh directly after grinding to ensure zero loss of essential aroma and natural coffee oils.
            </p>
          </div>

          <Link
            to="/contact"
            className="w-full md:w-auto text-center px-6 py-3.5 bg-brand-yellow-400 hover:bg-brand-yellow-500 text-brand-coffee-950 font-black text-xs rounded-xl shadow-md transition-all flex-shrink-0"
          >
            Looking for Bulk Wholesale? Contact Us
          </Link>
        </div>
      </div>
    </>
  );
};

export default ShopPage;
