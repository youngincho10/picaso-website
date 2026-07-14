import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion } from 'motion/react';

export const SayProduct = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-brand-bg-main relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h3 className="text-2xl md:text-4xl font-semibold tracking-tight text-white mb-4">
            {t.say.product.title}
          </h3>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden glass-panel group flex items-center justify-center bg-black"
          >
            <img src="/SAY_concept.jpeg" alt="SAY Concept" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
              <span className="text-sm font-medium text-white/80">{t.say.product.conceptLabel}</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-6">
             <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative aspect-[9/19] rounded-[2rem] overflow-hidden glass-panel border-[6px] border-[#222]"
            >
              <img src="/poster_1.png" alt="SAY App UI" className="w-full h-full object-cover object-left" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative aspect-[9/19] rounded-[2rem] overflow-hidden glass-panel border-[6px] border-[#222] translate-y-8"
            >
              <img src="/poster_1.png" alt="SAY App UI 2" className="w-full h-full object-cover object-right" />
            </motion.div>
          </div>
        </div>

        {/* Metrics */}
        <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-say-primary/10 rounded-full blur-[80px]" />
          
          <div className="grid md:grid-cols-2 gap-12 relative z-10">
            <div>
              <div className="text-5xl md:text-7xl font-display font-light text-say-primary mb-4">
                {t.say.metrics.accuracy.value}
              </div>
              <h4 className="text-xl font-medium text-white mb-2">{t.say.metrics.accuracy.label}</h4>
              <p className="text-white/60">{t.say.metrics.accuracy.detail}</p>
            </div>
            <div>
              <div className="text-5xl md:text-7xl font-display font-light text-white mb-4">
                {t.say.metrics.speed.value}
              </div>
              <h4 className="text-xl font-medium text-white mb-2">{t.say.metrics.speed.label}</h4>
              <p className="text-white/60">{t.say.metrics.speed.detail}</p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-xs md:text-sm text-white/40 leading-relaxed">
              {t.say.metrics.disclaimer}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
