import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhatsAppButton() {
  const handleClick = () => {
    const message = encodeURIComponent("Hi, I want to book a taxi. Please assist me.");
    window.open(`https://wa.me/917567575578?text=${message}`, '_blank');
  };

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-2xl hover:bg-[#20bd5a] transition-all duration-300 group flex items-center gap-2 overflow-hidden"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-8 h-8 fill-current" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-[max-width] duration-500 ease-in-out whitespace-nowrap font-bold">
        Chat With Us
      </span>
    </motion.button>
  );
}