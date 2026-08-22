import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Flame, Sparkles, Gift } from 'lucide-react';
import FireworksCanvas from './FireworksCanvas';

const Hero = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
  };

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
      {/* Fireworks Animation Background */}
      <FireworksCanvas />

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[15%] text-festival-gold/40 hidden md:block z-0 blur-[1px]"
      >
        <Flame size={56} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [0, -15, 15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[25%] right-[15%] text-festival-orange/40 hidden md:block z-0 blur-[1px]"
      >
        <Sparkles size={72} />
      </motion.div>
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[30%] left-[20%] w-32 h-32 bg-festival-gold/20 rounded-full blur-[50px] z-0"
      ></motion.div>

      <motion.div
        className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-8"
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
          Illuminate Your <br />
          <span className="text-white">Moments</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-2xl text-gray-300 mb-8 font-light max-w-2xl mx-auto"
        >
          Experience the magic of light and sound with our premium, eco-friendly fireworks collection.
        </motion.p>

        {/* Search Bar in Hero */}
        <motion.form
          variants={itemVariants}
          onSubmit={handleSearchSubmit}
          className="max-w-xl mx-auto mb-10 relative flex items-center"
        >
          <div className="relative w-full">
            <input
              id="hero-search-input"
              type="text"
              placeholder="Search fireworks, sparklers, sky shots..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 hover:border-festival-gold/50 focus:border-festival-gold rounded-full py-4 pl-14 pr-32 text-white placeholder-gray-400 focus:outline-none shadow-[0_0_25px_rgba(0,0,0,0.5)] transition-all text-base"
            />
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-festival-gold" size={22} />
            <button
              id="hero-search-btn"
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-festival-gold hover:bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-full text-sm transition-all shadow-[0_0_15px_rgba(255,215,0,0.4)]"
            >
              Search
            </button>
          </div>
        </motion.form>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 relative mt-6">

          <div className="absolute -top-12 sm:-top-16 left-1/2 transform -translate-x-1/2 z-20">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="bg-gradient-to-r from-festival-gold to-festival-orange text-black text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-[0_0_20px_rgba(255,215,0,0.6)] border border-white/40 whitespace-nowrap"
            >
              <Gift size={16} className="animate-pulse text-red-700" />
              MEGA DIWALI SALE - 70% OFF!
              <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-festival-orange rotate-45 z-[-1]"></div>
            </motion.div>
          </div>

          <Link to="/products" className="w-full sm:w-auto relative z-10">
            <motion.button
              className="btn-primary text-lg px-10 py-4 w-full flex items-center justify-center gap-2 group"
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
          </Link>

          <a href="#shop" className="w-full sm:w-auto">
            <motion.button
              className="text-white font-bold text-lg px-8 py-4 border border-white/20 rounded-full hover:bg-white/10 transition-colors w-full sm:w-auto backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Products
            </motion.button>
          </a>
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
