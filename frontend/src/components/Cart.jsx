import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import QuantitySelector from './QuantitySelector';
import { useCart } from '../context/CartContext';

const Cart = ({ isOpen, onClose }) => {
  const { cartItems, cartTotal, deliveryFee, removeFromCart, updateQuantity } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Cart Panel */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#0d0d14] border-l border-white/10 shadow-2xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingBag size={22} className="text-festival-gold" />
                Your Cart
                {cartItems.length > 0 && (
                  <span className="text-sm bg-festival-gold text-black font-bold px-2 py-0.5 rounded-full ml-1">
                    {cartItems.length}
                  </span>
                )}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              >
                <X size={22} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <p className="text-6xl mb-4">🎆</p>
                  <p className="text-gray-400 font-semibold mb-1">Your cart is empty</p>
                  <p className="text-gray-600 text-sm">Add some crackers to get started!</p>
                  <button
                    onClick={onClose}
                    className="mt-6 text-festival-gold text-sm underline hover:no-underline"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="flex gap-3 glass-card p-3 border-white/5"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 bg-black/50 rounded-lg overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🎇</div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-festival-gold text-[10px] font-bold tracking-widest uppercase">{item.category}</p>
                      <h4 className="font-bold text-white text-sm mb-1 truncate">{item.name}</h4>
                      <p className="text-festival-gold font-bold mb-2">₹{(item.discountedPrice * item.quantity).toLocaleString()}</p>
                      <div className="flex justify-between items-center">
                        <QuantitySelector
                          quantity={item.quantity}
                          setQuantity={(qty) => updateQuantity(item.id, qty)}
                        />
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-600 hover:text-festival-crimson transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-5 border-t border-white/10 bg-black/40">
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Delivery</span>
                    {deliveryFee > 0 ? (
                      <span className="text-white">₹{deliveryFee.toLocaleString()}</span>
                    ) : (
                      <span className="text-green-400">FREE</span>
                    )}
                  </div>
                  <div className="flex justify-between text-festival-gold font-bold text-lg border-t border-white/10 pt-2 mt-1">
                    <span>Grand Total</span>
                    <span>₹{(cartTotal + (deliveryFee || 0)).toLocaleString()}</span>
                  </div>
                </div>

                {cartTotal < 3000 && (
                  <p className="text-red-400 text-xs font-bold text-center mb-3 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                    Minimum order amount is ₹3,000. Please add items worth ₹{(3000 - cartTotal).toLocaleString()} more to proceed.
                  </p>
                )}

                {cartTotal >= 3000 ? (
                  <Link
                    to="/checkout"
                    onClick={onClose}
                    className="btn-primary w-full text-center flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout <ArrowRight size={16} />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="btn-primary w-full text-center flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                  >
                    Proceed to Checkout <ArrowRight size={16} />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;
