import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion } from 'motion/react';

export const KnokStructure = () => {
  const { t } = useLanguage();
  const components = [
    { key: 'vibration', label: t.knok.structure.components.vibration, yOffset: -60 },
    { key: 'mic', label: t.knok.structure.components.mic, yOffset: -40 },
    { key: 'mcu', label: t.knok.structure.components.mcu, yOffset: -20 },
    { key: 'power', label: t.knok.structure.components.power, yOffset: 0 },
    { key: 'usb', label: t.knok.structure.components.usb, yOffset: 20 },
    { key: 'mount', label: t.knok.structure.components.mount, yOffset: 40 },
    { key: 'case', label: t.knok.structure.components.case, yOffset: 60 },
  ];

  return (
    <section className="py-24 bg-brand-bg-sec relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h3 className="text-2xl md:text-4xl font-semibold tracking-tight text-white mb-4">
            {t.knok.structure.title}
          </h3>
        </div>

        <div className="max-w-3xl mx-auto h-[600px] relative flex justify-center items-center">
          {/* Exploded View Diagram 2D representation */}
          <div className="relative w-full max-w-sm h-full flex flex-col items-center justify-center gap-6">
            <div className="absolute inset-0 flex justify-center">
              <div className="w-px h-full bg-gradient-to-b from-transparent via-knok-primary/30 to-transparent absolute" />
            </div>
            
            {components.map((comp, idx) => (
              <motion.div
                key={comp.key}
                initial={{ opacity: 0, y: 0 }}
                whileInView={{ opacity: 1, y: comp.yOffset }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                className="relative z-10 w-full flex items-center"
              >
                <div className={`flex-1 flex ${idx % 2 === 0 ? 'justify-end pr-8' : 'justify-start pl-8 order-2'}`}>
                  <div className="glass-panel px-4 py-2 rounded-lg text-sm text-white/80 whitespace-nowrap">
                    {comp.label}
                  </div>
                </div>
                <div className={`w-16 h-px bg-white/20 ${idx % 2 === 0 ? '' : 'order-1'}`} />
                <div className={`w-32 h-12 bg-white/10 rounded-xl border border-white/20 shadow-xl backdrop-blur-sm flex items-center justify-center ${idx % 2 === 0 ? '' : 'order-1'}`}>
                  {/* Abstract representation of the part */}
                  <div className="w-1/2 h-1/2 bg-white/5 rounded" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
