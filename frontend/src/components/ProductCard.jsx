import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import QuantitySelector from './QuantitySelector';
import { useCart } from '../context/CartContext';

const BADGE_STYLES = {
  'Best Seller': 'bg-gradient-to-r from-festival-gold to-festival-orange text-black',
  'New': 'bg-gradient-to-r from-festival-blue to-[#0066ff] text-white',
};

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const imagesList = (product.images && product.images.length > 0)
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : []);

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % imagesList.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  return (
    <motion.div
      className="glass-card relative group flex flex-col overflow-hidden"
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Discount Badge */}
      <div className="absolute top-3 right-3 z-20 bg-festival-crimson text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(220,20,60,0.5)]">
        -{product.discount}%
      </div>

      {/* Best Seller / New Badge */}
      {product.badge && (
        <div className={`absolute top-3 left-3 z-20 text-xs font-bold px-2.5 py-1 rounded-full ${BADGE_STYLES[product.badge] || 'bg-white/20 text-white'}`}>
          {product.badge === 'Best Seller' && <Star size={10} className="inline mr-1" fill="currentColor" />}
          {product.badge}
        </div>
      )}

      {/* Product Image Carousel */}
      <div className="w-full h-52 bg-black/50 overflow-hidden relative flex-shrink-0">
        {imagesList.length > 0 ? (
          <img
            src={imagesList[currentImgIndex]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}

        <div
          className="absolute inset-0 text-6xl items-center justify-center hidden"
          style={{ display: imagesList.length === 0 ? 'flex' : 'none' }}
        >
          🎆
        </div>

        {/* Carousel controls if multiple images */}
        {imagesList.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
              title="Previous photo"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
              title="Next photo"
            >
              <ChevronRight size={18} />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
              {imagesList.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrentImgIndex(i); }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentImgIndex ? 'w-4 bg-festival-gold' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category Label */}
        <p className="text-festival-gold text-xs font-bold tracking-widest uppercase mb-1">
          {product.category}
        </p>

        {/* Name */}
        <h3 className="text-white font-bold text-lg mb-1 leading-tight">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-gray-400 text-xs mb-3 leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4 mt-auto">
          <span className="text-2xl font-extrabold text-festival-gold">
            ₹{product.discountedPrice}
          </span>
          <span className="text-gray-500 line-through text-sm">
            ₹{product.originalPrice}
          </span>
        </div>

        {/* Quantity + Add to Cart */}
        <div className="flex items-center gap-3">
          <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
          <motion.button
            id={`add-to-cart-${product.id}`}
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
              added
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-festival-gold text-black hover:bg-festival-orange border border-festival-gold'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingBag size={15} />
            {added ? 'Added!' : 'Add to Cart'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
