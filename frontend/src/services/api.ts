import axios from 'axios';

const baseURL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const basename = window.location.hostname.includes('github.io') ? '/UR-LATAM-Inventory-' : '';
      const loginPath = `${basename}/login`;
      if (!window.location.pathname.endsWith('/login')) {
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
