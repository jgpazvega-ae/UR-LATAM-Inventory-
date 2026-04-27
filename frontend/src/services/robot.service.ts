import api from './api';

export const robotService = {
  listarFamilias: async () => {
    const { data } = await api.get('/robots/familias');
    return data;
  },

  crearFamilia: async (familia: { nombreFamilia: string; descripcion?: string }) => {
    const { data } = await api.post('/robots/familias', familia);
    return data;
  },

  listar: async (filtros?: { familiaId?: string; estado?: string; disponibles?: boolean }) => {
    const { data } = await api.get('/robots', { params: filtros });
    return data;
  },

  obtener: async (id: string) => {
    const { data } = await api.get(`/robots/${id}`);
    return data;
  },

  crear: async (robot: any) => {
    const { data } = await api.post('/robots', robot);
    return data;
  },

  actualizar: async (id: string, robot: any) => {
    const { data } = await api.put(`/robots/${id}`, robot);
    return data;
  },

  eliminar: async (id: string) => {
    const { data } = await api.delete(`/robots/${id}`);
    return data;
  },

  importar: async (robots: any[]) => {
    const { data } = await api.post('/robots/importar', { robots });
    return data;
  },
};
