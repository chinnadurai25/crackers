import React from 'react';
import { motion } from 'framer-motion';

const QuantitySelector = ({ quantity, setQuantity }) => {
  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className="flex items-center justify-between bg-black/40 rounded-full border border-white/10 p-1 w-32 mx-auto">
      <motion.button 
        onClick={handleDecrease}
        className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        whileTap={{ scale: 0.9, backgroundColor: "rgba(255,255,255,0.3)" }}
      >
        -
      </motion.button>
      
      <motion.span 
        key={quantity}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-bold text-lg text-festival-gold"
      >
        {quantity}
      </motion.span>
      
      <motion.button 
        onClick={handleIncrease}
        className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        whileTap={{ scale: 0.9, backgroundColor: "rgba(255,255,255,0.3)" }}
      >
        +
      </motion.button>
    </div>
  );
};

export default QuantitySelector;
