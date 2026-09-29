import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Flame,
  Award,
  Truck,
  Coffee,
  CheckCircle2,
  Star,
  BookOpen,
  MapPin,
  ChevronRight,
  Heart,
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SEOMeta from '../components/SEOMeta';
import BrewingGuideModal from '../components/BrewingGuideModal';
import { defaultProductsData } from '../data/defaultProducts';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brewingGuideOpen, setBrewingGuideOpen] = useState(false);
  const navigate = useNavigate();

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
        console.warn('Using default products due to API connect:', err.message);
        setProducts(defaultProductsData);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <>
      <SEOMeta
        title="Pure & Fresh Filter Coffee Powder from Thanjavur |Nathan Coffee"
        description="Buy 100% Pure South Indian Filter Coffee Powder Online fromNathan Coffee Mart. Freshly roasted in Thanjavur and Thanjavur. Slow drum roast with intense aroma in 250g, 500g, 1kg packs with fast delivery across India."
        keywords="coffee powder,Nathan coffee, nathan coffee,Nathan coffee mart, filter coffee powder, buy filter coffee powder online, Thanjavur coffee powder, thanjavur coffee powder, pure coffee powder, degree coffee powder, kumbakonam degree coffee powder, best coffee powder in tamil nadu"
        canonicalUrl="https://Nathancoffee.com"
        ogImage="/images/hero-coffee.jpg"
        includeLocalBusiness={true}
        includeFAQ={true}
      />

      <div className="space-y-12 sm:space-y-20 lg:space-y-24 pb-16 w-full overflow-hidden">
        {/* ========================================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-pink-50/70 via-white to-brand-coffee-50 pt-6 sm:pt-12 lg:pt-14 pb-12 sm:pb-16 border-b border-brand-coffee-200/60 w-full">
          {/* Subtle Ambient Brand Glow */}
          <div className="absolute top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-brand-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-72 sm:w-96 h-72 sm:h-96 bg-brand-yellow-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
              {/* Hero Left Content */}
              <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left w-full">
                {/* Vintage Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 bg-brand-pink-100/90 border border-brand-pink-300 text-brand-pink-800 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-bold shadow-xs max-w-full flex-wrap justify-center"
                >
                  <span className="w-2 h-2 rounded-full bg-brand-pink-600 animate-ping flex-shrink-0" />
                  <span className="uppercase tracking-wide font-extrabold text-[10px] sm:text-[11px]">
                    Authentic South Indian Filter Coffee
                  </span>
                  <span className="text-brand-pink-400 hidden xs:inline">•</span>
                  <span className="font-tamil font-bold text-brand-pink-900 text-[11px] sm:text-xs">
                    1950 முதல் பாரம்பரிய சுவை
                  </span>
                </motion.div>

                {/* H1 Tag for Aggressive SEO */}
                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-extrabold text-brand-coffee-950 tracking-tight leading-[1.15]"
                >
                  Pure & Fresh Filter{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 underline decoration-brand-yellow-400 decoration-4 underline-offset-4 sm:underline-offset-8">
                    Coffee Powder
                  </span>{' '}
                  from Thanjavur
                </motion.h1>

                {/* Sub-heading & Tamil Slogan */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2 text-brand-coffee-800"
                >
                  <p className="text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    Handcrafted from 100% natural, slow wood-fired drum roasted plantation beans. Experience the velvety golden decoction and heavenly traditional aroma that defines genuine Tamil Nadu filter coffee.
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-brand-pink-700 font-tamil">
                    நூற்றுக்கு நூறு சுத்தமானது • அடர்ந்த டிக்காஷன் • கலப்படமில்லாத நறுமணம்
                  </p>
                </motion.div>

                {/* CTA Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-2 w-full"
                >
                  <Link
                    id="hero-explore-products-btn"
                    to="/shop"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 text-white rounded-2xl font-extrabold text-xs sm:text-sm shadow-xl shadow-brand-pink-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] border border-brand-pink-500 ring-2 ring-brand-yellow-400/60 btn-shimmer"
                  >
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Explore Products</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    id="hero-buy-now-btn"
                    to="/checkout"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-brand-yellow-400 hover:bg-brand-yellow-500 text-brand-coffee-950 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 border border-brand-yellow-500"
                  >
                    <span>⚡ Buy Now (Express Order)</span>
                  </Link>

                  <button
                    onClick={() => setBrewingGuideOpen(true)}
                    className="w-full sm:w-auto px-5 py-3 sm:py-3.5 bg-white/90 hover:bg-white text-brand-coffee-800 rounded-2xl font-bold text-xs shadow-sm border border-brand-coffee-200 hover:border-brand-pink-300 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <BookOpen className="w-4 h-4 text-brand-pink-600" />
                    <span>Brewing Guide</span>
                  </button>
                </motion.div>

                {/* Trust Highlights Grid */}
                <div className="pt-5 sm:pt-6 border-t border-brand-coffee-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-left">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-[11px] sm:text-xs font-bold text-brand-coffee-900">100% Pure Coffee</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-[11px] sm:text-xs font-bold text-brand-coffee-900">FSSAI Certified</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-[11px] sm:text-xs font-bold text-brand-coffee-900">Slow Drum Roast</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-[11px] sm:text-xs font-bold text-brand-coffee-900">Fresh Dispatch</span>
                  </div>
                </div>
              </div>

              {/* Hero Right Visuals */}
              <div className="lg:col-span-5 relative w-full">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-none"
                >
                  {/* Decorative Frame */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-4 ring-brand-pink-500/20 bg-brand-coffee-950 w-full">
                    <img
                      src="/images/hero-coffee.jpg"
                      alt="Traditional South Indian Filter Coffee Davarah and Tumbler with Golden Crema"
                      className="w-full h-[280px] xs:h-[340px] sm:h-[400px] md:h-[420px] object-cover hover:scale-105 transition-transform duration-700"
                      width="600"
                      height="420"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-coffee-950/80 via-transparent to-transparent" />

                    {/* Floating Authentic Pack Badge */}
                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 bg-white/95 backdrop-blur-md p-2.5 sm:p-3.5 rounded-2xl border border-white/60 shadow-lg flex items-center gap-2.5 sm:gap-3">
                      <img
                        src="/images/250g front.png"
                        alt="Nathan 250g Coffee Powder Pack"
                        className="h-11 sm:h-14 w-auto object-contain flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-brand-pink-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                            Top Seller
                          </span>
                          <span className="text-xs font-extrabold text-brand-coffee-950 truncate">Pure Filter Blend</span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-brand-coffee-700 truncate">₹299 for 250g Kraft Zip Pack</p>
                      </div>
                      <Link
                        to="/shop"
                        className="p-2 bg-brand-pink-600 hover:bg-brand-pink-700 text-white rounded-xl shadow transition-transform active:scale-95 flex-shrink-0"
                        aria-label="Order now"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Stamp Badge */}
                  <div className="absolute -top-3 sm:-top-4 -right-2 sm:-right-4 bg-brand-yellow-400 text-brand-coffee-950 p-2.5 sm:p-3 rounded-2xl shadow-xl border-2 border-white ring-2 ring-brand-yellow-500 font-extrabold text-xs text-center rotate-6">
                    <p className="font-black text-xs sm:text-sm">₹299</p>
                    <p className="text-[9px] sm:text-[10px] uppercase font-bold">Starting Price</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FEATURED PRODUCTS SECTION */}
        {/* ========================================================================= */}
        <section id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-brand-pink-100 text-brand-pink-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-pink-600" />
              <span>Direct From Our Thanjavur & Thanjavur Mills</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-coffee-950 tracking-tight">
              Featured Filter Coffee Powder Range
            </h2>
            <p className="text-xs sm:text-base text-brand-coffee-700">
              Select your favorite roast and pack size. Available in standard 250g, 500g and 1kg sizes with airtight packaging for locked-in freshness.
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
            {products.map((product) => (
              <ProductCard key={product._id || product.slug} product={product} />
            ))}
          </div>

          {/* Value Callout Banner */}
          <div className="mt-8 sm:mt-12 p-5 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-coffee-950 via-brand-coffee-900 to-brand-pink-950 text-white border-2 border-brand-pink-600/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 w-full">
            <div className="space-y-2 text-center md:text-left">
              <span className="bg-brand-yellow-400 text-brand-coffee-950 text-xs font-black px-2.5 py-1 rounded-full uppercase">
                Free Shipping Special
              </span>
              <h3 className="text-lg sm:text-2xl font-bold">
                Order 2 or More Packs & Get FREE Home Delivery Across India!
              </h3>
              <p className="text-xs sm:text-sm text-brand-coffee-200">
                Freshly roasted in small batches and dispatched directly within 24 hours.
              </p>
            </div>
            <Link
              to="/shop"
              className="w-full md:w-auto text-center px-8 py-3.5 bg-brand-yellow-400 hover:bg-brand-yellow-500 text-brand-coffee-950 font-black text-sm rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 flex-shrink-0"
            >
              Order Combo Now
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* WHY CHOOSE US / VALUE PROPOSITION */}
        {/* ========================================================================= */}
        <section className="bg-brand-coffee-100/60 py-12 sm:py-16 lg:py-20 border-y border-brand-coffee-200/80 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-2.5 sm:space-y-3">
              <span className="text-[11px] sm:text-xs font-extrabold text-brand-pink-600 uppercase tracking-widest bg-brand-pink-50 px-3 py-1 rounded-full border border-brand-pink-200">
                The Nathan Difference
              </span>
              <div className="flex items-center justify-center gap-3 flex-wrap sm:flex-nowrap">
                <div className="relative overflow-hidden rounded-xl border-2 border-brand-pink-500 shadow-sm bg-brand-pink-600 p-0.5 flex-shrink-0">
                  <picture>
                    <source srcSet="/images/logo.avif" type="image/avif" />
                    <img
                      src="/images/logo.jpeg"
                      alt="Nathan Coffee Mart Logo"
                      className="h-8 sm:h-10 w-auto object-contain bg-white rounded-lg"
                      width="100"
                      height="32"
                    />
                  </picture>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-coffee-950 text-center">
                  Why Coffee Lovers Choose Nathan Coffee
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-brand-coffee-700 max-w-2xl mx-auto">
                Our legacy rests on three unwavering promises: 100% purity, traditional wood roasting, and direct plantation sourcing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full">
              {/* Feature 1 */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-coffee-200 shadow-md hover:shadow-xl hover:border-brand-pink-300 transition-all space-y-3.5 sm:space-y-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-pink-50 border border-brand-pink-200 flex items-center justify-center text-brand-pink-600 shadow-inner">
                  <Award className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-brand-coffee-950">100% Pure Coffee Beans</h3>
                <p className="text-xs sm:text-sm text-brand-coffee-700 leading-relaxed">
                  We hand-sort shade-grown Arabica and Robusta beans from high-altitude estates of Tamil Nadu. No cheap fillers, zero artificial aromas, and zero compromise on purity.
                </p>
                <div className="text-xs font-bold text-brand-pink-700 flex items-center gap-1">
                  <span>Certified FSSAI Purity</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-coffee-200 shadow-md hover:shadow-xl hover:border-brand-pink-300 transition-all space-y-3.5 sm:space-y-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-yellow-50 border border-brand-yellow-300 flex items-center justify-center text-brand-yellow-600 shadow-inner">
                  <Flame className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-brand-coffee-950">Rich Aroma & Thick Decoction</h3>
                <p className="text-xs sm:text-sm text-brand-coffee-700 leading-relaxed">
                  Our slow drum roast unlocks the deep natural oils of the coffee bean, yielding a thick, frothy, bittersweet decoction that doesn't go watery when mixed with milk.
                </p>
                <div className="text-xs font-bold text-brand-coffee-800 flex items-center gap-1 font-tamil">
                  <span>அடர்ந்த டிக்காஷன் உத்தரவாதம்</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-coffee-200 shadow-md hover:shadow-xl hover:border-brand-pink-300 transition-all space-y-3.5 sm:space-y-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-inner">
                  <Truck className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-brand-coffee-950">Fresh Batch Fast Dispatch</h3>
                <p className="text-xs sm:text-sm text-brand-coffee-700 leading-relaxed">
                  Every order is freshly packed in airtight multi-layer zip-lock kraft pouches and dispatched directly from our Thanjavur and Thanjavur roasteries to your doorstep.
                </p>
                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <span>Shipped within 24 Hours</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* HERITAGE TEASER SECTION */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="bg-white rounded-3xl border-2 border-brand-pink-100 p-6 sm:p-10 lg:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center w-full">
            <div className="lg:col-span-5 flex justify-center w-full">
              <div className="relative max-w-full">
                <div className="w-56 sm:w-72 max-w-full rounded-3xl overflow-hidden border-4 border-brand-yellow-400 shadow-2xl ring-4 sm:ring-8 ring-brand-pink-50 bg-brand-coffee-900 mx-auto">
                  <img
                    src="/images/grandfather photo.jpg"
                    alt="Beloved Founder Grandfather ofNathan Coffee Mart"
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 inset-x-0 mx-auto w-max max-w-[90%] bg-brand-pink-600 text-white text-[11px] sm:text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg border border-white flex items-center justify-center gap-1.5 truncate">
                  <Award className="w-3.5 h-3.5 text-brand-yellow-400 flex-shrink-0" />
                  <span className="truncate">Founder Grandfather • Since 1950s</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left w-full">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-pink-600 bg-brand-pink-50 px-3 py-1 rounded-full border border-brand-pink-200">
                Our Roots in Thanjavur & Thanjavur
              </span>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-brand-coffee-950 leading-tight">
                "Quality over quantity is the true essence of great coffee."
              </h2>
              <p className="text-xs sm:text-sm text-brand-coffee-700 leading-relaxed">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat commodi suscipit, eum in consectetur soluta, quod reprehenderit cupiditate aliquid beatae totam excepturi maxime esse vel fugiat repellat cumque! Quidem, dolor sit modi quam consequuntur est commodi nisi placeat unde earum sint officiis, veritatis omnis reprehenderit quasi adipisci eveniet minus quae provident nam voluptas distinctio, doloribus libero. Praesentium fuga soluta voluptate, ex porro inventore omnis nesciunt quae alias odit aliquam nulla consequatur molestias laboriosam cumque saepe pariatur vel est ipsum suscipit veniam? Accusamus perferendis cupiditate dolorem voluptatibus magni voluptatem minima rerum, aliquid quas placeat possimus necessitatibus nisi dignissimos, magnam ab provident quis. Pariatur hic nihil, praesentium eos excepturi molestias debitis nostrum nulla nisi incidunt dolores quas culpa recusandae aperiam ducimus corporis facilis. Cupiditate laboriosam unde veritatis maxime aliquam sed ad reprehenderit possimus deleniti cumque! Consectetur cum tenetur repellendus rerum soluta, amet quae recusandae nostrum ipsa aut et totam autem cupiditate quidem vel nesciunt, ex commodi assumenda molestiae velit molestias error veritatis? Mollitia perspiciatis nisi fugiat assumenda expedita harum suscipit sint reiciendis id ullam, animi illo eum fugit in, aperiam quia at quibusdam accusamus modi, maiores natus libero debitis ut? Quas natus molestiae velit laboriosam rem dolores magni. Minus porro aut vitae.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 w-full">
                <Link
                  to="/about"
                  className="w-full sm:w-auto text-center px-6 py-3.5 bg-brand-pink-600 hover:bg-brand-pink-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Read Our Full Story & Heritage</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/shop"
                  className="w-full sm:w-auto text-center px-6 py-3.5 bg-brand-coffee-100 hover:bg-brand-coffee-200 text-brand-coffee-900 font-bold text-xs rounded-xl transition-all"
                >
                  Experience the Taste - Shop Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CUSTOMER REVIEWS */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-coffee-950">
              Loved by Filter Coffee Enthusiasts
            </h2>
            <p className="text-xs sm:text-sm text-brand-coffee-600">
              Real feedback from customers across Thanjavur, Coimbatore, Chennai, and Bangalore.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
            <div className="p-5 sm:p-6 bg-white rounded-2xl border border-brand-coffee-200 shadow-sm space-y-3">
              <div className="flex text-amber-400">
                {'★★★★★'.split('').map((s, i) => (
                  <span key={i} className="text-base">{s}</span>
                ))}
              </div>
              <p className="text-xs text-brand-coffee-700 leading-relaxed">
                "The decoction is extraordinarily thick and fragrant. Reminds me of our grandmother's filter coffee in Thanjavur. Best pure coffee powder I have ordered online."
              </p>
              <div className="pt-2 border-t border-brand-coffee-100 flex items-center justify-between text-xs">
                <span className="font-bold text-brand-coffee-950">Dr. K. Swaminathan</span>
                <span className="text-brand-coffee-400">Thanjavur</span>
              </div>
            </div>

            <div className="p-5 sm:p-6 bg-white rounded-2xl border border-brand-coffee-200 shadow-sm space-y-3">
              <div className="flex text-amber-400">
                {'★★★★★'.split('').map((s, i) => (
                  <span key={i} className="text-base">{s}</span>
                ))}
              </div>
              <p className="text-xs text-brand-coffee-700 leading-relaxed">
                "The 500g kraft pouch maintains its fresh aroma till the last scoop! Fast delivery to Chennai in 2 days. The 80:20 chicory blend is pure hotel-grade filter coffee."
              </p>
              <div className="pt-2 border-t border-brand-coffee-100 flex items-center justify-between text-xs">
                <span className="font-bold text-brand-coffee-950">Priya Meenakshi</span>
                <span className="text-brand-coffee-400">Chennai</span>
              </div>
            </div>

            <div className="p-5 sm:p-6 bg-white rounded-2xl border border-brand-coffee-200 shadow-sm space-y-3 sm:col-span-2 lg:col-span-1">
              <div className="flex text-amber-400">
                {'★★★★★'.split('').map((s, i) => (
                  <span key={i} className="text-base">{s}</span>
                ))}
              </div>
              <p className="text-xs text-brand-coffee-700 leading-relaxed">
                "Genuine 100% pure filter coffee without bitter burnt aftertaste. The golden froth in the dabarah tumbler is unmatched. Highly recommended!"
              </p>
              <div className="pt-2 border-t border-brand-coffee-100 flex items-center justify-between text-xs">
                <span className="font-bold text-brand-coffee-950">Ramesh Chandran</span>
                <span className="text-brand-coffee-400">Bangalore</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* AGGRESSIVE SEO CONTENT BLOCK */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="bg-brand-coffee-100/50 rounded-3xl p-6 sm:p-8 border border-brand-coffee-200/80 space-y-3 sm:space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-brand-coffee-950 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-brand-pink-600 flex-shrink-0" />
              <span>About Nathan Coffee Mart — Pure South Indian Filter Coffee Powder Online</span>
            </h2>
            <div className="text-xs text-brand-coffee-700 leading-relaxed space-y-2.5">
              <p>
                Looking for the best <strong>coffee powder</strong> in Thanjavur, Thanjavur, or anywhere in Tamil Nadu? <strong>Nathan Coffee Mart</strong> (also known as <strong>Nathan Coffee</strong>) is your trusted traditional source for 100% pure filter coffee powder, handcrafted with decades of roasting heritage. Our filter coffee beans are handpicked from the verdant slopes of the Western Ghats and slow drum-roasted to bring out rich caramelized flavor notes and unmatched aroma.
              </p>
              <p>
                Whether you prefer <strong>100% Pure Coffee Powder (0% Chicory)</strong> for an authentic intense decoction or our signature <strong>80:20 Roasted French Chicory Coffee Blend</strong> for hotel-style frothy morning degree coffee,Nathan Coffee delivers fresh roast batches right to your door. Order 250g, 500g, or 1kg coffee packs online with secure Razorpay UPI / Card payments and fast all-India delivery.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Interactive Brewing Guide Modal */}
      <BrewingGuideModal
        isOpen={brewingGuideOpen}
        onClose={() => setBrewingGuideOpen(false)}
      />
    </>
  );
};

export default HomePage;
