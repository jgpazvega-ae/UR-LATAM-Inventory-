import prisma from '../config/db';
import { REGIONES_DISPONIBLES, IDIOMAS_DISPONIBLES } from '../config/regions.config';

export const regionService = {
  // Obtener región por código
  async obtenerRegion(codigo: string) {
    try {
      const region = await prisma.region.findUnique({
        where: { codigo },
        include: { idiomaPrincipal: true },
      });
      return region;
    } catch (error) {
      console.error(`Error obtaining region ${codigo}:`, error);
      return null;
    }
  },

  // Listar todas las regiones activas
  async listarRegiones() {
    try {
      const regiones = await prisma.region.findMany({
        where: { activa: true },
        include: { idiomaPrincipal: true },
      });
      return regiones;
    } catch (error) {
      console.error('Error listing regions:', error);
      return [];
    }
  },

  // Obtener configuración regional por región e idioma
  async obtenerConfiguracion(regionCode: string, languageCode: string) {
    try {
      const region = await prisma.region.findUnique({
        where: { codigo: regionCode },
      });
      const idioma = await prisma.idioma.findUnique({
        where: { codigo: languageCode },
      });

      if (!region || !idioma) return null;

      const config = await prisma.configuracionRegional.findUnique({
        where: {
          regionId_idiomaId: {
            regionId: region.id,
            idiomaId: idioma.id,
          },
        },
      });
      return config;
    } catch (error) {
      console.error(`Error obtaining regional config ${regionCode}/${languageCode}:`, error);
      return null;
    }
  },

  // Validar que usuario pertenece a región
  async validarAccesoRegion(usuarioId: string, regionCode: string): Promise<boolean> {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        include: { region: true },
      });

      if (!usuario) return false;
      return usuario.region.codigo === regionCode;
    } catch (error) {
      console.error('Error validating region access:', error);
      return false;
    }
  },

  // Obtener zona horaria de una región
  async obtenerZonaHoraria(regionCode: string): Promise<string | null> {
    try {
      const region = await prisma.region.findUnique({
        where: { codigo: regionCode },
      });
      return region?.zonaHoraria || null;
    } catch (error) {
      console.error('Error obtaining timezone:', error);
      return null;
    }
  },

  // Cambiar región de usuario
  async cambiarRegionUsuario(usuarioId: string, nuevoCodigoRegion: string) {
    try {
      const region = await prisma.region.findUnique({
        where: { codigo: nuevoCodigoRegion },
      });

      if (!region) {
        throw new Error(`Region ${nuevoCodigoRegion} not found`);
      }

      const usuarioActualizado = await prisma.usuario.update({
        where: { id: usuarioId },
        data: { regionId: region.id },
        include: { region: true, idiomaPreferido: true },
      });

      return usuarioActualizado;
    } catch (error) {
      console.error('Error changing user region:', error);
      return null;
    }
  },

  // Cambiar idioma preferido del usuario
  async cambiarIdiomaUsuario(usuarioId: string, nuevoCodigoIdioma: string) {
    try {
      const idioma = await prisma.idioma.findUnique({
        where: { codigo: nuevoCodigoIdioma },
      });

      if (!idioma) {
        throw new Error(`Language ${nuevoCodigoIdioma} not found`);
      }

      const usuarioActualizado = await prisma.usuario.update({
        where: { id: usuarioId },
        data: { idiomaPreferidoId: idioma.id },
        include: { region: true, idiomaPreferido: true },
      });

      return usuarioActualizado;
    } catch (error) {
      console.error('Error changing user language:', error);
      return null;
    }
  },

  // Obtener datos públicos de una región (sin BD si falla)
  obtenerRegionPublica(codigo: string) {
    return REGIONES_DISPONIBLES[codigo as keyof typeof REGIONES_DISPONIBLES] || null;
  },

  // Listar regiones públicas
  listarRegionesPublicas() {
    return Object.values(REGIONES_DISPONIBLES);
  },

  // Listar idiomas públicos
  listarIdiomasPublicos() {
    return Object.values(IDIOMAS_DISPONIBLES);
  },
};
