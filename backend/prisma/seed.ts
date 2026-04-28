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

  for (const userData of usuarios) {
    const { distribuidor, ...usuarioData } = userData as any;
    const existing = await prisma.usuario.findUnique({ where: { email: usuarioData.email } });

    if (!existing) {
      const passwordHash = await bcrypt.hash('password123', 12);
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
