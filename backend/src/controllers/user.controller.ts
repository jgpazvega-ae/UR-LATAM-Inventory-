import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { sendEmail, templates } from '../services/email.service';

export const listarUsuarios = async (req: AuthRequest, res: Response) => {
  try {
    const { activo, rol } = req.query;
    const where: any = {};
    if (activo !== undefined) where.activo = activo === 'true';
    if (rol) where.rol = rol;

    const usuarios = await prisma.usuario.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        nombreCompleto: true,
        rol: true,
        activo: true,
        distribuidor: true,
        fechaCreacion: true,
        fechaUltimoLogin: true,
      },
      orderBy: { fechaCreacion: 'desc' },
    });

    return res.json(usuarios);
  } catch {
    return res.status(500).json({ error: 'Error al listar usuarios' });
  }
};

export const obtenerUsuario = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: { distribuidor: true },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { passwordHash, ...sinPassword } = usuario;
    return res.json(sinPassword);
  } catch {
    return res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

export const crearUsuario = async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, password, nombreCompleto, rol, distribuidorId, activo } = req.body;

    const existe = await prisma.usuario.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existe) {
      return res.status(400).json({ error: 'Email o usuario ya registrado' });
    }

    const passwordHash = await bcrypt.hash(password || 'default', 12);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        username,
        email,
        passwordHash,
        nombreCompleto,
        rol: rol || 'VENDEDOR',
        distribuidorId: distribuidorId || null,
        activo: activo ?? false,
      },
    });

    if (activo) {
      await sendEmail({
        to: email,
        subject: '✅ Cuenta Activada',
        html: templates.cuentaActivada({ nombre: nombreCompleto }),
      });
    }

    const { passwordHash: _, ...resultado } = nuevoUsuario;
    return res.status(201).json(resultado);
  } catch (error) {
    console.error('Error creando usuario:', error);
    return res.status(500).json({ error: 'Error al crear usuario' });
  }
};

export const actualizarUsuario = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, nombreCompleto, rol, distribuidorId, activo } = req.body;

    const usuarioActual = await prisma.usuario.findUnique({ where: { id } });
    if (!usuarioActual) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(nombreCompleto && { nombreCompleto }),
        ...(rol && { rol }),
        ...(distribuidorId !== undefined && { distribuidorId }),
        ...(activo !== undefined && { activo }),
      },
    });

    if (!usuarioActual.activo && activo === true) {
      await sendEmail({
        to: usuario.email,
        subject: '✅ Cuenta Activada',
        html: templates.cuentaActivada({ nombre: usuario.nombreCompleto }),
      });
    }

    const { passwordHash: _, ...resultado } = usuario;
    return res.json(resultado);
  } catch {
    return res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

export const activarUsuario = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { distribuidorId } = req.body;

    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        activo: true,
        ...(distribuidorId && { distribuidorId }),
      },
    });

    await sendEmail({
      to: usuario.email,
      subject: '✅ Cuenta Activada',
      html: templates.cuentaActivada({ nombre: usuario.nombreCompleto }),
    });

    return res.json({ mensaje: 'Usuario activado y notificado' });
  } catch {
    return res.status(500).json({ error: 'Error al activar usuario' });
  }
};

export const eliminarUsuario = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.usuario.delete({ where: { id } });
    return res.json({ mensaje: 'Usuario eliminado' });
  } catch {
    return res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

export const listarDistribuidores = async (_req: AuthRequest, res: Response) => {
  try {
    const distribuidores = await prisma.distribuidor.findMany({
      orderBy: { nombre: 'asc' },
    });
    return res.json(distribuidores);
  } catch {
    return res.status(500).json({ error: 'Error al listar distribuidores' });
  }
};

export const crearDistribuidor = async (req: AuthRequest, res: Response) => {
  try {
    const distribuidor = await prisma.distribuidor.create({ data: req.body });
    return res.status(201).json(distribuidor);
  } catch {
    return res.status(500).json({ error: 'Error al crear distribuidor' });
  }
};

export const resetearPassword = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.rol !== 'ADMIN') {
      return res.status(403).json({ error: 'Solo administradores pueden resetear contraseñas' });
    }

    const { usuarioId } = req.params;
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Generate temporary password (12 random characters)
    const tempPassword = Math.random().toString(36).substring(2, 14);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        passwordHash,
        forcePasswordReset: true,
      },
    });

    return res.json({
      mensaje: `Contraseña reseteada para ${usuario.nombreCompleto}`,
      tempPassword,
      instrucciones: 'Comparte esta contraseña temporal con el usuario. Deberá cambiarla al siguiente login.',
    });
  } catch (error) {
    console.error('Error reseteando contraseña:', error);
    return res.status(500).json({ error: 'Error al resetear contraseña' });
  }
};
