import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion } from 'motion/react';

export const KnokProblem = () => {
  const { t } = useLanguage();

  return (
    <section id="knok" className="py-32 bg-brand-bg-sec relative border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-knok-primary/5 via-transparent to-transparent opacity-50" />
      
      {/* Abstract Apartment Visual Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[200px]">
           {/* Visual impact wave */}
           <motion.div 
              initial={{ scaleY: 0, opacity: 0 }}
              whileInView={{ scaleY: [0, 1, 0], opacity: [0, 0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-1/3 w-32 h-full bg-gradient-to-b from-knok-primary/0 via-knok-primary to-knok-primary/0 blur-2xl origin-top"
           />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-knok-primary/10 border border-knok-primary/20 text-knok-primary text-sm font-medium tracking-wide mb-6">
            KNOK Project
          </div>
          <h3 className="text-3xl md:text-5xl font-semibold tracking-tight text-white mb-6 leading-tight">
            {t.knok.problem.title}
          </h3>
          <p className="text-xl text-white/60 font-light mb-12">
            {t.knok.problem.subtitle}
          </p>
        </div>
      </div>
    </section>
  );
};
