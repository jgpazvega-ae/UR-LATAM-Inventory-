import { usuariosPorRegion as usuariosInicial } from '../data/usuarios';

export interface UsuarioForm {
  nombreCompleto: string;
  email: string;
  username: string;
  rol: 'VENDEDOR' | 'GERENTE_VENTAS' | 'SERVICIO' | 'ADMIN';
  activo?: boolean;
}

class UserServiceLocal {
  private key = 'usuarios-demo';

  private getUsuarios() {
    const stored = localStorage.getItem(this.key);
    if (stored) {
      return JSON.parse(stored);
    }

    // Convertir datos iniciales a formato expandido
    const todosUsuarios: any[] = [];
    Object.entries(usuariosInicial).forEach(([region, usuarios]) => {
      usuarios.forEach((u: any) => {
        todosUsuarios.push({
          ...u,
          region,
          activo: true,
          password: 'latamrules123',
        });
      });
    });

    localStorage.setItem(this.key, JSON.stringify(todosUsuarios));
    return todosUsuarios;
  }

  private saveUsuarios(usuarios: any[]) {
    localStorage.setItem(this.key, JSON.stringify(usuarios));
  }

  async listar(filters: any = {}) {
    const usuarios = this.getUsuarios();
    let result = usuarios;

    // Filtro activo más robusto: si activo===true, excluye solo los explícitamente false
    if (filters.activo === true) {
      result = result.filter((u: any) => u.activo !== false);
    } else if (filters.activo === false) {
      result = result.filter((u: any) => u.activo === false);
    }

    if (filters.rol) {
      result = result.filter((u: any) => u.rol === filters.rol);
    }

    if (filters.region) {
      result = result.filter((u: any) => u.region === filters.region);
      console.log(`📍 Filtrando por región "${filters.region}": ${result.length} usuarios encontrados`);
    }

    return result;
  }

  async listarPorRegion(region: string) {
    return this.listar({ region, activo: true });
  }

  async obtener(id: string) {
    const usuarios = this.getUsuarios();
    return usuarios.find((u: any) => u.id === id);
  }

  async crear(data: UsuarioForm & { region: string }) {
    const usuarios = this.getUsuarios();
    const nuevoId = Math.max(...usuarios.map((u: any) => parseInt(u.id)), 0) + 1;

    const nuevoUsuario = {
      id: nuevoId.toString(),
      ...data,
      activo: true,
      password: 'latamrules123',
    };

    usuarios.push(nuevoUsuario);
    this.saveUsuarios(usuarios);
    return nuevoUsuario;
  }

  async actualizar(id: string, data: Partial<UsuarioForm>) {
    const usuarios = this.getUsuarios();
    const index = usuarios.findIndex((u: any) => u.id === id);

    if (index === -1) throw new Error('Usuario no encontrado');

    usuarios[index] = { ...usuarios[index], ...data };
    this.saveUsuarios(usuarios);
    return usuarios[index];
  }

  async eliminar(id: string) {
    const usuarios = this.getUsuarios();
    const filtered = usuarios.filter((u: any) => u.id !== id);
    this.saveUsuarios(filtered);
  }

  async activar(id: string) {
    return this.actualizar(id, { activo: true });
  }

  async listarDistribuidores() {
    return [
      { id: '1', nombre: 'Universal Robots Latam' },
      { id: '2', nombre: 'MiR Distribution' },
      { id: '3', nombre: 'Teradyne Robotics Centro' },
    ];
  }
}

export const userService = new UserServiceLocal();
