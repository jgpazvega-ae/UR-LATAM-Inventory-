// Configuración de regiones disponibles
// Aquí puedes agregar nuevas regiones fácilmente

export const REGIONES_DISPONIBLES = {
  MX: {
    codigo: 'MX',
    nombre: 'México',
    idiomaPrincipal: 'ES',
    codigoIso: 'es-MX',
    zonaHoraria: 'America/Mexico_City',
    formatoFecha: 'DD/MM/YYYY',
    formatoMoneda: 'MXN',
  },
  BR: {
    codigo: 'BR',
    nombre: 'Brasil',
    idiomaPrincipal: 'PT',
    codigoIso: 'pt-BR',
    zonaHoraria: 'America/Sao_Paulo',
    formatoFecha: 'DD/MM/YYYY',
    formatoMoneda: 'BRL',
  },
  USA: {
    codigo: 'USA',
    nombre: 'Estados Unidos',
    idiomaPrincipal: 'EN',
    codigoIso: 'en-US',
    zonaHoraria: 'America/Chicago',
    formatoFecha: 'MM/DD/YYYY',
    formatoMoneda: 'USD',
  },
};

export const IDIOMAS_DISPONIBLES = {
  ES: { nombre: 'Español', codigoIso: 'es' },
  PT: { nombre: 'Português', codigoIso: 'pt' },
  EN: { nombre: 'English', codigoIso: 'en' },
};

export function obtenerRegion(codigo: string) {
  return REGIONES_DISPONIBLES[codigo as keyof typeof REGIONES_DISPONIBLES];
}

export function obtenerIdioma(codigo: string) {
  return IDIOMAS_DISPONIBLES[codigo as keyof typeof IDIOMAS_DISPONIBLES];
}

export function esRegionValida(codigo: string): boolean {
  return codigo in REGIONES_DISPONIBLES;
}

export function esIdiomaValido(codigo: string): boolean {
  return codigo in IDIOMAS_DISPONIBLES;
}

export function listarRegiones() {
  return Object.values(REGIONES_DISPONIBLES);
}

export function listarIdiomas() {
  return Object.values(IDIOMAS_DISPONIBLES);
}
