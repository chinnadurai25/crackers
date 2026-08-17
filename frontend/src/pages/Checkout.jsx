import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { generateBill } from '../utils/generateBill';
import { FileDown, Upload, Landmark, Copy, CheckCircle2, Smartphone, ShieldCheck } from 'lucide-react';
import BillPreviewModal from '../components/BillPreviewModal';
import { API_BASE_URL } from '../utils/apiConfig';

const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-festival-gold transition-colors";

const Checkout = () => {
  const { cartItems, cartTotal, deliveryFee, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBillModal, setShowBillModal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  
  const [proofFile, setProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);
  const [proofError, setProofError] = useState('');
  
  const [copiedField, setCopiedField] = useState('');

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const [form, setForm] = useState({
    customerName: '', mobile: '', whatsapp: '',
    address: '', landmark: '', city: '', pincode: ''
  });

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleProofUpload = async (e) => {
    e.preventDefault();
    if (!proofFile) {
      setProofError('Please select a screenshot first.');
      return;
    }
    setUploadingProof(true);
    setProofError('');
    
    const formData = new FormData();
    formData.append('paymentProof', proofFile);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/payment-proof`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setProofUploaded(true);
      } else {
        setProofError(data.error || 'Failed to upload proof.');
      }
    } catch {
      setProofError('Could not connect to server.');
    }
    setUploadingProof(false);
  };

  const placeOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: cartItems.map(i => ({ id: i.id, name: i.name, category: i.category || 'General', quantity: i.quantity, price: i.discountedPrice })),
          totalAmount: cartTotal + (deliveryFee || 0),
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
          totalAmount: cartTotal + (deliveryFee || 0),
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
              <div className="border-t border-white/10 pt-3 flex justify-between text-gray-400 text-sm">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Delivery</span>
                {deliveryFee > 0 ? (
                  <span className="text-white">₹{deliveryFee.toLocaleString()}</span>
                ) : (
                  <span className="text-green-400">FREE</span>
                )}
              </div>
              <div className="border-t border-white/10 pt-3 mt-1 flex justify-between font-bold text-festival-gold text-lg">
                <span>Total</span>
                <span>₹{(cartTotal + (deliveryFee || 0)).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-festival-gold/10 border border-festival-gold/30 rounded-xl p-5">
              <h4 className="font-bold text-festival-gold mb-2">💳 Payment Method</h4>
              <p className="text-gray-400 text-sm">You will receive bank transfer details via WhatsApp after placing the order. Your order will be confirmed once payment is verified.</p>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <div className="flex justify-between mt-2">
              <button onClick={() => { setError(''); setStep(2); }} className="px-5 py-3 text-gray-400 hover:text-white transition-colors">← Back</button>
              
              <div className="flex flex-col items-end gap-2">
                {cartTotal < 3000 && (
                  <p className="text-red-400 text-xs font-bold bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                    Minimum order amount is ₹3,000. Please add items worth ₹{(3000 - cartTotal).toLocaleString()} more.
                  </p>
                )}
                <motion.button
                  id="checkout-place-order"
                  onClick={placeOrder}
                  disabled={loading || cartItems.length === 0 || cartTotal < 3000}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? 'Placing Order...' : 'Place Order 🚀'}
                </motion.button>
              </div>
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
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center mb-6">
              <button 
                onClick={() => setShowPayment(true)}
                className="btn-primary flex items-center justify-center gap-2 px-8"
              >
                Payment Details
              </button>
              <button 
                onClick={() => setShowBillModal(true)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white transition-all flex items-center justify-center gap-2"
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

      {/* Payment Screen Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#11111a] border border-white/10 p-8 rounded-2xl max-w-md w-full relative shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar"
          >
            <button
              onClick={() => setShowPayment(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-festival-gold to-festival-orange rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                <Landmark size={32} className="text-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">Payment Details</h3>
              <p className="text-gray-400 text-sm">Transfer amount to complete your order</p>
            </div>
            
            <div className="bg-gradient-to-br from-white/10 to-white/5 p-1 rounded-2xl mb-6 shadow-xl">
              <div className="bg-[#0f0f16] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-bold">Account Name</p>
                    <p className="text-white font-bold text-lg">Magical Crackers</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 group">
                  <div className="min-w-0">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-bold truncate">Account Number</p>
                    <p className="text-festival-gold font-mono font-bold text-lg sm:text-xl tracking-wider break-all">194536383261127</p>
                  </div>
                  <button 
                    onClick={() => handleCopy('194536383261127', 'acc')}
                    className="shrink-0 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedField === 'acc' ? <CheckCircle2 size={20} className="text-green-400" /> : <Copy size={20} />}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 group">
                  <div className="min-w-0">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-bold truncate">IFSC Code</p>
                    <p className="text-festival-gold font-mono font-bold text-lg sm:text-xl tracking-wider break-all">TMBL0000194</p>
                  </div>
                  <button 
                    onClick={() => handleCopy('TMBL0000194', 'ifsc')}
                    className="shrink-0 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedField === 'ifsc' ? <CheckCircle2 size={20} className="text-green-400" /> : <Copy size={20} />}
                  </button>
                </div>
                
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 w-10 h-10 bg-white/5 rounded-full hidden sm:flex items-center justify-center border border-white/10">
                      <Smartphone size={18} className="text-gray-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5 font-bold truncate">GPay Number</p>
                      <p className="text-white font-mono font-bold text-lg sm:text-xl tracking-wider break-all">6380037709</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleCopy('6380037709', 'gpay')}
                    className="shrink-0 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedField === 'gpay' ? <CheckCircle2 size={20} className="text-green-400" /> : <Copy size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-festival-gold/5 p-4 rounded-xl border border-festival-gold/20 mb-6">
              <ShieldCheck size={24} className="text-festival-gold shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm leading-relaxed">
                Please share your payment screenshot via WhatsApp or upload it below. <strong className="text-white">Your order will be processed immediately after verification.</strong>
              </p>
            </div>

            <a
              href="https://wa.me/916380037709"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(37,211,102,0.4)] mb-8"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              WhatsApp Chat
            </a>

            <div className="border-t border-white/10 pt-6">
              <h4 className="text-white font-bold mb-3 text-center">Upload Payment Screenshot</h4>
              {proofUploaded ? (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-center text-sm font-medium">
                  Proof uploaded successfully! Your order will be processed shortly.
                </div>
              ) : (
                <form onSubmit={handleProofUpload} className="space-y-3">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setProofFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-festival-gold/10 file:text-festival-gold hover:file:bg-festival-gold/20"
                  />
                  {proofError && <p className="text-red-400 text-xs">{proofError}</p>}
                  <button 
                    type="submit" 
                    disabled={uploadingProof || !proofFile}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white py-2 rounded-full flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Upload size={16} />
                    {uploadingProof ? 'Uploading...' : 'Upload Proof'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
