import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Hero from './components/Hero';
import ProductCatalog from './pages/ProductCatalog';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import AdminPanel from './pages/AdminPanel';
import Contact from './pages/Contact';
import SafetyTips from './pages/SafetyTips';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cart from './components/Cart';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen flex flex-col relative overflow-hidden">
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1a2e] via-[#0a0a0f] to-black -z-50"></div>

          <Navbar onCartClick={() => setIsCartOpen(true)} />

          <main className="flex-grow pt-20">
            <Routes>
              <Route path="/" element={<><Hero /><ProductCatalog /></>} />
              <Route path="/products" element={<ProductCatalog />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/tracking" element={<OrderTracking />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/safety-tips" element={<SafetyTips />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </main>

          <Footer />

          <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
