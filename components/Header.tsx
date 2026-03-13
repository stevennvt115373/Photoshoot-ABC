import React from 'react';
import { LanguageToggle } from './LanguageToggle';
import { Language } from '../types';
import { translations } from '../constants/translations';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

export const Header: React.FC<HeaderProps> = ({ language, setLanguage, t }) => {
  return (
    <header className="bg-rose-100/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-rose-500" viewBox="0 0 24 24">
                <path fill="currentColor" d="M8.578 21.422a.5.5 0 0 1-.498-.543l.63-3.774a.5.5 0 0 1 .498-.457h6.584a.5.5 0 0 1 .498.457l.63 3.774a.5.5 0 0 1-.498.543zm1.187-5.765a2 2 0 0 1-1.99-2.203L8.4 4.545a.5.5 0 0 1 .498-.457h6.195a.5.5 0 0 1 .498.457l.629 8.909a2 2 0 0 1-1.99 2.203zM7 3.088A2.5 2.5 0 0 1 9.49 1h5.02A2.5 2.5 0 0 1 17 3.5v.043a.5.5 0 0 1-.498.457H7.498A.5.5 0 0 1 7 3.545z"/>
            </svg>
          <div>
            <h1 className="text-2xl font-bold text-rose-900">{t('app_title')}</h1>
            <p className="text-sm text-rose-700">{t('app_subtitle')}</p>
          </div>
        </div>
        <LanguageToggle selectedLang={language} setLanguage={setLanguage} />
      </div>
    </header>
  );
};