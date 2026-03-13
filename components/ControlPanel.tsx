import React, { useState, useCallback } from 'react';
import { translations } from '../constants/translations';
import { CONCEPTS, QUALITIES } from '../constants/options';
import { Language } from '../types';

interface ControlPanelProps {
  setReferenceFile: (file: File | null) => void;
  concept: string;
  setConcept: (concept: string) => void;
  quality: string;
  setQuality: (quality: string) => void;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
  isObjectLocked: boolean;
  setIsObjectLocked: (locked: boolean) => void;
  handleGenerate: () => void;
  isLoading: boolean;
  t: (key: keyof typeof translations.en) => string;
  language: Language;
}

const ControlStep: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2">
    <h3 className="text-md font-semibold text-rose-800">{title}</h3>
    {children}
  </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({
  setReferenceFile,
  concept,
  setConcept,
  quality,
  setQuality,
  customPrompt,
  setCustomPrompt,
  isObjectLocked,
  setIsObjectLocked,
  handleGenerate,
  isLoading,
  t,
  language
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [setReferenceFile]);

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg space-y-6">
      <ControlStep title={t('step1_title')}>
        <>
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="border-2 border-dashed border-rose-300 rounded-lg p-6 text-center hover:border-rose-500 transition-colors">
              {preview ? (
                <img src={preview} alt="Reference preview" className="mx-auto max-h-40 rounded-md object-contain"/>
              ) : (
                <div className="flex flex-col items-center">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  <p className="mt-2 text-sm text-rose-600">{t('step1_instruction')}</p>
                </div>
              )}
            </div>
          </label>
          <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          <div className="mt-4 bg-rose-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <label htmlFor="object-lock-toggle" className="text-sm font-medium text-rose-800 cursor-pointer">{t('lock_object_title')}</label>
              <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isObjectLocked} onChange={(e) => setIsObjectLocked(e.target.checked)} id="object-lock-toggle" className="sr-only peer" />
                <div className="w-11 h-6 bg-rose-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-rose-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-rose-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </div>
            </div>
            <p className="text-xs text-rose-600 mt-1">{t('lock_object_description')}</p>
          </div>
        </>
      </ControlStep>
      
      <ControlStep title={t('step2_title')}>
        <select value={concept} onChange={(e) => setConcept(e.target.value)} className="w-full bg-rose-50 border border-rose-300 text-rose-900 rounded-md p-2 focus:ring-rose-500 focus:border-rose-500">
          {CONCEPTS.map(c => <option key={c.id} value={c.id}>{c.label[language]}</option>)}
        </select>
      </ControlStep>
      
      <ControlStep title={t('step3_title')}>
        <select value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full bg-rose-50 border border-rose-300 text-rose-900 rounded-md p-2 focus:ring-rose-500 focus:border-rose-500">
          {QUALITIES.map(q => <option key={q.id} value={q.id}>{q.label[language]}</option>)}
        </select>
      </ControlStep>
      
      <ControlStep title={t('step4_title')}>
        <textarea 
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder={t('step4_placeholder')}
          rows={3}
          className="w-full bg-rose-50 border border-rose-300 text-rose-900 rounded-md p-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
        />
      </ControlStep>
      
      <button 
        onClick={handleGenerate} 
        disabled={isLoading}
        className="w-full bg-rose-600 text-white font-bold py-3 px-4 rounded-md hover:bg-rose-700 disabled:bg-rose-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isLoading && <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
        {isLoading ? t('generating_button') : t('generate_button')}
      </button>
    </div>
  );
};