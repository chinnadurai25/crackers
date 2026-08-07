import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-festival-gold">
            Featured Collection
          </span>
        </h2>
        <div className="w-24 h-1 bg-festival-gold mx-auto rounded-full neon-border-gold"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full text-center text-festival-gold text-xl py-10">Loading premium collection...</div>
        ) : (
          products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
};

export default ProductCatalog;
