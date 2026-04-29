import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendEmail, templates } from '../services/email.service';

export const testEmail = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.rol !== 'ADMIN') {
      return res.status(403).json({ error: 'Solo administradores pueden ejecutar tests' });
    }

    const { emailTo } = req.body;

    if (!emailTo) {
      return res.status(400).json({ error: 'Se requiere email de destino' });
    }

    const success = await sendEmail({
      to: emailTo,
      subject: '🧪 Email de Prueba - Teradyne Robotics',
      html: templates.cuentaActivada({ nombre: 'Usuario de Prueba' }),
    });

    if (success) {
      return res.json({
        mensaje: 'Email de prueba enviado exitosamente',
        emailTo,
        timestamp: new Date().toISOString(),
      });
    } else {
      return res.status(500).json({
        error: 'Error al enviar email - Verifica la configuración en .env',
        detalles: 'Asegúrate de que EMAIL_USER, EMAIL_PASS y EMAIL_HOST estén configurados correctamente',
      });
    }
  } catch (error) {
    console.error('Error en test email:', error);
    return res.status(500).json({
      error: 'Error durante prueba de email',
      detalles: String(error),
    });
  }
};

export const healthCheck = async (_req: AuthRequest, res: Response) => {
  try {
    return res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      emailConfig: {
        host: process.env.EMAIL_HOST || 'NO CONFIGURADO',
        user: process.env.EMAIL_USER ? '***' : 'NO CONFIGURADO',
        configured: !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error en health check' });
  }
};
