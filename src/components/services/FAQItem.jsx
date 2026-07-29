import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-[#161B22] hover:border-[#FFD700]/50 transition-colors">
      <button
        onClick={onClick}
        className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
      >
        <span className={`font-bold text-lg ${isOpen ? 'text-[#FFD700]' : 'text-white'} transition-colors`}>
          {question}
        </span>
        <ChevronDown 
          className={`w-5 h-5 text-[#FFD700] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-0 text-gray-400 leading-relaxed border-t border-white/5 mt-2">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}