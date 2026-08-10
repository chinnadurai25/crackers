import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { generateBill } from '../utils/generateBill';

const BillPreviewModal = ({ isOpen, onClose, order }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [doc, setDoc] = useState(null);

  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && order) {
      try {
        setError(null);
        const generatedDoc = generateBill(order, false); // generate without opening
        setDoc(generatedDoc);
        // Using data URI is more reliable for iframes across different browsers
        const dataUri = generatedDoc.output('datauristring');
        setPdfUrl(dataUri);
      } catch (err) {
        console.error("Failed to generate PDF:", err);
        setError("Could not load preview.");
      }
    } else {
      setPdfUrl(null);
      setDoc(null);
      setError(null);
    }
  }, [isOpen, order]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (doc) {
      doc.save(`Magical_Crackers_Bill_${order.id || order.orderId}.pdf`);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-festival-dark border border-white/10 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
            <h3 className="text-xl font-bold text-white">Bill Preview</h3>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleDownload}
                className="btn-primary py-2 px-4 flex items-center gap-2 text-sm"
              >
                <Download size={16} />
                Download PDF
              </button>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 bg-gray-900 w-full flex items-center justify-center">
            {error ? (
              <div className="text-red-400 text-center">
                <p className="mb-2">⚠️ {error}</p>
                <p className="text-sm text-gray-500">Check the console for details.</p>
              </div>
            ) : pdfUrl ? (
              <iframe 
                src={pdfUrl} 
                className="w-full h-full border-none"
                title="Bill Preview"
              />
            ) : (
              <div className="text-gray-500">
                Generating preview...
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BillPreviewModal;
