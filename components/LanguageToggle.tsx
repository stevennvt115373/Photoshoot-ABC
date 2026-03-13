import React from 'react';
import { Language } from '../types';

interface LanguageToggleProps {
  selectedLang: Language;
  setLanguage: (lang: Language) => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ selectedLang, setLanguage }) => {
  const inactiveClass = "text-rose-700 hover:text-rose-900";
  const activeClass = "text-rose-900 font-semibold bg-white/50";

  return (
    <div className="flex items-center space-x-2 bg-rose-200 p-1 rounded-full">
      <button 
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedLang === 'en' ? activeClass : inactiveClass}`}
      >
        EN
      </button>
      <div className="w-px h-4 bg-rose-300"></div>
      <button 
        onClick={() => setLanguage('vi')}
        className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedLang === 'vi' ? activeClass : inactiveClass}`}
      >
        VI
      </button>
    </div>
  );
};