import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Checkout = () => {
  const [step, setStep] = useState(1);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen py-20 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-festival-gold">
          Secure Checkout
        </h2>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10 -translate-y-1/2"></div>
        <div 
          className="absolute top-1/2 left-0 h-1 bg-festival-gold -z-10 -translate-y-1/2 transition-all duration-500"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        ></div>
        
        {['Information', 'Address', 'Payment'].map((label, index) => (
          <div key={label} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-colors duration-500 ${
              step >= index + 1 ? 'bg-festival-gold text-black neon-border-gold' : 'bg-festival-dark border border-white/20 text-gray-500'
            }`}>
              {index + 1}
            </div>
            <span className={`text-sm ${step >= index + 1 ? 'text-white' : 'text-gray-500'}`}>{label}</span>
          </div>
        ))}
      </div>

      <motion.div 
        className="glass-card p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={step}
      >
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Full Name</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-festival-gold transition-colors" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Mobile Number</label>
                <input type="tel" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-festival-gold transition-colors" placeholder="+91 9876543210" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-gray-300 text-sm">WhatsApp Number (For Order Updates)</label>
                <input type="tel" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-festival-gold transition-colors" placeholder="+91 9876543210" />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={() => setStep(2)} className="btn-primary">Next: Delivery Address</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Delivery Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-gray-300 text-sm">Address Line 1</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-festival-gold transition-colors" placeholder="House No, Building, Street" />
              </div>
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Landmark</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-festival-gold transition-colors" placeholder="Near Apollo Hospital" />
              </div>
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">City</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-festival-gold transition-colors" placeholder="Chennai" />
              </div>
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Pincode</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-festival-gold transition-colors" placeholder="600001" />
              </div>
            </div>
            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-3 text-gray-300 hover:text-white transition-colors">Back</button>
              <button onClick={() => setStep(3)} className="btn-primary">Next: Order Summary</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Order Summary</h3>
            <div className="bg-black/30 rounded-xl p-6 border border-white/5 space-y-4">
              <div className="flex justify-between text-gray-300">
                <span>Festival Mega Box (x1)</span>
                <span>₹3999</span>
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between text-xl font-bold text-festival-gold">
                <span>Total Amount to Pay</span>
                <span>₹3999</span>
              </div>
            </div>
            
            <div className="bg-festival-gold/10 border border-festival-gold/30 rounded-xl p-6 mt-6">
              <h4 className="font-bold text-festival-gold mb-2">Payment Method</h4>
              <p className="text-gray-300 text-sm mb-4">You will receive a bank transfer invoice after placing the order. Your order will be confirmed upon successful verification of payment via WhatsApp.</p>
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(2)} className="px-6 py-3 text-gray-300 hover:text-white transition-colors">Back</button>
              <button className="btn-primary flex items-center gap-2">
                Place Order <span className="text-xl">🚀</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Checkout;
