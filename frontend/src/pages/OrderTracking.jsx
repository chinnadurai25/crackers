import React from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, CreditCard } from 'lucide-react';

const OrderTracking = () => {
  const steps = [
    { icon: <Package />, label: "Order Received", date: "Oct 24, 10:00 AM", status: "completed" },
    { icon: <CreditCard />, label: "Payment Verified", date: "Oct 24, 11:30 AM", status: "completed" },
    { icon: <Package />, label: "Packing", date: "Oct 25, 09:00 AM", status: "active" },
    { icon: <Truck />, label: "Shipped", date: "Pending", status: "pending" },
    { icon: <CheckCircle />, label: "Delivered", date: "Pending", status: "pending" },
  ];

  return (
    <div className="min-h-screen py-20 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-festival-gold">
          Track Your Order
        </h2>
        <p className="text-gray-400">Order ID: <span className="text-white font-mono">CRK202600001</span></p>
      </div>

      <motion.div 
        className="glass-card p-8 md:p-12"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-white/10 rounded-full"></div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="relative flex items-center gap-8 z-10">
                {/* Icon Circle */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                  step.status === 'completed' ? 'bg-festival-gold text-black shadow-[0_0_15px_rgba(255,215,0,0.5)]' :
                  step.status === 'active' ? 'bg-festival-blue text-black shadow-[0_0_15px_rgba(0,210,255,0.5)] border-2 border-white' :
                  'bg-black/50 border border-white/20 text-gray-500'
                }`}>
                  {step.icon}
                </div>
                
                {/* Connecting active line */}
                {step.status === 'completed' && index < steps.length - 1 && (
                  <div className="absolute left-6 top-12 w-1 h-12 bg-festival-gold -z-10 shadow-[0_0_10px_rgba(255,215,0,0.5)]"></div>
                )}
                {step.status === 'active' && index < steps.length - 1 && (
                  <div className="absolute left-6 top-12 w-1 h-6 bg-gradient-to-b from-festival-blue to-transparent -z-10"></div>
                )}

                {/* Text Content */}
                <div>
                  <h4 className={`text-xl font-bold ${
                    step.status === 'completed' ? 'text-white' :
                    step.status === 'active' ? 'text-festival-blue' :
                    'text-gray-500'
                  }`}>
                    {step.label}
                  </h4>
                  <p className="text-gray-400 text-sm mt-1">{step.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderTracking;
