import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Zap } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#11111a] border-t border-white/10 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand & About */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div className="w-9 h-9 bg-gradient-to-br from-festival-gold to-festival-orange rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(255,215,0,0.5)] shrink-0">
                <Zap size={18} className="text-black" fill="black" />
              </div>
              <span className="text-xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-festival-gold to-festival-orange">
                MAGICAL CRACKERS
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Experience the magic of festivals with our premium, safe, and high-quality crackers. Lighting up your celebrations with joy and brilliance.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-festival-gold/20 hover:text-festival-gold transition-all duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-festival-gold/20 hover:text-festival-gold transition-all duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-festival-gold/20 hover:text-festival-gold transition-all duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold text-white tracking-wide">Quick Links</h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-festival-gold text-sm transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-festival-gold/50"></span> Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-festival-gold text-sm transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-festival-gold/50"></span> Shop Products
                </Link>
              </li>
              <li>
                <Link to="/tracking" className="text-gray-400 hover:text-festival-gold text-sm transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-festival-gold/50"></span> Track Order
                </Link>
              </li>
              <li>
                <Link to="/safety-tips" className="text-gray-400 hover:text-festival-gold text-sm transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-festival-gold/50"></span> Safety Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold text-white tracking-wide">Support</h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-festival-gold text-sm transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-festival-gold/50"></span> Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold text-white tracking-wide">Contact Us</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3 group">
                <MapPin className="text-festival-gold shrink-0 mt-0.5 group-hover:scale-110 transition-transform" size={18} />
                <span className="text-gray-400 text-sm leading-relaxed">
                  3/57A15/C2, RAMACHANDRAPURAM, ANAIYUR SOUTH VILLAGE, SIVAKASI, Virudhunagar - 626124
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <Phone className="text-festival-gold shrink-0 group-hover:scale-110 transition-transform" size={18} />
                <a href="tel:+916380037709" className="text-gray-400 hover:text-festival-gold text-sm transition-colors">
                  +91 6380037709
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <Mail className="text-festival-gold shrink-0 group-hover:scale-110 transition-transform" size={18} />
                <a href="mailto:ke.info16@gmail.com" className="text-gray-400 hover:text-festival-gold text-sm transition-colors">
                  ke.info16@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} Magical Crackers. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            Made with <span className="text-red-500 animate-pulse">❤</span> in Sivakasi
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
