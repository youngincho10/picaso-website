import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion } from 'motion/react';

export const KnokProduct = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-brand-bg-main relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h3 className="text-2xl md:text-4xl font-semibold tracking-tight text-white mb-4">
            {t.knok.product.title}
          </h3>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden glass-panel group flex items-center justify-center bg-black"
          >
            <img src="/poster_3.png" alt="Current Prototype" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity object-left" />
            <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
              <span className="text-sm font-medium text-white/80">{t.knok.product.currentLabel}</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden glass-panel group border-dashed border-white/20 flex items-center justify-center bg-black"
          >
            <img src="/KNOK_concept.jpeg" alt="Concept Render" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
              <span className="text-sm font-medium text-white/80">{t.knok.product.futureLabel}</span>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
