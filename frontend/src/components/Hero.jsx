import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Calculate parallax offset
  const xOffset = (mousePosition.x - window.innerWidth / 2) * 0.05;
  const yOffset = (mousePosition.y - window.innerHeight / 2) * 0.05;

  // Staggered text animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32">
      {/* Background Animated Gradients */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-40"
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, rgba(255, 215, 0, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 70%, rgba(220, 20, 60, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 50%, rgba(0, 210, 255, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 30%, rgba(255, 215, 0, 0.15) 0%, transparent 50%)",
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Parallax Glowing Orbs */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-40 h-40 bg-festival-gold/30 rounded-full blur-[100px]"
        animate={{ x: xOffset * 1.5, y: yOffset * 1.5, scale: [1, 1.2, 1] }}
        transition={{ scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }, default: { type: "spring", damping: 30 } }}
      />
      <motion.div 
        className="absolute top-1/2 right-1/4 w-64 h-64 bg-festival-crimson/20 rounded-full blur-[120px]"
        animate={{ x: -xOffset * 2, y: -yOffset * 2, scale: [1, 1.5, 1] }}
        transition={{ scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }, default: { type: "spring", damping: 30 } }}
      />
      <motion.div 
        className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-festival-blue/30 rounded-full blur-[100px]"
        animate={{ x: xOffset, y: -yOffset, scale: [1, 1.3, 1] }}
        transition={{ scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }, default: { type: "spring", damping: 30 } }}
      />

      {/* Floating Sparkles Array */}
      <div className="absolute inset-0 z-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white rounded-full"
            style={{
              boxShadow: `0 0 ${Math.random() * 10 + 5}px ${Math.random() > 0.5 ? '#ffd700' : '#fff'}`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              y: [0, -Math.random() * 100 - 50]
            }}
            transition={{ 
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      <motion.div 
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="inline-block mb-4">
          <span className="bg-white/10 border border-white/20 text-festival-gold px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase backdrop-blur-md">
            The Ultimate Celebration
          </span>
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-festival-gold via-white to-festival-orange mb-6 neon-text-gold leading-tight"
        >
          Illuminate Your <br/>
          <span className="text-white">Moments</span>
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-lg md:text-2xl text-gray-300 mb-10 font-light max-w-2xl mx-auto"
        >
          Experience the magic of light and sound with our premium, eco-friendly fireworks collection.
        </motion.p>
        
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <motion.button 
            className="btn-primary text-lg px-10 py-4 w-full sm:w-auto flex items-center justify-center gap-2 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Shop Collection</span>
            <motion.span 
              className="inline-block"
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              ➔
            </motion.span>
          </motion.button>

          <motion.button 
            className="text-white font-bold text-lg px-8 py-4 border border-white/20 rounded-full hover:bg-white/10 transition-colors w-full sm:w-auto backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Offers
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Mouse scroll indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <span className="text-gray-400 text-xs tracking-widest uppercase">Scroll Down</span>
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
          <motion.div 
            className="w-1.5 h-1.5 bg-festival-gold rounded-full"
            animate={{ y: [0, 15, 0], opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;
