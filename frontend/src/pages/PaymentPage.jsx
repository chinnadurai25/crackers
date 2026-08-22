import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Landmark, Copy, CheckCircle2, Smartphone, ShieldCheck, Building2, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../utils/apiConfig';

const PaymentPage = () => {
  const [copiedField, setCopiedField] = useState('');
  const [details, setDetails] = useState({
    accountName: 'Magical Crackers',
    bankName: 'Tamilnad Mercantile Bank',
    accountNumber: '194536383261127',
    ifscCode: 'TMBL0000194',
    gpayNumber: '6380037709',
    whatsappNumber: '6380037709',
    qrCodeUrl: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/settings`);
        const data = await res.json();
        if (data.success && data.settings) {
          setDetails({
            accountName: data.settings.accountName || 'Magical Crackers',
            bankName: data.settings.bankName || '',
            accountNumber: data.settings.accountNumber || '194536383261127',
            ifscCode: data.settings.ifscCode || 'TMBL0000194',
            gpayNumber: data.settings.gpayNumber || '6380037709',
            whatsappNumber: data.settings.whatsappNumber || data.settings.gpayNumber || '6380037709',
            qrCodeUrl: data.settings.qrCodeUrl || ''
          });
        }
      } catch (err) {
        console.error('Failed to load payment settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentSettings();
  }, []);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const getCleanPhone = (phone) => {
    if (!phone) return '916380037709';
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  const whatsappPhone = getCleanPhone(details.whatsappNumber || details.gpayNumber);

  return (
    <div className="min-h-screen py-12 px-6 flex items-center justify-center relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-2xl max-w-lg w-full relative shadow-2xl border border-white/10 bg-[#11111a]/80 backdrop-blur-xl"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-festival-gold to-festival-orange rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,215,0,0.4)]">
            <Landmark size={40} className="text-black" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Payment Details</h2>
          <p className="text-gray-400">Transfer your total amount to complete your order</p>
        </div>

        {/* QR Code Section (if uploaded by Admin) */}
        {details.qrCodeUrl && (
          <div className="bg-gradient-to-br from-festival-gold/20 to-festival-orange/10 p-1 rounded-2xl mb-8 border border-festival-gold/30 shadow-[0_0_30px_rgba(255,215,0,0.15)] text-center">
            <div className="bg-[#0f0f16] rounded-xl p-6 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-festival-gold/10 text-festival-gold rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-festival-gold/20">
                <QrCode size={14} /> Scan & Pay with Any UPI App
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-xl border-2 border-festival-gold/50 my-2 inline-block">
                <img
                  src={details.qrCodeUrl}
                  alt="Payment QR Code"
                  className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-lg"
                />
              </div>
              <p className="text-gray-400 text-xs mt-3 flex items-center justify-center gap-2 flex-wrap font-medium">
                <span className="bg-white/5 px-2 py-0.5 rounded text-white font-semibold">GPay</span>
                <span>•</span>
                <span className="bg-white/5 px-2 py-0.5 rounded text-white font-semibold">PhonePe</span>
                <span>•</span>
                <span className="bg-white/5 px-2 py-0.5 rounded text-white font-semibold">Paytm</span>
                <span>•</span>
                <span className="bg-white/5 px-2 py-0.5 rounded text-white font-semibold">BHIM UPI</span>
              </p>
            </div>
          </div>
        )}
        
        <div className="bg-gradient-to-br from-white/10 to-white/5 p-1 rounded-2xl mb-8 shadow-xl">
          <div className="bg-[#0f0f16] rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-bold">Account Name</p>
                <p className="text-white font-bold text-xl">{details.accountName}</p>
                {details.bankName && (
                  <p className="text-gray-400 text-xs mt-0.5">{details.bankName}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 group">
              <div className="min-w-0 flex-1">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-bold truncate">Account Number</p>
                <p className="text-festival-gold font-mono font-bold text-xl sm:text-2xl tracking-wider break-all">{details.accountNumber}</p>
              </div>
              <button 
                onClick={() => handleCopy(details.accountNumber, 'acc')}
                className="shrink-0 p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
                title="Copy Account Number"
              >
                {copiedField === 'acc' ? <CheckCircle2 size={24} className="text-green-400" /> : <Copy size={24} />}
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 group">
              <div className="min-w-0 flex-1">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-bold truncate">IFSC Code</p>
                <p className="text-festival-gold font-mono font-bold text-xl sm:text-2xl tracking-wider break-all">{details.ifscCode}</p>
              </div>
              <button 
                onClick={() => handleCopy(details.ifscCode, 'ifsc')}
                className="shrink-0 p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
                title="Copy IFSC Code"
              >
                {copiedField === 'ifsc' ? <CheckCircle2 size={24} className="text-green-400" /> : <Copy size={24} />}
              </button>
            </div>
            
            <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4 group">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="shrink-0 w-12 h-12 bg-white/5 rounded-full hidden sm:flex items-center justify-center border border-white/10">
                  <Smartphone size={24} className="text-gray-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-bold truncate">GPay / PhonePe / UPI</p>
                  <p className="text-white font-mono font-bold text-xl sm:text-2xl tracking-wider break-all">{details.gpayNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => handleCopy(details.gpayNumber, 'gpay')}
                className="shrink-0 p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
                title="Copy GPay Number"
              >
                {copiedField === 'gpay' ? <CheckCircle2 size={24} className="text-green-400" /> : <Copy size={24} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4 bg-festival-gold/10 p-5 rounded-2xl border border-festival-gold/20 mb-8">
          <ShieldCheck size={28} className="text-festival-gold shrink-0 mt-0.5" />
          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            Please share your payment screenshot via WhatsApp. <strong className="text-white block mt-1">Be sure to mention your Order ID!</strong>
          </p>
        </div>

        <div className="space-y-4">
          <a
            href={`https://wa.me/${whatsappPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_25px_rgba(37,211,102,0.5)] text-lg"
          >
            <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            Send Screenshot via WhatsApp
          </a>

          <Link
            to="/"
            className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center transition-colors border border-white/10 text-lg"
          >
            Return to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentPage;
