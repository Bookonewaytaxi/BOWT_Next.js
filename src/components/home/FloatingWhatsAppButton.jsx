import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FloatingWhatsAppButton() {
  const openWhatsApp = () => {
    const message = encodeURIComponent("Hi, I want to inquire about a One Way Taxi booking.");
    window.open(`https://wa.me/917567575578?text=${message}`, '_blank');
  };

  return (
    <motion.button
      onClick={openWhatsApp}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer group"
      aria-label="Chat on WhatsApp"
    >
      <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-20 group-hover:opacity-40"></div>
      <MessageCircle className="h-8 w-8 relative z-10" />
    </motion.button>
  );
}