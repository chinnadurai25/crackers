import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';

const CATEGORY_ICONS = {
  'All': '✨',
  'Combo Packs': '📦',
  'Sky Shots': '🚀',
  'Flower Pots': '🌸',
  'Fountains': '⛲',
  'Rockets': '🎇',
  'Sparklers': '✨',
  'Crackers': '🧨',
  'Ground Chakras': '🌀',
  'Ground Novelties': '🎭',
};

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories once
  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : ['All']))
      .catch(() => {});
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    const url = activeCategory === 'All'
      ? 'http://localhost:5000/api/products'
      : `http://localhost:5000/api/products?category=${encodeURIComponent(activeCategory)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError('Could not load products. Is the backend running?');
        setLoading(false);
      });
  }, [activeCategory]);

  return (
    <section id="shop" className="py-16 px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-festival-gold">
            Featured Collection
          </span>
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-festival-gold to-festival-orange mx-auto rounded-full" />
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {categories.map(cat => (
          <motion.button
            key={cat}
            id={`category-${cat.replace(/\s+/g, '-').toLowerCase()}`}
            onClick={() => setActiveCategory(cat)}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-300 ${
              activeCategory === cat
                ? 'bg-festival-gold text-black border-festival-gold shadow-[0_0_15px_rgba(255,215,0,0.4)]'
                : 'bg-white/5 text-gray-300 border-white/15 hover:border-festival-gold/50 hover:text-festival-gold'
            }`}
          >
            <span>{CATEGORY_ICONS[cat] || '🎆'}</span>
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Products Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card h-80 animate-pulse">
                <div className="w-full h-52 bg-white/5 rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-white/10 rounded w-1/3" />
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-4xl mb-4">⚠️</p>
            <p className="text-red-400 font-semibold mb-2">{error}</p>
            <p className="text-gray-500 text-sm">Make sure backend is running and visit <code className="text-festival-gold">http://localhost:5000/api/init-db</code> first.</p>
          </motion.div>
        ) : products.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-5xl mb-4">🎆</p>
            <p className="text-gray-400">No products found in this category.</p>
          </motion.div>
        ) : (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProductCatalog;
