import api from './api';

export const prestamoService = {
  listar: async (filtros?: { estado?: string; usuario?: string }) => {
    const { data } = await api.get('/prestamos', { params: filtros });
    return data;
  },

  obtener: async (id: string) => {
    const { data } = await api.get(`/prestamos/${id}`);
    return data;
  },

  crear: async (solicitud: {
    robotIds: string[];
    distribuidorId: string;
    fechaInicio: string;
    fechaFin: string;
    motivo: string;
  }) => {
    const { data } = await api.post('/prestamos', solicitud);
    return data;
  },

  aprobar: async (id: string) => {
    const { data } = await api.post(`/prestamos/${id}/aprobar`);
    return data;
  },

  rechazar: async (id: string, motivoRechazo: string) => {
    const { data } = await api.post(`/prestamos/${id}/rechazar`, { motivoRechazo });
    return data;
  },

  confirmarSalida: async (id: string) => {
    const { data } = await api.post(`/prestamos/${id}/salida`);
    return data;
  },

  confirmarRecepcion: async (id: string) => {
    const { data } = await api.post(`/prestamos/${id}/recepcion`);
    return data;
  },
};
