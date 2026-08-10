import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { generateBill } from '../utils/generateBill';
import { FileDown } from 'lucide-react';
import BillPreviewModal from '../components/BillPreviewModal';

const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-festival-gold transition-colors";

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBillModal, setShowBillModal] = useState(false);

  const [form, setForm] = useState({
    customerName: '', mobile: '', whatsapp: '',
    address: '', landmark: '', city: '', pincode: ''
  });

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const placeOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: cartItems.map(i => ({ id: i.id, name: i.name, category: i.category || 'General', quantity: i.quantity, price: i.discountedPrice })),
          totalAmount: cartTotal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderId(data.orderId);
        setPlacedOrder({
          id: data.orderId,
          customerName: form.customerName,
          mobile: form.mobile,
          address: form.address,
          city: form.city,
          pincode: form.pincode,
          items: cartItems.map(i => ({ name: i.name, category: i.category || 'General', quantity: i.quantity, price: i.discountedPrice })),
          totalAmount: cartTotal,
          createdAt: new Date().toISOString()
        });
        clearCart();
        setStep(4);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Could not connect to server. Please try again.');
    }
    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen py-20 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-festival-gold">
          Secure Checkout
        </h2>
      </div>

      {/* Progress Bar */}
      {step < 4 && (
        <div className="flex justify-between mb-10 relative max-w-md mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10 -translate-y-1/2" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-festival-gold -z-10 -translate-y-1/2 transition-all duration-500"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
          {['Information', 'Address', 'Summary'].map((label, index) => (
            <div key={label} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-1 transition-all duration-300 ${
                step >= index + 1 ? 'bg-festival-gold text-black shadow-[0_0_12px_rgba(255,215,0,0.4)]' : 'bg-festival-dark border border-white/20 text-gray-500'
              }`}>
                {index + 1}
              </div>
              <span className={`text-xs ${step >= index + 1 ? 'text-white' : 'text-gray-600'}`}>{label}</span>
            </div>
          ))}
        </div>
      )}

      <motion.div
        className="glass-card p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={step}
      >
        {/* Step 1 — Customer Info */}
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-2xl font-bold mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Full Name *</label>
                <input id="checkout-name" type="text" className={inputClass} placeholder="e.g. Arjun Kumar" value={form.customerName} onChange={update('customerName')} />
              </div>
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Mobile Number *</label>
                <input id="checkout-mobile" type="tel" className={inputClass} placeholder="+91 9876543210" value={form.mobile} onChange={update('mobile')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-gray-400 text-sm">WhatsApp Number (for order updates)</label>
                <input id="checkout-whatsapp" type="tel" className={inputClass} placeholder="Same as mobile or different" value={form.whatsapp} onChange={update('whatsapp')} />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                id="checkout-step1-next"
                onClick={() => {
                  if (!form.customerName || !form.mobile) { setError('Name and mobile are required'); return; }
                  setError(''); setStep(2);
                }}
                className="btn-primary"
              >
                Next: Delivery Address
              </button>
            </div>
            {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
          </div>
        )}

        {/* Step 2 — Address */}
        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-2xl font-bold mb-4">Delivery Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 md:col-span-2">
                <label className="text-gray-400 text-sm">Address Line *</label>
                <input id="checkout-address" type="text" className={inputClass} placeholder="House No, Building, Street" value={form.address} onChange={update('address')} />
              </div>
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Landmark</label>
                <input id="checkout-landmark" type="text" className={inputClass} placeholder="Near Apollo Hospital" value={form.landmark} onChange={update('landmark')} />
              </div>
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">City *</label>
                <input id="checkout-city" type="text" className={inputClass} placeholder="Chennai" value={form.city} onChange={update('city')} />
              </div>
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Pincode *</label>
                <input id="checkout-pincode" type="text" className={inputClass} placeholder="600001" value={form.pincode} onChange={update('pincode')} />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <button onClick={() => { setError(''); setStep(1); }} className="px-5 py-3 text-gray-400 hover:text-white transition-colors">← Back</button>
              <button
                id="checkout-step2-next"
                onClick={() => {
                  if (!form.address || !form.city || !form.pincode) { setError('Address, city and pincode are required'); return; }
                  setError(''); setStep(3);
                }}
                className="btn-primary"
              >
                Next: Order Summary
              </button>
            </div>
            {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
          </div>
        )}

        {/* Step 3 — Order Summary */}
        {step === 3 && (
          <div className="space-y-5">
            <h3 className="text-2xl font-bold mb-4">Order Summary</h3>
            <div className="bg-black/30 rounded-xl p-5 border border-white/5 space-y-3 max-h-60 overflow-y-auto">
              {cartItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Cart is empty — go back and add products.</p>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-gray-300 text-sm">
                    <span>{item.name} <span className="text-gray-500">×{item.quantity}</span></span>
                    <span>₹{(item.discountedPrice * item.quantity).toLocaleString()}</span>
                  </div>
                ))
              )}
              <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-festival-gold text-lg">
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-festival-gold/10 border border-festival-gold/30 rounded-xl p-5">
              <h4 className="font-bold text-festival-gold mb-2">💳 Payment Method</h4>
              <p className="text-gray-400 text-sm">You will receive bank transfer details via WhatsApp after placing the order. Your order will be confirmed once payment is verified.</p>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <div className="flex justify-between mt-2">
              <button onClick={() => { setError(''); setStep(2); }} className="px-5 py-3 text-gray-400 hover:text-white transition-colors">← Back</button>
              <motion.button
                id="checkout-place-order"
                onClick={placeOrder}
                disabled={loading || cartItems.length === 0}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.97 }}
              >
                {loading ? 'Placing Order...' : 'Place Order 🚀'}
              </motion.button>
            </div>
          </div>
        )}

        {/* Step 4 — Success */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: 3, duration: 0.4 }}
              className="text-7xl mb-6"
            >
              🎉
            </motion.div>
            <h3 className="text-3xl font-bold text-white mb-3">Order Placed!</h3>
            <p className="text-gray-400 mb-6">Thank you for your order. We'll contact you via WhatsApp shortly.</p>
            <div className="bg-festival-gold/10 border border-festival-gold/30 rounded-xl p-5 mb-8 inline-block">
              <p className="text-gray-400 text-sm mb-1">Your Order ID</p>
              <p className="text-festival-gold font-mono font-bold text-2xl tracking-wider">{orderId}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button 
                onClick={() => setShowBillModal(true)}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <FileDown size={18} />
                View Bill
              </button>
              <a href={`/tracking?id=${orderId}`} className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white transition-all flex items-center justify-center">
                Track Order
              </a>
            </div>
            <div className="flex justify-center">
              <a href="/" className="px-6 py-3 border border-white/20 rounded-full text-gray-300 hover:text-white hover:border-white/50 transition-all">Continue Shopping</a>
            </div>
          </motion.div>
        )}
      </motion.div>

      <BillPreviewModal 
        isOpen={showBillModal} 
        onClose={() => setShowBillModal(false)} 
        order={placedOrder} 
      />
    </div>
  );
};

export default Checkout;
