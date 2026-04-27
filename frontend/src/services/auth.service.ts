import api from './api';

export interface Usuario {
  id: string;
  username: string;
  email: string;
  nombreCompleto: string;
  rol: 'VENDEDOR' | 'GERENTE_VENTAS' | 'SERVICIO' | 'ADMIN';
  distribuidor?: { id: string; nombre: string } | null;
}

export const authService = {
  async login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.usuario));
    return data;
  },

  async register(payload: { username: string; email: string; password: string; nombreCompleto: string }) {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },

  async me(): Promise<Usuario> {
    const { data } = await api.get('/auth/me');
    return data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): Usuario | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};
