export interface Robot {
  id: string;
  numeroSerie: string;
  modelo: string;
  familiaId: string;
  familia?: { id: string; nombreFamilia: string };
  estado: 'DISPONIBLE' | 'EN_PRESTAMO' | 'MANTENIMIENTO' | 'RETIRADO';
  ubicacionActual?: string;
}

export interface Familia {
  id: string;
  nombreFamilia: string;
  descripcion: string;
}

const FAMILIAS_INICIALES: Familia[] = [
  { id: '1', nombreFamilia: 'CB3', descripcion: 'Universal Robots Serie CB3' },
  { id: '2', nombreFamilia: 'Serie E', descripcion: 'Universal Robots Serie E (e-Series)' },
  { id: '3', nombreFamilia: 'UR Series', descripcion: 'Universal Robots Series modernos' },
  { id: '4', nombreFamilia: 'MIR', descripcion: 'Mobile Industrial Robots' },
];

const ROBOTS_INICIALES: Robot[] = [
  { id: '1', numeroSerie: '2017307415', modelo: 'UR10', familiaId: '1', estado: 'DISPONIBLE' },
  { id: '2', numeroSerie: '2017304770', modelo: 'UR10', familiaId: '1', estado: 'DISPONIBLE' },
  { id: '3', numeroSerie: '20205000857', modelo: 'UR10e', familiaId: '2', estado: 'DISPONIBLE' },
  { id: '4', numeroSerie: '20185000448', modelo: 'UR10e', familiaId: '2', estado: 'EN_PRESTAMO' },
  { id: '5', numeroSerie: '20205000065', modelo: 'UR10e', familiaId: '2', estado: 'DISPONIBLE' },
  { id: '6', numeroSerie: '20195000435', modelo: 'UR10e', familiaId: '2', estado: 'MANTENIMIENTO' },
  { id: '7', numeroSerie: '20195000437', modelo: 'UR10e', familiaId: '2', estado: 'DISPONIBLE' },
  { id: '8', numeroSerie: '20245201849', modelo: 'UR10e', familiaId: '2', estado: 'DISPONIBLE' },
  { id: '9', numeroSerie: '20245201848', modelo: 'UR10e', familiaId: '2', estado: 'DISPONIBLE' },
  { id: '10', numeroSerie: '20195600044', modelo: 'UR16e', familiaId: '2', estado: 'DISPONIBLE' },
  { id: '11', numeroSerie: '20195600055', modelo: 'UR16e', familiaId: '2', estado: 'DISPONIBLE' },
  { id: '12', numeroSerie: '20236800042', modelo: 'UR20', familiaId: '3', estado: 'DISPONIBLE' },
];

class RobotServiceLocal {
  private robotsKey = 'robots-demo';
  private familiasKey = 'familias-demo';

  private getRobots(): Robot[] {
    const stored = localStorage.getItem(this.robotsKey);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(this.robotsKey, JSON.stringify(ROBOTS_INICIALES));
    return ROBOTS_INICIALES;
  }

  private getFamilias(): Familia[] {
    const stored = localStorage.getItem(this.familiasKey);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(this.familiasKey, JSON.stringify(FAMILIAS_INICIALES));
    return FAMILIAS_INICIALES;
  }

  private saveRobots(robots: Robot[]) {
    localStorage.setItem(this.robotsKey, JSON.stringify(robots));
  }

  private saveFamilias(familias: Familia[]) {
    localStorage.setItem(this.familiasKey, JSON.stringify(familias));
  }

  async listar(filtros: any = {}) {
    let robots = this.getRobots();
    const familias = this.getFamilias();

    if (filtros.familiaId) {
      robots = robots.filter(r => r.familiaId === filtros.familiaId);
    }

    if (filtros.estado) {
      robots = robots.filter(r => r.estado === filtros.estado);
    }

    return robots.map(r => ({
      ...r,
      familia: familias.find(f => f.id === r.familiaId) || null,
    }));
  }

  async obtener(id: string) {
    const robots = this.getRobots();
    return robots.find(r => r.id === id);
  }

  async crear(data: Omit<Robot, 'id'>) {
    const robots = this.getRobots();
    const nuevoId = (Math.max(...robots.map(r => parseInt(r.id)), 0) + 1).toString();
    const nuevoRobot = { id: nuevoId, ...data };
    robots.push(nuevoRobot);
    this.saveRobots(robots);
    return nuevoRobot;
  }

  async actualizar(id: string, data: Partial<Robot>) {
    const robots = this.getRobots();
    const index = robots.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Robot no encontrado');
    robots[index] = { ...robots[index], ...data };
    this.saveRobots(robots);
    return robots[index];
  }

  async eliminar(id: string) {
    const robots = this.getRobots();
    const filtered = robots.filter(r => r.id !== id);
    this.saveRobots(filtered);
  }

  async listarFamilias() {
    return this.getFamilias();
  }

  async crearFamilia(data: Omit<Familia, 'id'>) {
    const familias = this.getFamilias();
    const nuevoId = (Math.max(...familias.map(f => parseInt(f.id)), 0) + 1).toString();
    const nuevaFamilia = { id: nuevoId, ...data };
    familias.push(nuevaFamilia);
    this.saveFamilias(familias);
    return nuevaFamilia;
  }
}

export const robotService = new RobotServiceLocal();
