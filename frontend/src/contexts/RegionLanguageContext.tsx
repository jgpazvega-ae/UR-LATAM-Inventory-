import { createContext, useContext, useState, ReactNode } from 'react';

interface RegionLanguageContextType {
  currentRegion: string;
  currentIdioma: string;
  setRegion: (codigo: string) => void;
  setIdioma: (codigo: string) => void;
}

const RegionLanguageContext = createContext<RegionLanguageContextType | undefined>(undefined);

export const RegionLanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentRegion, setCurrentRegion] = useState<string>(
    localStorage.getItem('region') || 'MX'
  );
  const [currentIdioma, setCurrentIdioma] = useState<string>(
    localStorage.getItem('idioma') || 'ES'
  );

  const handleSetRegion = (codigo: string) => {
    setCurrentRegion(codigo);
    localStorage.setItem('region', codigo);
  };

  const handleSetIdioma = (codigo: string) => {
    setCurrentIdioma(codigo);
    localStorage.setItem('idioma', codigo);
    document.documentElement.lang = codigo.toLowerCase();
  };

  const value: RegionLanguageContextType = {
    currentRegion,
    currentIdioma,
    setRegion: handleSetRegion,
    setIdioma: handleSetIdioma,
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
