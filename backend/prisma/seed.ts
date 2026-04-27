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

  // Distribuidores ejemplo
  const distribuidores = [
    { nombre: 'Distribuidora ABC', contactoPrincipal: 'Pedro García', correo: 'contacto@abc.com' },
    { nombre: 'Distribuidora XYZ', contactoPrincipal: 'Ana López', correo: 'contacto@xyz.com' },
  ];

  for (const dist of distribuidores) {
    const existing = await prisma.distribuidor.findUnique({ where: { nombre: dist.nombre } });
    if (!existing) {
      await prisma.distribuidor.create({ data: dist });
    }
  }
  console.log('✓ Distribuidores creados');

  // Usuario admin por defecto
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@teradyne-robotics.com';
  const adminExists = await prisma.usuario.findUnique({ where: { email: adminEmail } });

  if (!adminExists) {
    const passwordHash = await bcrypt.hash('admin123', 12);
    await prisma.usuario.create({
      data: {
        username: 'admin',
        email: adminEmail,
        passwordHash,
        nombreCompleto: 'Administrador',
        rol: 'ADMIN',
        activo: true,
      },
    });
    console.log(`✓ Usuario admin creado: ${adminEmail} / admin123`);
  }

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
