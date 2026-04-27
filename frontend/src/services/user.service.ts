import api from './api';

export const userService = {
  listar: async (filtros?: { activo?: boolean; rol?: string }) => {
    const { data } = await api.get('/usuarios', { params: filtros });
    return data;
  },

  obtener: async (id: string) => {
    const { data } = await api.get(`/usuarios/${id}`);
    return data;
  },

  crear: async (usuario: any) => {
    const { data } = await api.post('/usuarios', usuario);
    return data;
  },

  actualizar: async (id: string, usuario: any) => {
    const { data } = await api.put(`/usuarios/${id}`, usuario);
    return data;
  },

  activar: async (id: string, distribuidorId?: string) => {
    const { data } = await api.post(`/usuarios/${id}/activar`, { distribuidorId });
    return data;
  },

  eliminar: async (id: string) => {
    const { data } = await api.delete(`/usuarios/${id}`);
    return data;
  },

  listarDistribuidores: async () => {
    const { data } = await api.get('/usuarios/distribuidores');
    return data;
  },

  crearDistribuidor: async (distribuidor: any) => {
    const { data } = await api.post('/usuarios/distribuidores', distribuidor);
    return data;
  },
};
