// Translation service - maneja traducciones de strings
import * as es from '../i18n/es.json';
import * as pt from '../i18n/pt.json';
import * as en from '../i18n/en.json';

const traducciones: any = {
  ES: es,
  PT: pt,
  EN: en,
};

export const translationService = {
  // Obtener traducción de una clave
  traducir(clave: string, idioma: 'ES' | 'PT' | 'EN', contexto?: Record<string, any>): string {
    try {
      let valor = this.obtenerValor(idioma, clave);

      if (!valor) {
        console.warn(`Translation not found: ${clave} for language ${idioma}`);
        return clave; // Fallback: retornar la clave
      }

      // Reemplazar variables: "Hola {nombre}" → "Hola Juan"
      if (contexto) {
        Object.entries(contexto).forEach(([key, val]) => {
          valor = valor.replace(`{${key}}`, String(val));
        });
      }

      return valor;
    } catch (error) {
      console.error(`Error translating ${clave}:`, error);
      return clave;
    }
  },

  // Obtener valor anidado (soporta "auth.login.titulo")
  obtenerValor(idioma: string, clave: string): string {
    const partes = clave.split('.');
    let valor: any = traducciones[idioma as keyof typeof traducciones] || traducciones['ES'];

    for (const parte of partes) {
      if (valor && typeof valor === 'object' && parte in valor) {
        valor = valor[parte];
      } else {
        return '';
      }
    }

    return typeof valor === 'string' ? valor : '';
  },

  // Obtener todas las traducciones para un idioma
  obtenerTodas(idioma: 'ES' | 'PT' | 'EN'): Record<string, any> {
    return traducciones[idioma] || traducciones['ES'];
  },

  // Validar si existe traducción
  existeTraduccion(clave: string, idioma: 'ES' | 'PT' | 'EN'): boolean {
    return this.obtenerValor(idioma, clave) !== '';
  },

  // Obtener plantilla de email por tipo e idioma
  obtenerPlantillaEmail(tipo: string, idioma: 'ES' | 'PT' | 'EN'): string {
    const clave = `emails.${tipo}`;
    return this.traducir(clave, idioma);
  },

  // Cambiar idioma dinámicamente
  cambiarIdioma(nuevoIdioma: 'ES' | 'PT' | 'EN'): boolean {
    if (nuevoIdioma in traducciones) {
      return true;
    }
    return false;
  },

  // Para verificar si un idioma está soportado
  esIdiomaValido(idioma: string): boolean {
    return idioma in traducciones;
  },

  // Listar idiomas disponibles
  listarIdiomas(): string[] {
    return Object.keys(traducciones);
  },
};
