// Índice de internacionalización
// Exporta todos los idiomas y funciones útiles

export { translationService } from '../services/translation.service';

// Tipos
export type SoportedLanguage = 'ES' | 'PT' | 'EN';

// Traducciones raw (para casos especiales)
import * as es from './es.json';
import * as pt from './pt.json';
import * as en from './en.json';

export const translations = {
  ES: es,
  PT: pt,
  EN: en,
};

// Lista de idiomas disponibles
export const availableLanguages: SoportedLanguage[] = ['ES', 'PT', 'EN'];

// Función helper para validar idioma
export function isValidLanguage(lang: string): lang is SoportedLanguage {
  return availableLanguages.includes(lang as SoportedLanguage);
}

export default translations;
