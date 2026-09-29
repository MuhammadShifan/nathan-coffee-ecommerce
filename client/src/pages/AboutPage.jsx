import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Heart,
  Coffee,
  Flame,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import SEOMeta from '../components/SEOMeta';

const AboutPage = () => {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Our Heritage', url: '/about' },
  ];

  const timelineMilestones = [
    {
      year: '1950s',
      title: 'The Humble Roastery at South Street, Thanjavur',
      description:
        'Our beloved Grandfather establishedNathan Coffee (Nathan Coffee) at 2928, South Street near Canara Bank in Thanjavur. Roasting small batches over seasoned wood fires, the intoxicating aroma drew coffee connoisseurs from all across the delta region.',
    },
    {
      year: '1985',
      title: 'Perfecting the Pure Decoction Yield',
      description:
        'Pioneered our signature Arabica-Robusta selection ratio and specialized grind calibration, ensuring each spoonful creates an exceptionally dense, non-bitter decoction ideal for brass filter brewing.',
    },
    {
      year: '2012',
      title: 'Expanding Roastery Operations to Coimbatore',
      description:
        'To meet burgeoning demand from coffee lovers across western Tamil Nadu, we established our modern roastery hub in Coimbatore while strictly maintaining our artisanal, slow-roast heritage.',
    },
    {
      year: '2026',
      title: 'Pan-India Online Store & Fresh Dispatch',
      description:
        'LaunchedNathan Coffee Mart Online with high-barrier zip-lock kraft pouches, delivering 100% pure filter coffee fresh from our Coimbatore and Thanjavur roasteries to homes across all of India.',
    },
  ];

  return (
    <>
      <SEOMeta
        title="Our Legacy & Heritage -Nathan Coffee | Authentic South Indian Roasters"
        description="Discover the 70+ year legacy ofNathan Coffee Mart. Founded by our beloved Grandfather in Thanjavur and expanded to Coimbatore. Dedicated to 100% pure filter coffee roasting with zero artificial additives."
        keywords="nadhan coffee legacy, nathan coffee history, thanjavur filter coffee grandfather, authentic coimbatore coffee roasters, pure filter coffee heritage tamil nadu"
        canonicalUrl="https://nadhancoffee.com/about"
        breadcrumbs={breadcrumbs}
        includeLocalBusiness={true}
      />

      <div className="space-y-12 sm:space-y-20 lg:space-y-24 pb-16 w-full overflow-hidden">
        {/* ========================================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-b from-brand-pink-50 via-white to-brand-coffee-50 pt-8 sm:pt-12 pb-12 sm:pb-16 border-b border-brand-coffee-200/60 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3.5 sm:space-y-4 w-full">
            <div className="inline-flex items-center gap-1.5 bg-brand-pink-100 text-brand-pink-800 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-pink-600" />
              <span>Generations of Authentic Coffee Passion</span>
            </div>

            {/* H1 Tag for SEO */}
            <h1 className="text-2xl xs:text-3xl sm:text-5xl font-extrabold text-brand-coffee-950 tracking-tight max-w-4xl mx-auto">
              Our Legacy & Heritage - <span className="text-brand-pink-600">Nadhan Coffee</span>
            </h1>

            <p className="text-xs sm:text-base text-brand-coffee-700 max-w-2xl mx-auto leading-relaxed">
              For over seven decades,Nathan Coffee has been more than a roastery—it is an enduring devotion to the sacred ritual of authentic South Indian filter coffee.
            </p>
            <p className="text-xs sm:text-sm font-semibold text-brand-pink-700 font-tamil">
              பாரம்பரியமும் சுத்தமும் இணைந்த நாடன் காப்பியின் 70 ஆண்டுகால வரலாறு
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* LEGACY & GRANDFATHER SECTION */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="bg-white rounded-3xl border-2 border-brand-pink-100 shadow-2xl p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center w-full">
            {/* Grandfather Photo Container */}
            <div className="lg:col-span-5 flex flex-col items-center w-full">
              <div className="relative group max-w-full">
                <div className="w-60 sm:w-80 max-w-full rounded-3xl overflow-hidden border-4 border-brand-yellow-400 shadow-2xl ring-4 sm:ring-8 ring-brand-pink-100 bg-brand-coffee-950 transition-transform duration-500 group-hover:scale-105 mx-auto">
                  <img
                    src="/images/grandfather photo.jpg"
                    alt="Founder Grandfather ofNathan Coffee Mart"
                    className="w-full h-auto object-cover"
                    width="400"
                    height="470"
                  />
                </div>

                {/* Seal Badge */}
                <div className="absolute -top-3 -right-2 sm:-right-3 bg-brand-pink-600 text-white p-2.5 sm:p-3 rounded-2xl shadow-xl border-2 border-white ring-2 ring-brand-yellow-400 rotate-6 flex items-center gap-1 text-[11px] sm:text-xs font-black">
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-yellow-400" />
                  <span>EST. 1950</span>
                </div>
              </div>

              {/* Caption */}
              <div className="mt-5 sm:mt-6 text-center max-w-xs">
                <p className="text-xs font-bold text-brand-coffee-950 leading-relaxed">
                  Founded by our beloved Grandfather on South Street, Thanjavur.
                </p>
                <p className="text-[11px] text-brand-coffee-600 font-medium font-tamil mt-1">
                  நமது அன்பிற்குரிய தாத்தாவால் உருவாக்கப்பட்ட நாடன் காப்பி மார்ட்
                </p>
              </div>
            </div>

            {/* Story & Sacred Quote */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left w-full">
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-brand-pink-600 bg-brand-pink-50 px-3 py-1 rounded-full border border-brand-pink-200">
                The Heritage Story
              </span>

              <h2 className="text-xl sm:text-3xl font-extrabold text-brand-coffee-950 leading-tight">
                Carrying Forward a Sacred Standard of Purity & Slow Roasting
              </h2>

              <p className="text-xs sm:text-sm text-brand-coffee-800 leading-relaxed">
                In the early 1950s, amidst the vibrant temple bells and cultural tapestry of Thanjavur, our beloved Grandfather ignited his first charcoal-fired drum roaster. While others cut corners with excessive chicory and artificial darkeners, his philosophy remained unwavering: <em>use only the purest highland beans, roast them patient and slow, and never betray the customer's trust.</em>
              </p>

              <p className="text-xs sm:text-sm text-brand-coffee-800 leading-relaxed">
                That foundational philosophy is alive in every single pouch ofNathan Coffee today. From our original roastery near Canara Bank on South Street, Thanjavur, to our modern hub in Coimbatore, every harvest batch is inspected by hand, slow drum-roasted to medium-dark perfection, and ground to the exact micron size required for the sweetest decoction.
              </p>

              {/* Famous Quote Box */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-brand-yellow-50 to-brand-pink-50 border-l-4 border-brand-pink-600 shadow-sm space-y-1.5 sm:space-y-2">
                <p className="text-sm sm:text-lg font-extrabold text-brand-coffee-950 italic">
                  "Quality over quantity is the true essence of great coffee."
                </p>
                <p className="text-[11px] sm:text-xs font-bold text-brand-pink-700">
                  — The Guiding Motto ofNathan Coffee Mart Since 1950
                </p>
              </div>

              {/* Trust Features */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-2">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-brand-coffee-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>100% Pure</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-brand-coffee-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Zero Colors</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-brand-coffee-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Slow Roast</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-brand-coffee-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>FSSAI Certified</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* TIMELINE SECTION */}
        {/* ========================================================================= */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12 space-y-2">
            <span className="text-[11px] sm:text-xs font-extrabold text-brand-pink-600 uppercase tracking-wider bg-brand-pink-50 px-3 py-1 rounded-full border border-brand-pink-200">
              Our Journey Through Time
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-coffee-950">
              The Path of Pure Passion
            </h2>
          </div>

          <div className="relative border-l-2 border-brand-pink-400 ml-3 sm:ml-32 space-y-8 sm:space-y-10">
            {timelineMilestones.map((item, idx) => (
              <div key={item.year} className="relative pl-5 sm:pl-8 group">
                {/* Year Marker (Left on desktop, badge on mobile) */}
                <div className="sm:absolute sm:-left-32 sm:top-0 sm:w-24 sm:text-right font-black text-brand-pink-600 text-base sm:text-xl mb-1 sm:mb-0">
                  <span className="bg-brand-pink-100 sm:bg-transparent px-2.5 py-0.5 sm:px-0 sm:py-0 rounded-full text-xs sm:text-xl font-black">
                    {item.year}
                  </span>
                </div>

                {/* Dot */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-brand-pink-600 group-hover:scale-125 transition-transform" />

                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-brand-coffee-200 shadow-sm group-hover:border-brand-pink-300 group-hover:shadow-md transition-all space-y-2">
                  <h3 className="font-bold text-sm sm:text-base text-brand-coffee-950">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-brand-coffee-700 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CALL TO ACTION */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="bg-gradient-to-r from-brand-pink-600 via-brand-pink-700 to-brand-coffee-950 rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-2xl text-center space-y-5 sm:space-y-6 border-2 border-brand-yellow-400 w-full">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold">
              Taste the Legacy That Defined South Indian Coffee
            </h2>
            <p className="text-xs sm:text-base text-brand-pink-100 max-w-2xl mx-auto leading-relaxed">
              Order today and experience the aroma that has delighted four generations of filter coffee lovers across Tamil Nadu.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto">
              <Link
                to="/shop"
                className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-brand-yellow-400 hover:bg-brand-yellow-500 text-brand-coffee-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 btn-shimmer"
              >
                <span>Experience the Taste - Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto px-6 py-3 sm:py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/30 transition-colors text-center"
              >
                Contact for any queriess
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
