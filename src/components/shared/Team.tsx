import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { team } from '../../data/team';
import { motion } from 'motion/react';
import { Circle, Square, Triangle } from 'lucide-react';

export const Team = () => {
  const { t, language } = useLanguage();

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'circle': return <Circle className="w-8 h-8 text-white/40" strokeWidth={1} />;
      case 'triangle': return <Triangle className="w-8 h-8 text-white/40" strokeWidth={1} />;
      case 'square': return <Square className="w-8 h-8 text-white/40" strokeWidth={1} />;
      default: return <Circle className="w-8 h-8 text-white/40" strokeWidth={1} />;
    }
  };

  return (
    <section id="team" className="py-32 bg-brand-bg-sec relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="text-center mb-24">
          <h2 className="text-sm font-display tracking-[0.3em] text-white/50 uppercase mb-8">
            {t.team.title}
          </h2>
          <p className="text-2xl md:text-3xl text-white font-light max-w-3xl mx-auto leading-relaxed">
            "{t.team.philosophy}"
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-10 rounded-3xl flex flex-col items-center text-center group hover:bg-white/10 transition-colors"
            >
              <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center mb-6 group-hover:border-white/30 transition-colors bg-brand-bg-main">
                {getIcon(member.abstractIcon)}
              </div>
              <h3 className="text-xl font-medium text-white mb-2">
                {language === 'ko' ? member.nameKo : member.nameEn}
              </h3>
              <p className="text-sm text-white/60">
                {language === 'ko' ? member.roleKo : member.roleEn}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
