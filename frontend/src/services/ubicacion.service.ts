export type TipoUbicacion = 'Oficina' | 'Cliente' | 'Almacén' | 'Taller' | 'Otro';
export type EstadoUbicacion = 'Activa' | 'Inactiva' | 'Archivada';

export interface Ubicacion {
  id: string;
  nombre: string;
  tipo: TipoUbicacion;
  direccion: string;
  ciudad: string;
  region: 'MX' | 'BR' | 'USA';
  contacto: {
    nombre: string;
    email: string;
    telefono: string;
  };
  estado: EstadoUbicacion;
  createdAt: string;
  actualizadoEn?: string;
}

const UBICACIONES_INICIALES: Ubicacion[] = [
  {
    id: '1',
    nombre: 'Oficina Central México',
    tipo: 'Oficina',
    direccion: 'Av. Paseo de la Reforma 505',
    ciudad: 'México DF',
    region: 'MX',
    contacto: {
      nombre: 'María González',
      email: 'maria.gonzalez@teradyne.com',
      telefono: '+52 55 1234 5678',
    },
    estado: 'Activa',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    nombre: 'Almacén Centro de Distribución',
    tipo: 'Almacén',
    direccion: 'Carretera México-Puebla km 25',
    ciudad: 'Puebla',
    region: 'MX',
    contacto: {
      nombre: 'Carlos López',
      email: 'carlos.lopez@teradyne.com',
      telefono: '+52 222 345 6789',
    },
    estado: 'Activa',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    nombre: 'Taller de Mantenimiento',
    tipo: 'Taller',
    direccion: 'Avenida Industrial 123',
    ciudad: 'Monterrey',
    region: 'MX',
    contacto: {
      nombre: 'Roberto Martínez',
      email: 'roberto.martinez@teradyne.com',
      telefono: '+52 81 8765 4321',
    },
    estado: 'Activa',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    nombre: 'Cliente: Volkswagen',
    tipo: 'Cliente',
    direccion: 'Blvd. Industrial, Zona Franca 2',
    ciudad: 'Aguascalientes',
    region: 'MX',
    contacto: {
      nombre: 'Ing. Fernando Díaz',
      email: 'fernando.diaz@volkswagen.com',
      telefono: '+52 449 123 4567',
    },
    estado: 'Activa',
    createdAt: new Date().toISOString(),
  },
];

class UbicacionServiceLocal {
  private key = 'ubicaciones-demo';

  private getUbicaciones(): Ubicacion[] {
    const stored = localStorage.getItem(this.key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (err) {
        console.error('Error parseando ubicaciones:', err);
        return UBICACIONES_INICIALES;
      }
    }
    localStorage.setItem(this.key, JSON.stringify(UBICACIONES_INICIALES));
    return UBICACIONES_INICIALES;
  }

  private saveUbicaciones(ubicaciones: Ubicacion[]) {
    localStorage.setItem(this.key, JSON.stringify(ubicaciones));
  }

  async listar(filtros?: { estado?: EstadoUbicacion; tipo?: TipoUbicacion; region?: string }): Promise<Ubicacion[]> {
    let ubicaciones = this.getUbicaciones();

    if (filtros?.estado) {
      ubicaciones = ubicaciones.filter((u) => u.estado === filtros.estado);
    }

    if (filtros?.tipo) {
      ubicaciones = ubicaciones.filter((u) => u.tipo === filtros.tipo);
    }

    if (filtros?.region) {
      ubicaciones = ubicaciones.filter((u) => u.region === filtros.region);
    }

    return ubicaciones.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async obtener(id: string): Promise<Ubicacion | undefined> {
    const ubicaciones = this.getUbicaciones();
    return ubicaciones.find((u) => u.id === id);
  }

  async crear(data: Omit<Ubicacion, 'id' | 'createdAt'>): Promise<Ubicacion> {
    const ubicaciones = this.getUbicaciones();
    const nuevoId = (Math.max(...ubicaciones.map((u) => parseInt(u.id)), 0) + 1).toString();

    const nueva: Ubicacion = {
      id: nuevoId,
      ...data,
      createdAt: new Date().toISOString(),
    };

    ubicaciones.push(nueva);
    this.saveUbicaciones(ubicaciones);
    console.log('✅ Ubicación creada:', nuevoId);
    return nueva;
  }

  async actualizar(id: string, data: Partial<Ubicacion>): Promise<Ubicacion> {
    const ubicaciones = this.getUbicaciones();
    const index = ubicaciones.findIndex((u) => u.id === id);

    if (index === -1) throw new Error('Ubicación no encontrada');

    ubicaciones[index] = {
      ...ubicaciones[index],
      ...data,
      actualizadoEn: new Date().toISOString(),
    };

    this.saveUbicaciones(ubicaciones);
    return ubicaciones[index];
  }

  async eliminar(id: string): Promise<void> {
    const ubicaciones = this.getUbicaciones();
    const filtered = ubicaciones.filter((u) => u.id !== id);
    this.saveUbicaciones(filtered);
  }

  async contarRobotsEnUbicacion(ubicacionId: string): Promise<number> {
    const stored = localStorage.getItem('robots-demo');
    if (!stored) return 0;
    try {
      const robots = JSON.parse(stored);
      if (!Array.isArray(robots)) return 0;
      return robots.filter((r: any) => r && r.ubicacionActual === ubicacionId).length;
    } catch (err) {
      console.error('Error contando robots en ubicación:', err);
      return 0;
    }
  }
}

export const ubicacionService = new UbicacionServiceLocal();
