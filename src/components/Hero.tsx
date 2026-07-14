import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowDown } from 'lucide-react';

export const Hero = () => {
  const { t } = useLanguage();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background abstract elements and images */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          style={{ y, opacity }}
          className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-say-primary/5 blur-[120px] mix-blend-screen"
        />
        <motion.div 
          style={{ y: useTransform(scrollY, [0, 500], [0, -100]), opacity }}
          className="absolute bottom-[10%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-knok-primary/5 blur-[100px] mix-blend-screen"
        />

        {/* Parallax Images */}
        <motion.div
          style={{ y: useTransform(scrollY, [0, 500], [0, -200]), opacity }}
          className="absolute top-[15%] left-[5%] md:left-[10%] w-64 md:w-96 opacity-30 mix-blend-lighten"
        >
          <img src="/SAY_concept.jpeg" alt="SAY Concept" className="w-full h-auto object-contain blur-[2px]" />
        </motion.div>
        
        <motion.div
          style={{ y: useTransform(scrollY, [0, 500], [0, -150]), opacity }}
          className="absolute bottom-[20%] right-[5%] md:right-[10%] w-64 md:w-96 opacity-30 mix-blend-lighten"
        >
          <img src="/KNOK_concept.jpeg" alt="KNOK Concept" className="w-full h-auto object-contain blur-[2px]" />
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full z-10">
        <div className="text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8 inline-block"
          >
            <img src="/PICASO.png" alt="PICASO Logo" className="h-16 md:h-20 object-contain mb-8 filter invert mx-auto" />
            <div className="w-px h-12 bg-gradient-to-b from-white/0 via-white/20 to-white/0 mx-auto" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white max-w-4xl leading-[1.15]"
          >
            {t.hero.title}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="mt-8 text-lg md:text-xl text-white/60 max-w-2xl font-light leading-relaxed"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            className="mt-12 flex flex-col sm:flex-row gap-4"
          >
            <a 
              href="#say"
              className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-say-primary/30 transition-all duration-300 group flex items-center justify-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-say-primary" />
              {t.hero.scrollToSay}
            </a>
            <a 
              href="#knok"
              className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-knok-primary/30 transition-all duration-300 group flex items-center justify-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-knok-primary" />
              {t.hero.scrollToKnok}
            </a>
          </motion.div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity"
      >
        <span className="text-xs uppercase tracking-widest text-white/40">Scroll</span>
        <ArrowDown className="w-4 h-4 text-white/40 animate-bounce" />
      </motion.div>
    </section>
  );
};
