import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Menu, X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import LogoImage from '@/components/ui/LogoImage';

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Partial matching for Routes to keep it active for child pages
  const isActive = (path) => {
    if (path === '/') return router.pathname === '/';
    return router.pathname.startsWith(path);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Routes', path: '/routes' },
    { name: 'Services', path: '/services' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="bg-navy shadow-lg sticky top-0 z-50 border-b border-amber-500/20 bg-[#0F1419]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <LogoImage 
              size="medium" 
              className="rounded-lg border border-amber-500/30"
            />
            <span className="font-extrabold text-xl md:text-2xl text-white tracking-wide">One Way Taxi</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => router.push(link.path)}
                className={`text-sm font-bold tracking-wide transition-colors uppercase ${
                  isActive(link.path) 
                    ? 'text-[#FFD700]' 
                    : 'text-[#E8E8E8] hover:text-[#FFD700]'
                }`}
              >
                {link.name}
              </button>
            ))}
            <Button 
              variant="default" 
              size="sm" 
              className="bg-gold-gradient text-slate-900 font-bold hover:shadow-lg hover:shadow-amber-500/20 bg-[#FFD700] hover:bg-[#E5C100] border-none"
              onClick={() => router.push('/booking')}
            >
              BOOK NOW
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-4">
            <a href="tel:+917567575578" className="bg-amber-500/20 p-2 rounded-full text-[#FFD700]">
               <Phone className="h-5 w-5" />
            </a>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white p-1">
              {isMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0F1419] border-t border-[#2F3336]"
          >
            <nav className="flex flex-col p-4 gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    router.push(link.path);
                    setIsMenuOpen(false);
                  }}
                  className={`text-left text-lg font-bold py-2 ${
                     isActive(link.path) ? 'text-[#FFD700]' : 'text-[#E8E8E8]'
                  }`}
                >
                  {link.name}
                </button>
              ))}
              <Button 
                className="w-full bg-[#FFD700] text-[#0F1419] font-bold mt-4 hover:bg-[#E5C100]"
                onClick={() => {
                  router.push('/booking');
                  setIsMenuOpen(false);
                }}
              >
                BOOK A TAXI
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}