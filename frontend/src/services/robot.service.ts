export interface Robot {
  id: string;
  numeroSerie: string;
  modelo: string;
  familiaId: string;
  familia?: { id: string; nombreFamilia: string };
  estado: 'DISPONIBLE' | 'EN_PRESTAMO' | 'MANTENIMIENTO' | 'RETIRADO';
  ubicacionActual?: string;
  region: 'MX' | 'BR' | 'USA';
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
  { id: '1', numeroSerie: '2017307415', modelo: 'UR10', familiaId: '1', estado: 'DISPONIBLE', region: 'MX' },
  { id: '2', numeroSerie: '2017304770', modelo: 'UR10', familiaId: '1', estado: 'DISPONIBLE', region: 'MX' },
  { id: '3', numeroSerie: '20205000857', modelo: 'UR10e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '4', numeroSerie: '20185000448', modelo: 'UR10e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '5', numeroSerie: '20205000065', modelo: 'UR10e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '6', numeroSerie: '20195000435', modelo: 'UR10e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '7', numeroSerie: '20195000437', modelo: 'UR10e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '8', numeroSerie: '20245201849', modelo: 'UR10e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '9', numeroSerie: '20245201848', modelo: 'UR10e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '10', numeroSerie: '20195600044', modelo: 'UR16e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '11', numeroSerie: '20195600055', modelo: 'UR16e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '12', numeroSerie: '20236800042', modelo: 'UR20', familiaId: '3', estado: 'DISPONIBLE', region: 'MX' },
  { id: '13', numeroSerie: '20236900015', modelo: 'UR30', familiaId: '3', estado: 'MANTENIMIENTO', region: 'MX' },
  { id: '14', numeroSerie: '20245300066', modelo: 'UR3e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '15', numeroSerie: '20245300067', modelo: 'UR3e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '16', numeroSerie: '20245300068', modelo: 'UR3e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '17', numeroSerie: '20245300069', modelo: 'UR3e', familiaId: '2', estado: 'EN_PRESTAMO', region: 'MX' },
  { id: '18', numeroSerie: '20245300072', modelo: 'UR3e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '19', numeroSerie: '20185300261', modelo: 'UR3e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '20', numeroSerie: '20185300069', modelo: 'UR3e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '21', numeroSerie: '20185300166', modelo: 'UR3e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '22', numeroSerie: '20225300808', modelo: 'UR3e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '23', numeroSerie: '20225300809', modelo: 'UR3e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '24', numeroSerie: '2014350019', modelo: 'UR5', familiaId: '1', estado: 'EN_PRESTAMO', region: 'MX' },
  { id: '25', numeroSerie: '2015350493', modelo: 'UR5', familiaId: '1', estado: 'EN_PRESTAMO', region: 'MX' },
  { id: '26', numeroSerie: '2014350170', modelo: 'UR5', familiaId: '1', estado: 'MANTENIMIENTO', region: 'MX' },
  { id: '27', numeroSerie: '2017354571', modelo: 'UR5', familiaId: '1', estado: 'MANTENIMIENTO', region: 'MX' },
  { id: '28', numeroSerie: '2017354952', modelo: 'UR5', familiaId: '1', estado: 'MANTENIMIENTO', region: 'MX' },
  { id: '29', numeroSerie: '20185500087', modelo: 'UR5e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '30', numeroSerie: '20185500391', modelo: 'UR5e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '31', numeroSerie: '20215500637', modelo: 'UR5e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '32', numeroSerie: '20205500581', modelo: 'UR5e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '33', numeroSerie: '20245501188', modelo: 'UR5e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '34', numeroSerie: '20245501192', modelo: 'UR5e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '35', numeroSerie: '20185500347', modelo: 'UR5e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '36', numeroSerie: '20185000102', modelo: 'UR10e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '37', numeroSerie: '2017354951', modelo: 'UR5', familiaId: '1', estado: 'DISPONIBLE', region: 'MX' },
  { id: '38', numeroSerie: '20205501629', modelo: 'UR5e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '39', numeroSerie: '20255700158', modelo: 'UR7e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '40', numeroSerie: '20245202818', modelo: 'UR10e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '41', numeroSerie: '20255100168', modelo: 'UR12e', familiaId: '2', estado: 'DISPONIBLE', region: 'MX' },
  { id: '42', numeroSerie: '202556601046', modelo: 'UR8L', familiaId: '3', estado: 'DISPONIBLE', region: 'MX' },
  { id: '43', numeroSerie: '20256700137', modelo: 'UR15', familiaId: '3', estado: 'DISPONIBLE', region: 'MX' },
  { id: '44', numeroSerie: '20256700138', modelo: 'UR15', familiaId: '3', estado: 'DISPONIBLE', region: 'MX' },
  { id: '45', numeroSerie: 'MIR-250-SHELF', modelo: 'MIR 250 SHELF', familiaId: '4', estado: 'DISPONIBLE', region: 'MX' },
  { id: '46', numeroSerie: 'MIR-250-HOOK', modelo: 'MIR250 HOOK', familiaId: '4', estado: 'DISPONIBLE', region: 'MX' },
  { id: '47', numeroSerie: 'MIR-1200-PALLET', modelo: 'MIR 1200 PALLET JACK', familiaId: '4', estado: 'DISPONIBLE', region: 'MX' },
  { id: '48', numeroSerie: 'MIR-1350-LIFT', modelo: 'MIR 1350 PALLET LIFT', familiaId: '4', estado: 'DISPONIBLE', region: 'MX' },
  { id: '49', numeroSerie: 'MC-250', modelo: 'MC 250', familiaId: '4', estado: 'DISPONIBLE', region: 'MX' },
];

class RobotServiceLocal {
  private robotsKey = 'robots-demo';
  private familiasKey = 'familias-demo';

  private getRobots(): Robot[] {
    const stored = localStorage.getItem(this.robotsKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Validar que los robots tengan región Y que haya cantidad suficiente
        // Si hay menos de 40 robots o no tienen región, reinicializar
        if (parsed.length > 0 && (!parsed[0].region || parsed.length < 40)) {
          console.log('🔄 Reinicializando robots - datos incompletos detectados');
          localStorage.removeItem(this.robotsKey);
          localStorage.setItem(this.robotsKey, JSON.stringify(ROBOTS_INICIALES));
          return ROBOTS_INICIALES;
        }
        return parsed;
      } catch (err) {
        console.log('🔄 Error parseando robots - reinicializando');
        localStorage.removeItem(this.robotsKey);
        localStorage.setItem(this.robotsKey, JSON.stringify(ROBOTS_INICIALES));
        return ROBOTS_INICIALES;
      }
    }
    localStorage.setItem(this.robotsKey, JSON.stringify(ROBOTS_INICIALES));
    return ROBOTS_INICIALES;
  }

  private getFamilias(): Familia[] {
    const stored = localStorage.getItem(this.familiasKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.removeItem(this.familiasKey);
        localStorage.setItem(this.familiasKey, JSON.stringify(FAMILIAS_INICIALES));
        return FAMILIAS_INICIALES;
      }
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
    try {
      let robots = this.getRobots();
      const familias = this.getFamilias();

      console.log('📦 Total robots en BD:', robots.length);
      console.log('📦 Filtros:', filtros);

      if (filtros.region) {
        const before = robots.length;
        robots = robots.filter(r => r.region === filtros.region);
        console.log(`📦 Robots con región ${filtros.region}: ${robots.length} (antes: ${before})`);
      }

      if (filtros.familiaId) {
        robots = robots.filter(r => r.familiaId === filtros.familiaId);
        console.log(`📦 Robots con familiaId ${filtros.familiaId}: ${robots.length}`);
      }

      if (filtros.estado) {
        robots = robots.filter(r => r.estado === filtros.estado);
        console.log(`📦 Robots con estado ${filtros.estado}: ${robots.length}`);
      }

      // Filtro de disponibles - solo DISPONIBLE
      if (filtros.disponibles === true) {
        robots = robots.filter(r => r.estado === 'DISPONIBLE');
        console.log(`📦 Robots disponibles: ${robots.length}`);
      }

      const resultado = robots.map(r => ({
        ...r,
        familia: familias.find(f => f.id === r.familiaId) || null,
      }));

      console.log('✅ Robots finales retornados:', resultado.length);
      return resultado;
    } catch (error) {
      console.error('❌ Error en listar():', error);
      throw error;
    }
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
    try {
      const familias = this.getFamilias();
      console.log('👨‍👩‍👧‍👦 Familias cargadas:', familias.length, familias);

      if (!familias || familias.length === 0) {
        console.warn('⚠️ ALERTA: getFamilias() devolvió array vacío, reinicializando...');
        localStorage.removeItem(this.familiasKey);
        const reinit = this.getFamilias();
        console.log('👨‍👩‍👧‍👦 Familias reininicializadas:', reinit.length, reinit);
        return reinit;
      }

      return familias;
    } catch (error) {
      console.error('❌ Error en listarFamilias():', error);
      throw error;
    }
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
