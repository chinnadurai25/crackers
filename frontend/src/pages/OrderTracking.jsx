import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, CreditCard, Search, FileDown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { generateBill } from '../utils/generateBill';
import BillPreviewModal from '../components/BillPreviewModal';
import { API_BASE_URL } from '../utils/apiConfig';

const STATUS_STEPS = [
  { key: 'Order Received', icon: Package, label: 'Order Received' },
  { key: 'Payment Verified', icon: CreditCard, label: 'Payment Verified' },
  { key: 'Packing', icon: Package, label: 'Packing' },
  { key: 'Shipped', icon: Truck, label: 'Shipped' },
  { key: 'Delivered', icon: CheckCircle, label: 'Delivered' },
];

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [inputId, setInputId] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBillModal, setShowBillModal] = useState(false);

  const fetchOrder = async (id) => {
    if (!id.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setOrderId(id.trim());
      } else {
        setError(`Order "${id}" not found. Please check the Order ID.`);
      }
    } catch {
      setError('Could not connect to server.');
    }
    setLoading(false);
  };

  // Auto-fetch if id in URL
  useEffect(() => {
    const urlId = searchParams.get('id');
    if (urlId) fetchOrder(urlId);
  }, []);

  const currentStepIndex = order
    ? STATUS_STEPS.findIndex(s => s.key === order.status)
    : -1;

  return (
    <div className="min-h-screen py-20 px-6 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-festival-gold">
          Track Your Order
        </h2>
        <p className="text-gray-500 text-sm">Enter your Order ID to see real-time status</p>
      </div>

      {/* Search Box */}
      <div className="glass-card p-5 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="order-search-input"
            type="text"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-festival-gold transition-colors font-mono"
            placeholder="e.g. CRK202612345"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrder(inputId)}
          />
          <motion.button
            id="order-search-btn"
            onClick={() => fetchOrder(inputId)}
            disabled={loading}
            className="btn-primary px-6 py-3 sm:py-0 flex items-center justify-center gap-2"
            whileTap={{ scale: 0.95 }}
          >
            <Search size={16} />
            {loading ? '...' : 'Track'}
          </motion.button>
        </div>
        {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}
      </div>

      {/* Order Details */}
      {order && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Order Info */}
          <div className="glass-card p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-500 text-xs mb-1">Order ID</p>
                <p className="text-festival-gold font-mono font-bold text-lg">{order.id}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Total Amount</p>
                  <p className="text-white font-bold text-xl">₹{Number(order.totalAmount).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => setShowBillModal(true)}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg text-sm text-white flex items-center gap-2 transition-colors"
                >
                  <FileDown size={16} />
                  View Bill
                </button>
              </div>
            </div>
            <div className="border-t border-white/10 pt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Customer</p>
                <p className="text-white font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Mobile</p>
                <p className="text-white font-medium">{order.mobile}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-xs">Delivery Address</p>
                <p className="text-white font-medium">{order.address}, {order.city} - {order.pincode}</p>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="glass-card p-6 md:p-8">
            <h3 className="text-lg font-bold mb-6 text-white">Order Status</h3>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-white/10 rounded-full" />
              <div className="space-y-8">
                {STATUS_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStepIndex;
                  const isActive = index === currentStepIndex;
                  return (
                    <div key={step.key} className="relative flex items-center gap-5 z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                        isActive ? 'bg-festival-blue text-white shadow-[0_0_15px_rgba(0,210,255,0.6)] border-2 border-white scale-110' :
                        isCompleted ? 'bg-festival-gold text-black shadow-[0_0_12px_rgba(255,215,0,0.5)]' :
                        'bg-black/50 border border-white/15 text-gray-600'
                      }`}>
                        <Icon size={16} />
                      </div>
                      {/* Connecting line */}
                      {isCompleted && index < STATUS_STEPS.length - 1 && (
                        <div className="absolute left-5 top-10 w-0.5 h-8 bg-festival-gold -z-10" />
                      )}
                      <div>
                        <h4 className={`font-bold ${isActive ? 'text-festival-blue' : isCompleted ? 'text-white' : 'text-gray-600'}`}>
                          {step.label}
                        </h4>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {isCompleted ? (isActive ? 'In Progress' : 'Completed') : 'Pending'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Items */}
          {order.items && order.items.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="font-bold mb-4 text-white">Items Ordered</h3>
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-300">
                    <span>{item.name} <span className="text-gray-600">×{item.quantity}</span></span>
                    <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      <BillPreviewModal 
        isOpen={showBillModal} 
        onClose={() => setShowBillModal(false)} 
        order={order} 
      />
    </div>
  );
};

export default OrderTracking;
