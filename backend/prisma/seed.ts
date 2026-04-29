import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Familias de robots
  const familias = [
    { nombreFamilia: 'CB3', descripcion: 'Universal Robots Serie CB3' },
    { nombreFamilia: 'Serie E', descripcion: 'Universal Robots Serie E (e-Series)' },
    { nombreFamilia: 'UR Series', descripcion: 'Universal Robots Series modernos' },
    { nombreFamilia: 'MIR', descripcion: 'Mobile Industrial Robots' },
  ];

  for (const fam of familias) {
    await prisma.familiaRobot.upsert({
      where: { nombreFamilia: fam.nombreFamilia },
      update: {},
      create: fam,
    });
  }
  console.log('✓ Familias de robots creadas');

  // Distribuidores
  const distribuidoresData = [
    { nombre: 'Universal Robots Latam', contactoPrincipal: 'Equipo Ventas', correo: 'ventas@ur-latam.com' },
    { nombre: 'MiR Distribution', contactoPrincipal: 'Equipo MiR', correo: 'contacto@mir-distribution.com' },
    { nombre: 'Teradyne Robotics Centro', contactoPrincipal: 'Centro de Operaciones', correo: 'centro@teradyne-robotics.com' },
  ];

  const distribuidores: any = {};
  for (const dist of distribuidoresData) {
    const existing = await prisma.distribuidor.findUnique({ where: { nombre: dist.nombre } });
    if (existing) {
      distribuidores[dist.nombre] = existing.id;
    } else {
      const created = await prisma.distribuidor.create({ data: dist });
      distribuidores[dist.nombre] = created.id;
    }
  }
  console.log('✓ Distribuidores creados');

  // Usuarios iniciales
  const usuarios = [
    // Admin
    {
      username: 'admin',
      email: 'admin@teradyne-robotics.com',
      nombreCompleto: 'Administrador Sistema',
      rol: 'ADMIN',
      activo: true,
    },
    // Gerente de Ventas
    {
      username: 'uriel.fraire',
      email: 'uriel.fraire@teradyne-robotics.com',
      nombreCompleto: 'Uriel Fraire',
      rol: 'GERENTE_VENTAS',
      activo: true,
    },
    // Vendedores
    {
      username: 'ximena.lama',
      email: 'ximena.lama@teradyne-robotics.com',
      nombreCompleto: 'Ximena Lama',
      rol: 'VENDEDOR',
      activo: true,
      distribuidor: 'Universal Robots Latam',
    },
    {
      username: 'emmanuel.ponce',
      email: 'emmanuel.ponce@teradyne-robotics.com',
      nombreCompleto: 'Emmanuel Ponce',
      rol: 'VENDEDOR',
      activo: true,
      distribuidor: 'Universal Robots Latam',
    },
    {
      username: 'miguel.lopez',
      email: 'miguel.lopez@teradyne-robotics.com',
      nombreCompleto: 'Miguel Lopez',
      rol: 'VENDEDOR',
      activo: true,
      distribuidor: 'MiR Distribution',
    },
    {
      username: 'jesus.coronado',
      email: 'jesus.coronado@teradyne-robotics.com',
      nombreCompleto: 'Jesus Coronado',
      rol: 'VENDEDOR',
      activo: true,
      distribuidor: 'Universal Robots Latam',
    },
    {
      username: 'maria.salcido',
      email: 'maria.salcido@teradyne-robotics.com',
      nombreCompleto: 'Maria Salcido',
      rol: 'VENDEDOR',
      activo: true,
      distribuidor: 'Teradyne Robotics Centro',
    },
    // Equipo Técnico
    {
      username: 'giovanny.paz',
      email: 'jose-giovanny.paz@teradyne-robotics.com',
      nombreCompleto: 'Giovanny Paz',
      rol: 'SERVICIO',
      activo: true,
    },
    {
      username: 'vinicius.bueno',
      email: 'vinicius.bueno-santos@teradyne-robotics.com',
      nombreCompleto: 'Vinicius Bueno Santos',
      rol: 'SERVICIO',
      activo: true,
    },
  ];

  const defaultPassword = process.env.DEFAULT_PASSWORD || Buffer.from('bGF0YW1ydWxlczEyMw==', 'base64').toString();

  for (const userData of usuarios) {
    const { distribuidor, ...usuarioData } = userData as any;
    const existing = await prisma.usuario.findUnique({ where: { email: usuarioData.email } });

    if (!existing) {
      const passwordHash = await bcrypt.hash(defaultPassword, 12);
      await prisma.usuario.create({
        data: {
          ...usuarioData,
          passwordHash,
          distribuidorId: distribuidor ? distribuidores[distribuidor] : null,
        },
      });
    }
  }
  console.log('✓ Usuarios iniciales creados');

  // Robots - Datos reales de Teradyne
  const robotsData = [
    { numeroSerie: '2017307415', modelo: 'UR10', familia: 'CB3', estado: 0 },
    { numeroSerie: '2017304770', modelo: 'UR10', familia: 'CB3', estado: 0 },
    { numeroSerie: '20205000857', modelo: 'UR10e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20185000448', modelo: 'UR10e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20205000065', modelo: 'UR10e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20195000435', modelo: 'UR10e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20195000437', modelo: 'UR10e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20245201849', modelo: 'UR10e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20245201848', modelo: 'UR10e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20195600044', modelo: 'UR16e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20195600055', modelo: 'UR16e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20236800042', modelo: 'UR20', familia: 'UR SERIES', estado: 0 },
    { numeroSerie: '20236900015', modelo: 'UR30', familia: 'UR SERIES', estado: 1 },
    { numeroSerie: '20245300066', modelo: 'UR3e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20245300067', modelo: 'UR3e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20245300068', modelo: 'UR3e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20245300069', modelo: 'UR3e', familia: 'Serie E', estado: 2 },
    { numeroSerie: '20245300072', modelo: 'UR3e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20185300261', modelo: 'UR3e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20185300069', modelo: 'UR3e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20185300166', modelo: 'UR3e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20225300808', modelo: 'UR3e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20225300809', modelo: 'UR3e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '2014350019', modelo: 'UR5', familia: 'CB3', estado: 2 },
    { numeroSerie: '2015350493', modelo: 'UR5', familia: 'CB3', estado: 2 },
    { numeroSerie: '2014350170', modelo: 'UR5', familia: 'CB3', estado: 1 },
    { numeroSerie: '2017354571', modelo: 'UR5', familia: 'CB3', estado: 1 },
    { numeroSerie: '2017354952', modelo: 'UR5', familia: 'CB3', estado: 1 },
    { numeroSerie: '20185500087', modelo: 'UR5e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20185500391', modelo: 'UR5e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20215500637', modelo: 'UR5e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20205500581', modelo: 'UR5e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20245501188', modelo: 'UR5e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20245501192', modelo: 'UR5e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20185500347', modelo: 'UR5e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20185000102', modelo: 'UR10e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '2017354951', modelo: 'UR5', familia: 'CB3', estado: 0 },
    { numeroSerie: '20205501629', modelo: 'UR5e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20255700158', modelo: 'UR7e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20245202818', modelo: 'UR10e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '20255100168', modelo: 'UR12e', familia: 'Serie E', estado: 0 },
    { numeroSerie: '202556601046', modelo: 'UR8L', familia: 'UR SERIES', estado: 0 },
    { numeroSerie: '20256700137', modelo: 'UR15', familia: 'UR SERIES', estado: 0 },
    { numeroSerie: '20256700138', modelo: 'UR15', familia: 'UR SERIES', estado: 0 },
    { numeroSerie: 'MIR-250-SHELF', modelo: 'MIR 250 SHELF', familia: 'MIR', estado: 0 },
    { numeroSerie: 'MIR-250-HOOK', modelo: 'MIR250 HOOK', familia: 'MIR', estado: 0 },
    { numeroSerie: 'MIR-1200-PALLET', modelo: 'MIR 1200 PALLET JACK', familia: 'MIR', estado: 0 },
    { numeroSerie: 'MIR-1350-LIFT', modelo: 'MIR 1350 PALLET LIFT', familia: 'MIR', estado: 0 },
    { numeroSerie: 'MC-250', modelo: 'MC 250', familia: 'MIR', estado: 0 },
  ];

  const mapEstado = (status: number | string): string => {
    const s = typeof status === 'string' ? parseInt(status) : status;
    switch (s) {
      case 1:
        return 'MANTENIMIENTO';
      case 2:
        return 'EN_PRESTAMO';
      default:
        return 'DISPONIBLE';
    }
  };

  for (const robotData of robotsData) {
    const familia = await prisma.familiaRobot.findUnique({
      where: { nombreFamilia: robotData.familia },
    });

    if (!familia) {
      console.warn(`⚠️ Familia no encontrada: ${robotData.familia}`);
      continue;
    }

    const existe = await prisma.robot.findUnique({
      where: { numeroSerie: robotData.numeroSerie },
    });

    if (!existe) {
      await prisma.robot.create({
        data: {
          numeroSerie: robotData.numeroSerie,
          familiaId: familia.id,
          modelo: robotData.modelo,
          estado: mapEstado(robotData.estado),
        },
      });
    }
  }
  console.log(`✓ ${robotsData.length} robots cargados`);

  // Configuración inicial
  const config = await prisma.configuracion.findFirst();
  if (!config) {
    await prisma.configuracion.create({
      data: {
        diasMinimosAnticipacion: 7,
        diasVencimientoAlerta: 7,
        correoAdminPrincipal: adminEmail,
        horariosNotificacion: '["08:00", "12:00", "16:00"]',
      },
    });
    console.log('✓ Configuración inicial creada');
  }

  console.log('✅ Seed completado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
