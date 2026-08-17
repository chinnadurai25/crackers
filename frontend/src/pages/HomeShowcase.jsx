import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import DiwaliBanner from '../components/DiwaliBanner';
import { API_BASE_URL } from '../utils/apiConfig';

const CATEGORY_ICONS = {
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

const HomeShowcase = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch categories and products in parallel
    Promise.all([
      fetch(`${API_BASE_URL}/api/categories`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/products`).then(res => res.json())
    ])
    .then(([categoriesData, productsData]) => {
      const cats = Array.isArray(categoriesData) ? categoriesData.filter(c => c !== 'All') : [];
      setCategories(cats);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setLoading(false);
    })
    .catch(err => {
      setError('Could not load showcase items.');
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-4xl animate-bounce mb-4">🎇</p>
        <p className="text-gray-400">Loading festive collections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const middleIndex = Math.ceil(categories.length / 2);

  return (
    <section className="py-12 bg-transparent overflow-hidden relative">
      
      {/* Decorative background elements */}
      <div className="absolute top-40 -left-40 w-96 h-96 bg-festival-gold/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-40 -right-40 w-96 h-96 bg-festival-orange/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Sparkles size={16} className="text-festival-gold" />
            <span className="text-gray-300 text-sm font-medium tracking-wider uppercase">Premium Collection</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-4"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-festival-gold to-white">
              Shop by Categories
            </span>
          </motion.h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-festival-gold to-festival-orange mx-auto rounded-full" />
        </div>

        {categories.map((category, index) => {
          // Filter products for this category
          const categoryProducts = products.filter(p => p.category === category);
          
          // Skip category if it has no products
          if (categoryProducts.length === 0) return null;

          // Take the top 4 products (can be sorted by ID or discount later if needed)
          const topProducts = categoryProducts.slice(0, 4);

          return (
            <React.Fragment key={category}>
              
              {/* Insert Banner at the middle */}
              {index === middleIndex && (
                <div className="my-16 md:my-24">
                  <DiwaliBanner />
                </div>
              )}

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="mb-16 md:mb-20"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4 px-2">
                  <div className="flex items-center gap-3 group">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-2xl md:text-3xl shadow-lg group-hover:bg-festival-gold/10 group-hover:border-festival-gold/30 transition-colors">
                      {CATEGORY_ICONS[category] || '🎆'}
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-festival-gold transition-colors">{category}</h3>
                      <p className="text-gray-400 text-sm mt-1">{categoryProducts.length} Premium Items</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/products?category=${encodeURIComponent(category)}`)}
                    className="flex items-center gap-2 text-sm font-semibold text-festival-gold hover:text-white transition-colors bg-festival-gold/10 px-5 py-2.5 rounded-full border border-festival-gold/20 hover:bg-festival-gold/20"
                  >
                    View All {category}
                    <ArrowRight size={16} />
                  </button>
                </div>

                {/* Horizontal scroll on mobile, Grid on desktop */}
                <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 hide-scrollbar snap-x snap-mandatory">
                  {topProducts.map((product) => (
                    <div key={product.id} className="min-w-[280px] sm:min-w-0 w-full shrink-0 snap-start">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
};

export default HomeShowcase;
