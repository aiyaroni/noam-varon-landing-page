import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'דף הבית', href: '#home' },
    { name: 'שירותים', href: '#services' },
    { name: 'גלריה', href: '#gallery' },
    { name: 'אודות', href: '#about' },
  ];

  return (
    <header dir="rtl" className={`fixed top-0 w-full z-50 transition-custom border-b ${
      scrolled ? 'bg-[#0e0e0e]/80 backdrop-blur-xl border-white/5 shadow-[0_10px_30px_rgba(0,227,253,0.05)]' : 'bg-transparent border-transparent'
    }`}>
      <nav className="flex flex-row justify-between items-center px-8 py-6 w-full max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tighter text-white font-headline uppercase">
          NOAM VARON
        </div>

        <div className="hidden md:flex flex-row items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href}
              className="text-on-surface-variant font-medium hover:text-primary-container transition-custom font-headline uppercase tracking-tighter"
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <motion.a 
            href="#studio"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block bg-primary-container text-on-primary-container px-6 py-2 font-headline font-bold text-sm tracking-tighter transition-custom rounded"
          >
            הזמן תור
          </motion.a>
          
          <button 
            className="text-white md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-surface-container border-b border-white/5 md:hidden"
          >
            <div className="flex flex-col p-8 gap-6">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-xl font-bold uppercase tracking-tighter font-headline text-right"
                >
                  {link.name}
                </a>
              ))}
              <a 
                href="#studio"
                onClick={() => setIsOpen(false)}
                className="bg-primary-container text-on-primary-container px-6 py-4 font-bold uppercase tracking-tighter text-sm text-center rounded"
              >
                הזמן תור עכשיו
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
