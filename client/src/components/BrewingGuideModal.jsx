import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coffee, Sparkles, CheckCircle2, Flame, Droplets, Clock } from 'lucide-react';

const BrewingGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: '01',
      title: 'Add Fresh Powder',
      desc: 'Add 2 to 3 heaped tablespoons ofNathan Pure Filter Coffee Powder into the upper perforated chamber of your traditional South Indian filter.',
      icon: <Coffee className="w-5 h-5 text-brand-pink-600" />,
      time: '1 Min',
    },
    {
      step: '02',
      title: 'Gentle Tamper Press',
      desc: 'Place the pressing disc (umbrella plunger) gently on top of the coffee powder without pressing too tightly so the water can extract evenly.',
      icon: <Sparkles className="w-5 h-5 text-brand-yellow-500" />,
      time: '30 Sec',
    },
    {
      step: '03',
      title: 'Pour Boiling Water',
      desc: 'Boil fresh water and gently pour into the upper cup until full. Cover with lid and let the aromatic thick decoction drip slowly for 10-15 minutes.',
      icon: <Droplets className="w-5 h-5 text-sky-500" />,
      time: '10-15 Min',
    },
    {
      step: '04',
      title: 'Froth & Serve',
      desc: 'Pour 50ml hot decoction into a traditional Davarah Tumbler. Add steaming full-cream boiled milk and sugar to taste. Froth back and forth for creamy velvet foam!',
      icon: <Flame className="w-5 h-5 text-amber-500" />,
      time: '1 Min',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-brand-coffee-950/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-brand-pink-200 z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-brand-coffee-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-pink-600 text-white rounded-2xl shadow-md">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-brand-coffee-950">
                  How to Brew Authentic South Indian Filter Coffee
                </h3>
                <p className="text-xs text-brand-pink-700 font-semibold font-tamil">
                  நாடன் பாரம்பரிய ஃபில்டர் காபி செய்முறை
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-brand-coffee-500 hover:bg-brand-pink-50 hover:text-brand-pink-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            {steps.map((item) => (
              <div
                key={item.step}
                className="p-4 rounded-2xl bg-brand-coffee-50 border border-brand-coffee-200/80 hover:border-brand-pink-300 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-brand-pink-600 text-sm font-sans">
                      {item.step}
                    </span>
                    <div className="p-1.5 bg-white rounded-lg border border-brand-coffee-200 shadow-xs">
                      {item.icon}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-white text-brand-coffee-600 px-2 py-0.5 rounded-full border border-brand-coffee-200 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {item.time}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-brand-coffee-950">{item.title}</h4>
                <p className="text-xs text-brand-coffee-700 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Pro Tips Box */}
          <div className="p-4 rounded-2xl bg-brand-yellow-50 border border-brand-yellow-200 text-xs text-brand-coffee-900 space-y-1">
            <p className="font-bold text-brand-coffee-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-yellow-600" />Nathan Master Roaster Secret:
            </p>
            <p className="leading-relaxed">
              For that thick hotel-style decoction, always use freshly boiled hot water (not lukewarm) and never re-boil the extracted coffee decoction directly on the flame.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-brand-pink-600 hover:bg-brand-pink-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Got it! Let's Order Coffee
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BrewingGuideModal;
