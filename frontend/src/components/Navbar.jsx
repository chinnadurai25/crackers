import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, User, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ onCartClick }) => {
  return (
    <motion.nav 
      className="fixed top-0 w-full z-50 glass-card rounded-none border-t-0 border-l-0 border-r-0 border-b-white/10 px-6 py-4"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white tracking-wider flex items-center gap-2">
          <span className="text-festival-gold">🎇</span> 
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-festival-gold">FIREWORKS</span>
        </Link>
        
        <div className="hidden md:flex gap-8 text-gray-300">
          <Link to="/" className="hover:text-festival-gold transition-colors">Home</Link>
          <Link to="/" className="hover:text-festival-gold transition-colors">Shop</Link>
          <Link to="/tracking" className="hover:text-festival-gold transition-colors">Track Order</Link>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="text-gray-300 hover:text-white transition-colors">
            <User size={24} />
          </button>
          <button 
            className="text-gray-300 hover:text-festival-gold transition-colors relative"
            onClick={onCartClick}
          >
            <ShoppingCart size={24} />
            <span className="absolute -top-2 -right-2 bg-festival-crimson text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              3
            </span>
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
