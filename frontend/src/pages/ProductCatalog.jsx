import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, X, Sparkles } from 'lucide-react';
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
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const categoryFromUrl = searchParams.get('category') || 'All';
  const searchFromUrl = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState(categoryFromUrl);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setActiveCategory(searchParams.get('category') || 'All');
    setSearchQuery(searchParams.get('search') || '');
  }, [location.search]);

  // Fetch categories once
  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : ['All']))
      .catch(() => {});
  }, []);

  // Fetch products when category or search query changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const params = new URLSearchParams();
    if (activeCategory !== 'All') params.set('category', activeCategory);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());

    const queryString = params.toString();
    const url = `http://localhost:5000/api/products${queryString ? `?${queryString}` : ''}`;

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
  }, [activeCategory, searchQuery]);

  const handleCategoryClick = (cat) => {
    const params = new URLSearchParams(location.search);
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    const queryStr = params.toString();
    navigate(`${location.pathname}${queryStr ? `?${queryStr}` : ''}`);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    const params = new URLSearchParams(location.search);
    if (value.trim()) {
      params.set('search', value.trim());
    } else {
      params.delete('search');
    }
    const queryStr = params.toString();
    navigate(`${location.pathname}${queryStr ? `?${queryStr}` : ''}`, { replace: true });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    const params = new URLSearchParams(location.search);
    params.delete('search');
    const queryStr = params.toString();
    navigate(`${location.pathname}${queryStr ? `?${queryStr}` : ''}`);
  };

  return (
    <section id="shop" className="py-16 px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-festival-gold">
            Featured Collection
          </span>
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-festival-gold to-festival-orange mx-auto rounded-full mb-6" />
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Explore our wide range of celebratory fireworks. Search by product name, category, or type!
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-2xl mx-auto mb-8 relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 text-festival-gold" size={20} />
          <input
            id="catalog-search-input"
            type="text"
            placeholder="Search products by name or type..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-white/5 border border-white/15 focus:border-festival-gold rounded-full py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-festival-gold/20 transition-all text-sm backdrop-blur-md"
          />
          {searchQuery && (
            <button
              id="clear-search-btn"
              onClick={handleClearSearch}
              className="absolute right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              title="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="flex justify-between items-center mt-2 px-4 text-xs">
            <span className="text-festival-gold font-medium">
              Showing search results for "<span className="text-white font-bold">{searchQuery}</span>"
            </span>
            <button
              onClick={handleClearSearch}
              className="text-gray-400 hover:text-festival-gold underline transition-colors"
            >
              Reset Search
            </button>
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {categories.map(cat => (
          <motion.button
            key={cat}
            id={`category-${cat.replace(/\s+/g, '-').toLowerCase()}`}
            onClick={() => handleCategoryClick(cat)}
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
            className="text-center py-20 glass-card max-w-lg mx-auto p-8 rounded-3xl"
          >
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-xl font-bold text-white mb-2">No matching products found</h3>
            <p className="text-gray-400 text-sm mb-6">
              {searchQuery
                ? `We couldn't find any products matching "${searchQuery}". Try searching for something else.`
                : 'No products available in this category.'}
            </p>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="btn-primary text-sm px-6 py-2.5 inline-flex items-center gap-2"
              >
                <Sparkles size={16} /> View All Products
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`${activeCategory}-${searchQuery}`}
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
