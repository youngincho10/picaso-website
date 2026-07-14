import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion, useScroll, useTransform } from 'motion/react';

export const SharedPhilosophy = () => {
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll();

  return (
    <section className="py-32 bg-brand-bg-main relative border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <h3 className="text-3xl md:text-5xl font-display font-medium text-white mb-6">
            {t.shared.title}
          </h3>
          <p className="text-xl text-white/60 font-light">
            {t.shared.description}
          </p>
        </motion.div>
        
        {/* Abstract Meeting Point Visual */}
        <div className="relative h-64 flex items-center justify-center max-w-4xl mx-auto">
          {/* SAY Waveform from Left */}
          <motion.div 
            className="absolute left-0 w-1/2 h-full flex items-center justify-end pr-8"
            initial={{ opacity: 0, x: "-100%" }}
            whileInView={{ opacity: 1, x: "0%" }}
            viewport={{ once: false, margin: "0px 0px -200px 0px" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <div className="flex items-center gap-1 h-16">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-say-primary rounded-full shadow-[0_0_10px_rgba(49,214,196,0.3)]"
                  animate={{ height: [10, Math.random() * 50 + 10, 10] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
          </motion.div>

          {/* KNOK Waveform from Right */}
          <motion.div 
            className="absolute right-0 w-1/2 h-full flex items-center justify-start pl-8"
            initial={{ opacity: 0, x: "100%" }}
            whileInView={{ opacity: 1, x: "0%" }}
            viewport={{ once: false, margin: "0px 0px -200px 0px" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <div className="flex items-center gap-1 h-16">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 bg-knok-primary rounded-sm shadow-[0_0_10px_rgba(255,122,61,0.3)]"
                  animate={{ 
                    height: [10, Math.random() * 40 + 20, 10],
                    scaleY: [1, Math.random() * 2 + 0.5, 1] 
                  }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.05 }}
                />
              ))}
            </div>
          </motion.div>

          {/* Meeting Point: PICASO */}
          <motion.div 
            className="absolute z-10 w-24 h-24 rounded-full glass-panel flex items-center justify-center border-white/20"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
          >
            <span className="font-display font-bold tracking-widest text-white">PICASO</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
