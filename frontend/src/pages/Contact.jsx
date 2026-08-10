import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Building2 } from 'lucide-react';

const Contact = () => {
  const contactDetails = [
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Company Name",
      content: "Magical Crackers",
      delay: 0.1
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Address",
      content: "3/57A15/C2, RAMACHANDRAPURAM, ANAIYUR SOUTH VILLAGE, SIVAKASI, Virudhunagar - 626124",
      delay: 0.2
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      content: "ke.info16@gmail.com",
      link: "mailto:ke.info16@gmail.com",
      delay: 0.3
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Mobile",
      content: "6380037709",
      link: "tel:+916380037709",
      delay: 0.4
    }
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-festival-gold to-festival-orange">
            Get in Touch
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Have questions or want to place a bulk order? We'd love to hear from you. Reach out to us using the contact details below.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {contactDetails.map((detail, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: detail.delay }}
            >
              {detail.link ? (
                <a
                  href={detail.link}
                  className="glass-card p-8 rounded-2xl border border-white/10 hover:border-festival-gold/50 transition-all duration-300 group block cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-festival-gold/10 rounded-xl text-festival-gold group-hover:scale-110 group-hover:bg-festival-gold group-hover:text-black transition-all duration-300">
                      {detail.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{detail.title}</h3>
                      <p className="text-gray-300 group-hover:text-festival-gold transition-colors text-base md:text-lg">
                        {detail.content}
                      </p>
                    </div>
                  </div>
                </a>
              ) : (
                <div className="glass-card p-8 rounded-2xl border border-white/10 hover:border-festival-gold/50 transition-all duration-300 group">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-festival-gold/10 rounded-xl text-festival-gold group-hover:scale-110 group-hover:bg-festival-gold group-hover:text-black transition-all duration-300">
                      {detail.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{detail.title}</h3>
                      <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                        {detail.content}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;
