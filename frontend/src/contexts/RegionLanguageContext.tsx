import { createContext, useContext, useState, ReactNode } from 'react';
import { translations } from '../locales/translations';

interface RegionLanguageContextType {
  currentRegion: string;
  currentIdioma: 'ES' | 'PT' | 'EN';
  setRegion: (codigo: string) => void;
  setIdioma: (codigo: 'ES' | 'PT' | 'EN') => void;
  t: (key: string) => string;
  translations: Record<string, any>;
}

const RegionLanguageContext = createContext<RegionLanguageContextType | undefined>(undefined);

export const RegionLanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentRegion, setCurrentRegion] = useState<string>(
    localStorage.getItem('region') || 'MX'
  );
  const [currentIdioma, setCurrentIdioma] = useState<'ES' | 'PT' | 'EN'>(
    (localStorage.getItem('idioma') as 'ES' | 'PT' | 'EN') || 'ES'
  );

  const handleSetRegion = (codigo: string) => {
    setCurrentRegion(codigo);
    localStorage.setItem('region', codigo);
  };

  const handleSetIdioma = (codigo: 'ES' | 'PT' | 'EN') => {
    setCurrentIdioma(codigo);
    localStorage.setItem('idioma', codigo);
    document.documentElement.lang = codigo.toLowerCase();
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[currentIdioma];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  const value: RegionLanguageContextType = {
    currentRegion,
    currentIdioma,
    setRegion: handleSetRegion,
    setIdioma: handleSetIdioma,
    t,
    translations: translations[currentIdioma],
  };

  return (
    <RegionLanguageContext.Provider value={value}>
      {children}
    </RegionLanguageContext.Provider>
  );
};

export const useRegionLanguage = () => {
  const ctx = useContext(RegionLanguageContext);
  if (!ctx) throw new Error('useRegionLanguage debe usarse dentro de RegionLanguageProvider');
  return ctx;
};
