import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Navigation = () => {
  const { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  const navLinks = [
    { name: t.nav.home, href: '#home' },
    { name: t.nav.say, href: '#say' },
    { name: t.nav.knok, href: '#knok' },
    { name: t.nav.team, href: '#team' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-brand-bg-main/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <a href="#home" className="text-xl font-display font-bold tracking-widest text-white hover:text-white/80 transition-colors">
            PICASO
          </a>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors tracking-wide"
            >
              {link.name}
            </a>
          ))}
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
            aria-label="Toggle language"
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'ko' ? 'EN' : 'KO'}</span>
          </button>
        </nav>

        {/* Mobile Nav Toggle */}
        <button 
          className="md:hidden p-2 text-white/60 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          <div className="w-6 flex flex-col gap-1.5">
            <span className={`h-0.5 bg-current transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`h-0.5 bg-current transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 bg-current transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-brand-bg-sec border-b border-white/10 p-6 md:hidden flex flex-col gap-4 shadow-2xl"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-lg font-medium text-white/80 hover:text-white py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="h-px bg-white/10 my-2" />
            <button 
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 text-lg font-medium text-white/80 hover:text-white py-2"
            >
              <Globe className="w-5 h-5" />
              <span>{language === 'ko' ? 'Switch to English' : '한국어로 변경'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
