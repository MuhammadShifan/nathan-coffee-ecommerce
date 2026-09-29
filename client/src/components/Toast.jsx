import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Toast = () => {
  const { toastMessage, setToastMessage } = useCart();

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-brand-yellow-400 flex-shrink-0" />,
  };

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-50 max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="bg-brand-coffee-950 text-white p-4 rounded-2xl shadow-2xl border border-brand-pink-500/40 flex items-center gap-3 backdrop-blur-lg"
        >
          {icons[toastMessage.type] || icons.success}
          <div className="flex-1 text-xs font-semibold leading-relaxed">
            {toastMessage.message}
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-brand-coffee-400 hover:text-white p-1 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Toast;
