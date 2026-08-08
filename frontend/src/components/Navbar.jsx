import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, Zap, ChevronDown, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = ({ onCartClick }) => {
  const { cartCount } = useCart();
  const [categories, setCategories] = useState(['All']);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : ['All']))
      .catch(() => {});
  }, []);

  // Close dropdowns when route changes
  useEffect(() => {
    setShowDropdown(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <motion.nav
      className="fixed top-0 w-full z-50 glass-card rounded-none border-t-0 border-l-0 border-r-0 border-b-white/10 px-6 py-4"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center relative">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-festival-gold to-festival-orange rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(255,215,0,0.5)] shrink-0">
            <Zap size={18} className="text-black" fill="black" />
          </div>
          <span className="text-xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-festival-gold to-festival-orange hidden sm:block">
            CRACKERKING
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex gap-8 text-gray-300 text-sm font-medium items-center">
          <Link to="/" className="hover:text-festival-gold transition-colors">Home</Link>
          
          {/* Products Dropdown */}
          <div 
            className="relative group"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <Link to="/products" className="hover:text-festival-gold transition-colors flex items-center gap-1 py-4">
              Products <ChevronDown size={14} className={`transition-transform duration-300 ${showDropdown ? 'rotate-180 text-festival-gold' : ''}`} />
            </Link>
            
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-[80%] left-0 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl py-2 z-50 flex flex-col"
                >
                  {categories.map(cat => (
                    <Link
                      key={cat}
                      to={cat === 'All' ? '/products' : `/products?category=${encodeURIComponent(cat)}`}
                      className="px-4 py-2 hover:bg-white/5 hover:text-festival-gold transition-colors text-gray-300 text-sm whitespace-nowrap"
                    >
                      {cat}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/tracking" className="hover:text-festival-gold transition-colors">Track Order</Link>
        </div>

        {/* Cart & Mobile Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            id="cart-button"
            onClick={onCartClick}
            className="flex items-center gap-2 bg-white/10 hover:bg-festival-gold/20 border border-white/20 hover:border-festival-gold/50 px-3 py-2 sm:px-4 rounded-full transition-all duration-300 group shrink-0"
          >
            <div className="relative shrink-0">
              <ShoppingCart size={20} className="text-gray-300 group-hover:text-festival-gold transition-colors" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-festival-crimson text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </motion.span>
              )}
            </div>
            <span className="text-sm text-gray-300 group-hover:text-festival-gold transition-colors font-medium">Cart</span>
          </button>
          <button 
            className="md:hidden text-gray-300 hover:text-festival-gold shrink-0 p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-[#1a1a2e]/95 backdrop-blur-xl border-t border-white/10 mt-4 absolute left-0 right-0"
          >
            <div className="flex flex-col py-4 px-6 gap-4">
              <Link to="/" className="text-gray-300 hover:text-festival-gold text-lg font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </Link>
              <div className="flex flex-col gap-2">
                <Link to="/products" className="text-gray-300 hover:text-festival-gold text-lg font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  Products
                </Link>
                <div className="pl-4 flex flex-col gap-2 border-l border-white/10 mt-2">
                  {categories.map(cat => (
                    <Link
                      key={cat}
                      to={cat === 'All' ? '/products' : `/products?category=${encodeURIComponent(cat)}`}
                      className="text-gray-400 hover:text-festival-gold text-sm transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
              <Link to="/tracking" className="text-gray-300 hover:text-festival-gold text-lg font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Track Order
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
