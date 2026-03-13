import React from 'react';
import { Spinner } from './Spinner';
import { translations } from '../constants/translations';

// This is a global variable from the JSZip CDN script in index.html
declare var JSZip: any;

interface ImageGridProps {
  isLoading: boolean;
  generatedImages: string[];
  error: string | null;
  t: (key: keyof typeof translations.en) => string;
}

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

export const ImageGrid: React.FC<ImageGridProps> = ({ isLoading, generatedImages, error, t }) => {
    
  const handleDownloadSingle = (base64Data: string, index: number) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64Data}`;
    link.download = `product_image_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    if (typeof JSZip === 'undefined') {
      console.error('JSZip not loaded!');
      return;
    }
    const zip = new JSZip();
    generatedImages.forEach((base64, index) => {
      zip.file(`product_image_${index + 1}.png`, base64, { base64: true });
    });

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'product_shoot.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch(err) {
      console.error("Error creating zip file", err);
    }
  };
  
  const hasResults = generatedImages.length > 0;
    
  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 md:p-6 rounded-lg min-h-[500px] flex flex-col shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{t('results_title')}</h2>
        {hasResults && (
          <button 
            onClick={handleDownloadAll}
            className="bg-rose-600 text-white text-sm font-semibold py-2 px-4 rounded-md hover:bg-rose-700 transition-colors flex items-center gap-2"
          >
            <DownloadIcon /> {t('download_all')}
          </button>
        )}
      </div>

      {error && <div className="text-center text-red-800 bg-red-100 p-4 rounded-md">{error}</div>}

      <div className="flex-grow grid grid-cols-2 md:grid-cols-3 gap-4">
        {isLoading && Array.from({ length: 6 }).map((_, i) => <Spinner key={i} />)}
        
        {!isLoading && !hasResults && !error && (
          <div className="col-span-2 md:col-span-3 flex items-center justify-center text-rose-500">
            {t('results_placeholder')}
          </div>
        )}
        
        {hasResults && generatedImages.map((imgSrc, index) => (
          <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-rose-100">
            <img src={`data:image/png;base64,${imgSrc}`} alt={`Generated product ${index + 1}`} className="w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => handleDownloadSingle(imgSrc, index)}
                title={t('download_image')}
                className="bg-white/20 text-white rounded-full p-3 hover:bg-white/30 backdrop-blur-sm"
              >
                <DownloadIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};