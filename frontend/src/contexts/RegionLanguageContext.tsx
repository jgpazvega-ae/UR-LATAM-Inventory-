import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RegionLanguageContextType {
  currentRegion: string;
  currentIdioma: string;
  translations: Record<string, any>;
  setRegion: (codigo: string) => Promise<void>;
  setIdioma: (codigo: string) => Promise<void>;
  t: (clave: string, valores?: Record<string, any>) => string;
}

const RegionLanguageContext = createContext<RegionLanguageContextType | undefined>(undefined);

const API_URL = 'http://localhost:5000/api';

export const RegionLanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentRegion, setCurrentRegion] = useState<string>(
    localStorage.getItem('region') || 'MX'
  );
  const [currentIdioma, setCurrentIdioma] = useState<string>(
    localStorage.getItem('idioma') || 'ES'
  );
  const [translations, setTranslations] = useState<Record<string, any>>({});

  // Cargar traducciones al cambiar idioma
  useEffect(() => {
    const cargarTraducciones = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/regiones/traducciones/${currentIdioma}`, {
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          setTranslations(data);
        }
      } catch (error) {
        console.error('Error cargando traducciones:', error);
        setTranslations({});
      }
    };

    cargarTraducciones();
  }, [currentIdioma]);

  const setRegion = async (codigo: string) => {
    setCurrentRegion(codigo);
    localStorage.setItem('region', codigo);

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`${API_URL}/regiones/cambiar-idioma`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idioma: currentIdioma }),
        });
      } catch (error) {
        console.error('Error changing region:', error);
      }
    }
  };

  const setIdioma = async (codigo: string) => {
    setCurrentIdioma(codigo);
    localStorage.setItem('idioma', codigo);
    document.documentElement.lang = codigo.toLowerCase();

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`${API_URL}/regiones/cambiar-idioma`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idioma: codigo }),
        });
      } catch (error) {
        console.error('Error changing language:', error);
      }
    }
  };

  const t = (clave: string, valores: Record<string, any> = {}): string => {
    const partes = clave.split('.');
    let valor = translations;

    for (const parte of partes) {
      if (valor && typeof valor === 'object' && parte in valor) {
        valor = valor[parte];
      } else {
        return clave;
      }
    }

    let resultado = typeof valor === 'string' ? valor : clave;
    Object.entries(valores).forEach(([key, val]) => {
      resultado = resultado.replace(`{${key}}`, String(val));
    });

    return resultado;
  };

  const value: RegionLanguageContextType = {
    currentRegion,
    currentIdioma,
    translations,
    setRegion,
    setIdioma,
    t,
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
