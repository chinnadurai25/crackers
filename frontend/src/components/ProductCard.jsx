import React, { useState } from 'react';
import { motion } from 'framer-motion';
import QuantitySelector from './QuantitySelector';

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  
  return (
    <motion.div 
      className="glass-card p-4 relative group"
      whileHover={{ y: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Discount Badge */}
      <div className="absolute top-4 right-4 z-10 bg-festival-crimson text-white text-xs font-bold px-2 py-1 rounded-full shadow-[0_0_10px_rgba(220,20,60,0.5)]">
        {product.discount}% OFF
      </div>

      {/* Image Container with 3D Tilt Effect */}
      <motion.div 
        className="w-full h-48 bg-black/50 rounded-xl mb-4 overflow-hidden relative flex items-center justify-center"
      >
        {/* Placeholder image representation */}
        <div className="text-6xl group-hover:scale-110 transition-transform duration-500">
          🎆
        </div>
        
        {/* Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-festival-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </motion.div>

      {/* Product Details */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
        
        <div className="flex justify-center items-center gap-3 mb-4">
          <span className="text-gray-400 line-through text-sm">₹{product.originalPrice}</span>
          <span className="text-2xl font-extrabold text-festival-gold">₹{product.discountedPrice}</span>
        </div>

        <div className="mb-4">
          <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
        </div>

        <motion.button 
          className="w-full bg-white/10 hover:bg-festival-gold hover:text-black border border-white/20 hover:border-festival-gold text-white font-semibold py-2 rounded-xl transition-colors duration-300 relative overflow-hidden"
          whileTap={{ scale: 0.95 }}
        >
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
