import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { ImageGrid } from './components/ImageGrid';
import { generateProductImages } from './services/geminiService';
import { translations } from './constants/translations';
import { Language } from './types';
import { CONCEPTS, QUALITIES } from './constants/options';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [concept, setConcept] = useState<string>(CONCEPTS[0].id);
  const [quality, setQuality] = useState<string>(QUALITIES[0].id);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isObjectLocked, setIsObjectLocked] = useState<boolean>(true);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const t = useCallback((key: keyof typeof translations.en) => {
    return translations[language][key] || key;
  }, [language]);

  const handleGenerate = async () => {
    if (!referenceFile) {
      setError(t('error_no_image'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const selectedConcept = CONCEPTS.find(c => c.id === concept)?.label.en || concept;
      const selectedQuality = QUALITIES.find(q => q.id === quality)?.label.en || quality;
      
      const images = await generateProductImages(referenceFile, selectedConcept, selectedQuality, customPrompt, language, isObjectLocked);
      setGeneratedImages(images);
    } catch (err) {
      console.error(err);
      setError(t('error_generation_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50 text-rose-900 flex flex-col">
      <Header language={language} setLanguage={setLanguage} t={t} />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3 xl:w-1/4 lg:sticky lg:top-8 self-start">
          <ControlPanel
            setReferenceFile={setReferenceFile}
            concept={concept}
            setConcept={setConcept}
            quality={quality}
            setQuality={setQuality}
            customPrompt={customPrompt}
            setCustomPrompt={setCustomPrompt}
            isObjectLocked={isObjectLocked}
            setIsObjectLocked={setIsObjectLocked}
            handleGenerate={handleGenerate}
            isLoading={isLoading}
            t={t}
            language={language}
          />
        </div>
        <div className="lg:w-2/3 xl:w-3/4">
          <ImageGrid
            isLoading={isLoading}
            generatedImages={generatedImages}
            error={error}
            t={t}
          />
        </div>
      </main>
    </div>
  );
};

export default App;