import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';

const SafetyTips = () => {
  const dos = [
    "Display fireworks as per the warnings and instructions mentioned on the pack.",
    "Buy fireworks directly from Manufacturer or from authorized dealer only.",
    "Always follow the Safety tips marked on the fireworks.",
    "Use an agarbatti to ignite the fireworks.",
    "Always wear eye protection when lightening fireworks.",
    "Keep a bucket of water or a garden hose handy in case of fire or other mishap."
  ];

  const donts = [
    "Never try to re-light or pick up fireworks that have not ignited fully.",
    "Never shoot fireworks in a metal or glass containers.",
    "Never point or throw fireworks at another person.",
    "Do not wear loose clothing while using fireworks.",
    "Never carry fireworks in your packets.",
    "After fireworks display never pick up fireworks that may be left over, they may still active."
  ];

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 pt-8"
        >
          <div className="flex justify-center mb-4">
            <ShieldAlert size={48} className="text-festival-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-festival-gold to-festival-orange">
            Safety Tips
          </h1>
          <p className="text-gray-300 text-lg max-w-4xl mx-auto leading-relaxed">
            There are certain Do's & Don'ts to follow while purchasing, bursting and storing crackers. Thus, it is very important to follow the precautions while bursting crackers. A little negligence, ignorance and carelessness can cause a fatal injury.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Do's Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-8 rounded-2xl border border-green-500/20 bg-green-500/5 hover:border-green-500/40 transition-colors"
          >
            <h2 className="text-3xl font-bold text-green-400 mb-8 flex items-center gap-3">
              <CheckCircle2 size={32} />
              Do's
            </h2>
            <ul className="space-y-4">
              {dos.map((tip, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="text-green-500 shrink-0 mt-1" size={20} />
                  <span className="text-gray-200 text-lg">{tip}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Don'ts Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card p-8 rounded-2xl border border-red-500/20 bg-red-500/5 hover:border-red-500/40 transition-colors"
          >
            <h2 className="text-3xl font-bold text-red-400 mb-8 flex items-center gap-3">
              <XCircle size={32} />
              Don'ts
            </h2>
            <ul className="space-y-4">
              {donts.map((tip, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <XCircle className="text-red-500 shrink-0 mt-1" size={20} />
                  <span className="text-gray-200 text-lg">{tip}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SafetyTips;
