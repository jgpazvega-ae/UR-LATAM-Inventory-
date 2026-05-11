import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, Usuario } from '../services/auth.service';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isGerente: boolean;
  isServicio: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = authService.getCurrentUser();
    if (stored && authService.isAuthenticated()) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setUser(data.usuario);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    const basename = window.location.hostname.includes('github.io') ? '/UR-LATAM-Inventory-' : '';
    window.location.href = `${basename}/login`;
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.rol === 'ADMIN',
    isGerente: user?.rol === 'GERENTE_VENTAS' || user?.rol === 'ADMIN',
    isServicio: user?.rol === 'SERVICIO' || user?.rol === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
