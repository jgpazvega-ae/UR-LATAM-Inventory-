import api from './api';
import { usuariosPorRegion } from '../data/usuarios';

export interface Usuario {
  id: string;
  username: string;
  email: string;
  nombreCompleto: string;
  rol: 'VENDEDOR' | 'GERENTE_VENTAS' | 'SERVICIO' | 'ADMIN';
  distribuidor?: { id: string; nombre: string } | null;
}

const isDemo = !window.location.hostname.includes('localhost');
const DEMO_PASSWORD = 'latamrules123';

// Función auxiliar para obtener usuario de datos de demo
const getUserFromDemo = (email: string): Usuario | null => {
  for (const region of Object.values(usuariosPorRegion)) {
    const user = region.find(u => u.email === email);
    if (user) {
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        nombreCompleto: user.nombreCompleto,
        rol: user.rol as any,
      };
    }
  }
  return null;
};

export const authService = {
  async login(email: string, password: string) {
    try {
      // En demo, validar contra datos locales
      if (isDemo) {
        if (password !== DEMO_PASSWORD) {
          throw new Error('Contraseña incorrecta');
        }

        const usuario = getUserFromDemo(email);
        if (!usuario) {
          throw new Error('Usuario no encontrado');
        }

        // Simular respuesta del backend
        const data = {
          token: 'demo-token-' + Date.now(),
          usuario: usuario,
        };

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.usuario));
        return data;
      }

      // En producción, usar API real
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      return data;
    } catch (error: any) {
      throw {
        response: {
          data: {
            error: error.message || 'Error al iniciar sesión',
          },
        },
      };
    }
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
