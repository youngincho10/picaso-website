import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';

export const PicasoIntro = () => {
  const { t } = useLanguage();

  return (
    <section className="py-32 bg-brand-bg-main relative z-10 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl font-display font-medium text-white/80 mb-6">{t.picaso.title}</h2>
          <p className="text-xl md:text-2xl text-white leading-relaxed font-light mb-12">
            {t.picaso.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2" />
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2" />

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="p-8 flex flex-col items-center justify-center text-center"
          >
            <div className="w-12 h-12 rounded-full bg-say-primary/10 flex items-center justify-center mb-6">
              <div className="w-4 h-4 rounded-full bg-say-primary shadow-[0_0_15px_rgba(49,214,196,0.5)]" />
            </div>
            <p className="text-lg text-white/70 leading-relaxed font-light">
              {t.picaso.philosophySay}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="p-8 flex flex-col items-center justify-center text-center"
          >
            <div className="w-12 h-12 rounded-full bg-knok-primary/10 flex items-center justify-center mb-6">
              <div className="w-4 h-4 rounded-full bg-knok-primary shadow-[0_0_15px_rgba(255,122,61,0.5)]" />
            </div>
            <p className="text-lg text-white/70 leading-relaxed font-light">
              {t.picaso.philosophyKnok}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
