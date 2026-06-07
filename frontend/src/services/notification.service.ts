export interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'success' | 'error' | 'warning' | 'info';
  leido: boolean;
  fechaCreacion: string;
  accion?: {
    label: string;
    url: string;
  };
}

class NotificationServiceLocal {
  private key = 'notificaciones-demo';
  private maxNotificaciones = 50; // Limitar a 50 para no llenar localStorage

  private getNotificaciones(): Notificacion[] {
    const stored = localStorage.getItem(this.key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (err) {
        console.error('Error parseando notificaciones:', err);
        return [];
      }
    }
    return [];
  }

  private saveNotificaciones(notificaciones: Notificacion[]) {
    // Mantener solo las últimas N notificaciones
    const limitadas = notificaciones.slice(-this.maxNotificaciones);
    localStorage.setItem(this.key, JSON.stringify(limitadas));
  }

  async agregar(
    titulo: string,
    mensaje: string,
    tipo: 'success' | 'error' | 'warning' | 'info' = 'info',
    accion?: { label: string; url: string }
  ): Promise<Notificacion> {
    const notificaciones = this.getNotificaciones();
    const nueva: Notificacion = {
      id: Date.now().toString(),
      titulo,
      mensaje,
      tipo,
      leido: false,
      fechaCreacion: new Date().toISOString(),
      accion,
    };

    notificaciones.push(nueva);
    this.saveNotificaciones(notificaciones);
    console.log(`📬 Notificación agregada: ${titulo}`);
    return nueva;
  }

  async obtenerTodas(): Promise<Notificacion[]> {
    return this.getNotificaciones().reverse(); // Más recientes primero
  }

  async obtenerNoLeidas(): Promise<Notificacion[]> {
    const notificaciones = this.getNotificaciones();
    return notificaciones.filter((n) => !n.leido).reverse();
  }

  async marcarLeida(id: string): Promise<void> {
    const notificaciones = this.getNotificaciones();
    const index = notificaciones.findIndex((n) => n.id === id);
    if (index !== -1) {
      notificaciones[index].leido = true;
      this.saveNotificaciones(notificaciones);
    }
  }

  async marcarTodasLeidas(): Promise<void> {
    const notificaciones = this.getNotificaciones();
    notificaciones.forEach((n) => (n.leido = true));
    this.saveNotificaciones(notificaciones);
  }

  async eliminar(id: string): Promise<void> {
    const notificaciones = this.getNotificaciones();
    const filtered = notificaciones.filter((n) => n.id !== id);
    this.saveNotificaciones(filtered);
  }

  async limpiarTodas(): Promise<void> {
    localStorage.removeItem(this.key);
  }

  async contarNoLeidas(): Promise<number> {
    const notificaciones = this.getNotificaciones();
    return notificaciones.filter((n) => !n.leido).length;
  }
}

export const notificationService = new NotificationServiceLocal();
