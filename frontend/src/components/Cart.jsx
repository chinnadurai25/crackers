import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import QuantitySelector from './QuantitySelector';

const Cart = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Cart Panel */}
          <motion.div 
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-festival-dark border-l border-white/10 shadow-2xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Your Cart
              </h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Dummy Cart Item */}
              <div className="flex gap-4 glass-card p-3 border-white/5">
                <div className="w-20 h-20 bg-black/50 rounded-lg flex items-center justify-center text-3xl">
                  🎇
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-1">Festival Mega Box</h4>
                  <div className="text-festival-gold font-bold mb-3">₹3999</div>
                  <div className="flex justify-between items-center">
                    <QuantitySelector quantity={1} setQuantity={() => {}} />
                    <button className="text-gray-500 hover:text-festival-crimson transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-black/40">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>₹3999</span>
                </div>
                <div className="flex justify-between text-festival-gold font-bold text-xl border-t border-white/10 pt-3">
                  <span>Grand Total</span>
                  <span>₹3999</span>
                </div>
              </div>
              
              <Link 
                to="/checkout"
                onClick={onClose}
                className="btn-primary w-full text-center block"
              >
                Proceed to Checkout
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;
