import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion } from 'motion/react';
import { knokStatus } from '../../data/projectStatus';
import { ArrowRight, CheckCircle2, CircleDashed } from 'lucide-react';

export const KnokSolution = () => {
  const { t, language } = useLanguage();

  return (
    <section className="py-24 bg-brand-bg-main relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h3 className="text-2xl md:text-4xl font-semibold tracking-tight text-white mb-4">
            {t.knok.solution.title}
          </h3>
          <p className="text-sm text-white/40 max-w-2xl mx-auto">
            {t.knok.problem.disclaimer}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Current Workflow */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-8 rounded-3xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <CheckCircle2 className="w-6 h-6 text-knok-primary" />
              <h4 className="text-xl font-medium text-white">{t.knok.solution.currentTitle}</h4>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left mb-10">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 w-full">
                <span className="text-sm text-white/60">Sensor</span>
              </div>
              <ArrowRight className="w-5 h-5 text-white/20 hidden sm:block rotate-90 sm:rotate-0" />
              <div className="flex-1 bg-knok-primary/10 border border-knok-primary/30 rounded-2xl p-4 w-full">
                <span className="text-sm text-knok-primary">ESP32-S3</span>
              </div>
              <ArrowRight className="w-5 h-5 text-white/20 hidden sm:block rotate-90 sm:rotate-0" />
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 w-full">
                <span className="text-sm text-white/60">BLE/Wi-Fi</span>
              </div>
              <ArrowRight className="w-5 h-5 text-white/20 hidden sm:block rotate-90 sm:rotate-0" />
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 w-full">
                <span className="text-sm text-white/60">App Status</span>
              </div>
            </div>

            <ul className="space-y-4">
              {knokStatus.current.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-white/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-knok-primary mt-2 flex-shrink-0" />
                  <span className="text-sm md:text-base leading-relaxed">
                    {language === 'ko' ? item.ko : item.en}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Future Workflow */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-8 rounded-3xl border-dashed border-white/20"
          >
            <div className="flex items-center gap-3 mb-8">
              <CircleDashed className="w-6 h-6 text-white/40" />
              <h4 className="text-xl font-medium text-white/60">{t.knok.solution.futureTitle}</h4>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-10 justify-center sm:justify-start">
               <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/50">Event Detect</div>
               <ArrowRight className="w-4 h-4 text-white/20" />
               <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/50">Auto Record</div>
               <ArrowRight className="w-4 h-4 text-white/20" />
               <div className="bg-knok-primary/10 border border-knok-primary/30 rounded-xl px-3 py-2 text-xs text-knok-primary">AI Classify</div>
               <ArrowRight className="w-4 h-4 text-white/20" />
               <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/50">Report</div>
            </div>

            <ul className="space-y-4">
              {knokStatus.future.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-white/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2 flex-shrink-0" />
                  <span className="text-sm md:text-base leading-relaxed">
                    {language === 'ko' ? item.ko : item.en}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
