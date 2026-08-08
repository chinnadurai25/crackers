import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Menu, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = ({ onCartClick }) => {
  const { cartCount } = useCart();

  return (
    <motion.nav
      className="fixed top-0 w-full z-50 glass-card rounded-none border-t-0 border-l-0 border-r-0 border-b-white/10 px-6 py-4"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-gradient-to-br from-festival-gold to-festival-orange rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(255,215,0,0.5)]">
            <Zap size={18} className="text-black" fill="black" />
          </div>
          <span className="text-xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-festival-gold to-festival-orange">
            CRACKERKING
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex gap-8 text-gray-300 text-sm font-medium">
          <Link to="/" className="hover:text-festival-gold transition-colors">Shop</Link>
          <Link to="/tracking" className="hover:text-festival-gold transition-colors">Track Order</Link>
        </div>

        {/* Cart Button */}
        <div className="flex items-center gap-4">
          <button
            id="cart-button"
            onClick={onCartClick}
            className="flex items-center gap-2 bg-white/10 hover:bg-festival-gold/20 border border-white/20 hover:border-festival-gold/50 px-4 py-2 rounded-full transition-all duration-300 group"
          >
            <div className="relative">
              <ShoppingCart size={20} className="text-gray-300 group-hover:text-festival-gold transition-colors" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-festival-crimson text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </motion.span>
              )}
            </div>
            <span className="text-sm text-gray-300 group-hover:text-festival-gold transition-colors font-medium">Cart</span>
          </button>
          <button className="md:hidden text-gray-300">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
