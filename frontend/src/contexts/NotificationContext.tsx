import { createContext, useContext, useState, ReactNode } from 'react';
import { notificationService } from '../services/notification.service';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';
export type NotificationCategory = 'system' | 'workflow' | 'alert' | 'user-action';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
  title?: string;
  category?: NotificationCategory;
  action?: { label: string; url: string };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    message: string,
    type: NotificationType,
    duration?: number,
    title?: string,
    category?: NotificationCategory,
    action?: { label: string; url: string }
  ) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (
    message: string,
    type: NotificationType = 'info',
    duration: number = 3000,
    title?: string,
    category: NotificationCategory = 'user-action',
    action?: { label: string; url: string }
  ) => {
    const id = Date.now().toString();
    const notification: Notification = { id, message, type, duration, title, category, action };

    setNotifications((prev) => [...prev, notification]);

    // Guardar en el servicio de notificaciones para persistencia
    const tituloNotif = title || (
      type === 'success' ? '✅ Éxito' :
      type === 'error' ? '❌ Error' :
      type === 'warning' ? '⚠️ Advertencia' :
      'ℹ️ Información'
    );

    notificationService.agregar(tituloNotif, message, type, action)
      .catch(err => console.error('Error guardando notificación:', err));

    // Auto-dismiss después de la duración especificada
    if (duration > 0) {
      setTimeout(() => removeNotification(id), duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification debe usarse dentro de NotificationProvider');
  return ctx;
};
