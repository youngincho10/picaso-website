import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion, useScroll, useTransform } from 'motion/react';

export const SayProblem = () => {
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll();
  
  // Animate the waveform from messy to clean as we scroll
  const messyOpacity = useTransform(scrollYProgress, [0.1, 0.3], [1, 0]);
  const cleanOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);

  return (
    <section id="say" className="py-32 bg-brand-bg-sec relative border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-say-primary/5 via-transparent to-transparent opacity-50" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-say-primary/10 border border-say-primary/20 text-say-primary text-sm font-medium tracking-wide mb-6">
              SAY Project
            </div>
            <h3 className="text-3xl md:text-5xl font-semibold tracking-tight text-white mb-6 leading-tight">
              {t.say.problem.title}
            </h3>
            <p className="text-xl text-white/60 font-light">
              {t.say.problem.subtitle}
            </p>
          </motion.div>

          <div className="order-1 lg:order-2 h-64 relative flex items-center justify-center">
            {/* Abstract Waveform Visual */}
            <div className="w-full flex items-center justify-center gap-1 h-32 relative">
              {[...Array(30)].map((_, i) => {
                const isCenter = i > 10 && i < 20;
                const height = isCenter ? 100 : Math.random() * 40 + 10;
                
                return (
                  <div key={i} className="relative w-2 h-full flex items-center justify-center">
                    {/* Messy Waveform */}
                    <motion.div 
                      style={{ opacity: messyOpacity }}
                      className="absolute w-full bg-white/20 rounded-full"
                      initial={{ height: height * (Math.random() * 2 + 0.5) }}
                      animate={{ 
                        height: [height, height * 1.5, height * 0.5, height],
                        y: [0, Math.random() * 20 - 10, Math.random() * -20 + 10, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    
                    {/* Clean Waveform */}
                    <motion.div 
                      style={{ opacity: cleanOpacity }}
                      className="absolute w-full bg-say-primary shadow-[0_0_10px_rgba(49,214,196,0.3)] rounded-full"
                      initial={{ height: height }}
                      animate={{ 
                        height: [height, height * 1.2, height * 0.8, height]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: i * 0.05
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
