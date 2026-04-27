import api from './api';

export const configuracionService = {
  obtener: async () => {
    const { data } = await api.get('/configuracion');
    return data;
  },

  actualizar: async (config: any) => {
    const { data } = await api.put('/configuracion', config);
    return data;
  },
};
