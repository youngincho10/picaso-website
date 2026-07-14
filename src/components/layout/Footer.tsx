import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { contact } from '../../data/contact';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-brand-bg-main pt-24 pb-12 border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-24">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-4xl font-display font-medium text-white mb-8">
              {t.footer.message}
            </h2>
            <div className="flex flex-wrap gap-4">
              <a href="#say" className="px-6 py-3 rounded-full bg-say-primary/10 text-say-primary border border-say-primary/20 hover:bg-say-primary/20 transition-colors text-sm">
                {t.footer.btnSay}
              </a>
              <a href="#knok" className="px-6 py-3 rounded-full bg-knok-primary/10 text-knok-primary border border-knok-primary/20 hover:bg-knok-primary/20 transition-colors text-sm">
                {t.footer.btnKnok}
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-[200px]">
            <a 
              href={contact.phoneHref}
              className="flex items-center justify-between p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors group"
            >
              <span className="text-sm text-white/80">{contact.lead}</span>
              <span className="text-xs text-white/40 group-hover:text-white transition-colors">{contact.phone}</span>
            </a>
            <a 
              href={`mailto:${contact.email}`}
              className="flex items-center justify-between p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors group"
            >
              <span className="text-sm text-white/80">Email</span>
              <span className="text-xs text-white/40 group-hover:text-white transition-colors">{contact.email}</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-white/10">
          <span className="text-xl font-display font-bold tracking-widest text-white/30">PICASO</span>
          <span className="text-sm text-white/40">{t.footer.copyright}</span>
        </div>

      </div>
    </footer>
  );
};
