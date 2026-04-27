import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { sendEmail, templates } from '../services/email.service';

const generarToken = (userId: string): string =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, nombreCompleto } = req.body;

    if (!username || !email || !password || !nombreCompleto) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

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
        rol: 'VENDEDOR',
        activo: false,
      },
    });

    await sendEmail({
      to: email,
      subject: 'Cuenta Creada - Pendiente de Activación',
      html: templates.cuentaCreada({ nombre: nombreCompleto, email }),
    });

    return res.status(201).json({
      mensaje: 'Cuenta creada exitosamente. El administrador debe activarla.',
      usuario: { id: nuevoUsuario.id, username, email, nombreCompleto },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const usuario = await prisma.usuario.findFirst({
      where: { OR: [{ email }, { username: email }] },
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ error: 'Cuenta no activada. Contacta al administrador.' });
    }

    const passwordValido = password
      ? await bcrypt.compare(password, usuario.passwordHash)
      : true;

    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { fechaUltimoLogin: new Date() },
    });

    const token = generarToken(usuario.id);

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        nombreCompleto: usuario.nombreCompleto,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const me = async (req: any, res: Response) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        nombreCompleto: true,
        rol: true,
        distribuidor: true,
      },
    });
    return res.json(usuario);
  } catch {
    return res.status(500).json({ error: 'Error al obtener usuario' });
  }
};
