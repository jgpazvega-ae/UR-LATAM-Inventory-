const CONFIG_INICIAL = {
  diasMinimosAnticipacion: 5,
  diasVencimientoAlerta: 7,
  correoAdminPrincipal: 'admin@teradyne-robotics.com',
  correoAdminCopia1: 'gerente@teradyne-robotics.com',
  correoAdminCopia2: '',
  horariosNotificacion: ['08:00', '12:00', '16:00'],
  estadoSistema: 'ACTIVO',
};

class ConfiguracionServiceLocal {
  private key = 'configuracion-demo';

  async obtener() {
    const stored = localStorage.getItem(this.key);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(this.key, JSON.stringify(CONFIG_INICIAL));
    return CONFIG_INICIAL;
  }

  async actualizar(config: any) {
    localStorage.setItem(this.key, JSON.stringify(config));
    return config;
  }
}

export const configuracionService = new ConfiguracionServiceLocal();

