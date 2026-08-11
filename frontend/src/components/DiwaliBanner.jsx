import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Gift, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DiwaliBanner = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className="max-w-7xl mx-auto px-6 py-12"
    >
      <div
        onClick={() => navigate('/products')}
        className="relative overflow-hidden rounded-3xl cursor-pointer group shadow-2xl"
      >
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-950 via-[#2a0800] to-[#1a0000] z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-festival-orange/30 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>

        {/* Animated Glowing Orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-64 h-64 bg-festival-gold/40 rounded-full blur-[80px]"
        ></motion.div>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-20 -right-20 w-72 h-72 bg-red-600/30 rounded-full blur-[100px]"
        ></motion.div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-14 gap-8 border border-festival-gold/20 rounded-3xl backdrop-blur-sm bg-black/10">

          <div className="flex-1 space-y-5 text-center md:text-left z-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-festival-gold/20 border border-festival-gold/50 text-festival-gold text-sm font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,215,0,0.3)]"
            >
              <Flame size={16} className="animate-pulse text-festival-orange" />
              Limited Time Only
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-festival-gold to-festival-orange drop-shadow-xl leading-tight">
              MEGA DIWALI BASH
            </h2>

            <p className="text-lg md:text-xl text-gray-300 max-w-lg mx-auto md:mx-0">
              Light up your celebrations! Get <span className="text-festival-gold font-black text-2xl drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">Flat 70% OFF</span> on all premium fireworks.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 bg-gradient-to-r from-festival-gold to-festival-orange text-black font-black px-8 py-4 rounded-full flex items-center gap-2 mx-auto md:mx-0 shadow-[0_0_20px_rgba(255,215,0,0.5)] group-hover:shadow-[0_0_40px_rgba(255,215,0,0.8)] transition-all uppercase tracking-wide"
            >
              <Gift size={20} />
              Grab The Offer Now
            </motion.button>
          </div>

          <div className="flex-1 relative flex justify-center items-center min-h-[250px] w-full">
            {/* Sparkle Icons representing fireworks */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="relative w-56 h-56 md:w-72 md:h-72"
            >
              <Sparkles size={72} className="absolute top-0 left-1/2 -translate-x-1/2 text-festival-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.9)]" />
              <Sparkles size={56} className="absolute bottom-8 left-4 text-festival-orange drop-shadow-[0_0_15px_rgba(255,100,0,0.9)]" />
              <Sparkles size={64} className="absolute bottom-12 right-0 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]" />
            </motion.div>

            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <span className="text-[120px] md:text-[180px] font-black text-white/10 tracking-tighter mix-blend-overlay select-none drop-shadow-2xl">
                50%
              </span>
            </motion.div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default DiwaliBanner;
