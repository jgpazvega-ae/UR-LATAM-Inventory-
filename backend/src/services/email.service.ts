import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@teradyne-robotics.com',
      to: Array.isArray(options.to) ? options.to.join(',') : options.to,
      cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(',') : options.cc) : undefined,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('Error enviando email:', error);
    return false;
  }
};

const baseTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1f2937 0%, #3b82f6 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 5px 0 0; opacity: 0.9; font-size: 14px; }
    .content { padding: 30px 20px; color: #1f2937; line-height: 1.6; }
    .content h2 { color: #1f2937; font-size: 20px; margin-top: 0; }
    .info-box { background: #f3f4f6; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .danger-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 15px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    table td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
    table td:first-child { font-weight: bold; color: #6b7280; width: 40%; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Teradyne Robotics</h1>
      <p>Sistema de Control de Inventarios</p>
    </div>
    <div class="content">
      <h2>${title}</h2>
      ${content}
    </div>
    <div class="footer">
      <p>Este es un correo automático del sistema. Por favor no responder.</p>
      <p>&copy; ${new Date().getFullYear()} Teradyne Robotics</p>
    </div>
  </div>
</body>
</html>
`;

export const templates = {
  solicitudCreada: (data: { numeroSolicitud: string; nombre: string; robots: string; fechaInicio: string; fechaFin: string; motivo: string }) =>
    baseTemplate('Solicitud de Demo Creada', `
      <p>Hola <strong>${data.nombre}</strong>,</p>
      <p>Tu solicitud de demo ha sido registrada exitosamente y está en espera de aprobación.</p>
      <div class="info-box">
        <table>
          <tr><td>Número de Solicitud:</td><td><strong>${data.numeroSolicitud}</strong></td></tr>
          <tr><td>Robots:</td><td>${data.robots}</td></tr>
          <tr><td>Fecha Inicio:</td><td>${data.fechaInicio}</td></tr>
          <tr><td>Fecha Fin:</td><td>${data.fechaFin}</td></tr>
          <tr><td>Motivo:</td><td>${data.motivo}</td></tr>
        </table>
      </div>
      <p>Recibirás una notificación cuando tu solicitud sea aprobada o rechazada.</p>
    `),

  solicitudAprobada: (data: { numeroSolicitud: string; nombre: string; robots: string; fechaInicio: string; fechaFin: string }) =>
    baseTemplate('✅ Solicitud Aprobada', `
      <p>Hola <strong>${data.nombre}</strong>,</p>
      <div class="success-box">
        <p><strong>¡Buenas noticias!</strong> Tu solicitud de demo ha sido aprobada.</p>
      </div>
      <table>
        <tr><td>Número de Solicitud:</td><td><strong>${data.numeroSolicitud}</strong></td></tr>
        <tr><td>Robots:</td><td>${data.robots}</td></tr>
        <tr><td>Fecha Inicio:</td><td>${data.fechaInicio}</td></tr>
        <tr><td>Fecha Fin:</td><td>${data.fechaFin}</td></tr>
      </table>
      <p>El personal de servicio coordinará la salida de los equipos en la fecha programada.</p>
    `),

  solicitudRechazada: (data: { numeroSolicitud: string; nombre: string; motivo: string }) =>
    baseTemplate('Solicitud Rechazada', `
      <p>Hola <strong>${data.nombre}</strong>,</p>
      <div class="danger-box">
        <p>Lamentamos informarte que tu solicitud <strong>${data.numeroSolicitud}</strong> ha sido rechazada.</p>
      </div>
      <p><strong>Motivo:</strong></p>
      <p>${data.motivo}</p>
      <p>Si tienes preguntas, por favor contacta al administrador.</p>
    `),

  salidaConfirmada: (data: { numeroSolicitud: string; nombre: string; robots: string; fechaSalida: string }) =>
    baseTemplate('Robot Entregado', `
      <p>Hola <strong>${data.nombre}</strong>,</p>
      <div class="success-box">
        <p>Los siguientes robots han sido entregados exitosamente:</p>
      </div>
      <table>
        <tr><td>Número de Solicitud:</td><td><strong>${data.numeroSolicitud}</strong></td></tr>
        <tr><td>Robots:</td><td>${data.robots}</td></tr>
        <tr><td>Fecha de Salida:</td><td>${data.fechaSalida}</td></tr>
      </table>
      <p>Recuerda devolver los equipos antes de la fecha de fin acordada.</p>
    `),

  alertaVencimiento: (data: { numeroSolicitud: string; nombre: string; robots: string; diasRestantes: number; fechaFin: string }) =>
    baseTemplate(`Recordatorio: Tu Demo Vence en ${data.diasRestantes} Días`, `
      <p>Hola <strong>${data.nombre}</strong>,</p>
      <div class="alert-box">
        <p><strong>⏰ Recordatorio importante:</strong> Tu préstamo está próximo a vencer.</p>
      </div>
      <table>
        <tr><td>Número de Solicitud:</td><td><strong>${data.numeroSolicitud}</strong></td></tr>
        <tr><td>Robots:</td><td>${data.robots}</td></tr>
        <tr><td>Fecha de Vencimiento:</td><td><strong>${data.fechaFin}</strong></td></tr>
        <tr><td>Días Restantes:</td><td><strong>${data.diasRestantes}</strong></td></tr>
      </table>
      <p>Por favor coordina la devolución antes de la fecha de vencimiento.</p>
    `),

  alertaVencido: (data: { numeroSolicitud: string; nombre: string; robots: string; diasVencido: number; critico?: boolean }) =>
    baseTemplate(data.critico ? '🚨 CRÍTICO: Demo Vencida' : '⚠️ Tu Demo ha Vencido', `
      <p>Hola <strong>${data.nombre}</strong>,</p>
      <div class="${data.critico ? 'danger-box' : 'alert-box'}">
        <p><strong>${data.critico ? '🚨 ATENCIÓN URGENTE:' : '⚠️ AVISO:'}</strong> Tu préstamo está vencido${data.critico ? ` desde hace ${data.diasVencido} días` : ''}.</p>
      </div>
      <table>
        <tr><td>Número de Solicitud:</td><td><strong>${data.numeroSolicitud}</strong></td></tr>
        <tr><td>Robots:</td><td>${data.robots}</td></tr>
        <tr><td>Días Vencido:</td><td><strong>${data.diasVencido}</strong></td></tr>
      </table>
      <p><strong>Por favor coordina el retorno inmediato de los equipos.</strong></p>
    `),

  recepcionConfirmada: (data: { numeroSolicitud: string; nombre: string; robots: string; fechaRecepcion: string }) =>
    baseTemplate('Robot Devuelto - Caso Cerrado', `
      <p>Hola <strong>${data.nombre}</strong>,</p>
      <div class="success-box">
        <p>Los robots han sido recibidos correctamente. El caso ha sido cerrado.</p>
      </div>
      <table>
        <tr><td>Número de Solicitud:</td><td><strong>${data.numeroSolicitud}</strong></td></tr>
        <tr><td>Robots:</td><td>${data.robots}</td></tr>
        <tr><td>Fecha de Recepción:</td><td>${data.fechaRecepcion}</td></tr>
      </table>
      <p>¡Gracias por usar nuestro sistema de demos!</p>
    `),

  cuentaCreada: (data: { nombre: string; email: string }) =>
    baseTemplate('Cuenta Creada - Pendiente de Activación', `
      <p>Hola <strong>${data.nombre}</strong>,</p>
      <p>Tu cuenta ha sido creada exitosamente con el correo <strong>${data.email}</strong>.</p>
      <div class="alert-box">
        <p>⏳ Tu cuenta está <strong>pendiente de activación</strong> por parte del administrador.</p>
        <p>Recibirás un correo cuando tu cuenta sea activada.</p>
      </div>
    `),

  cuentaActivada: (data: { nombre: string }) =>
    baseTemplate('✅ Cuenta Activada', `
      <p>Hola <strong>${data.nombre}</strong>,</p>
      <div class="success-box">
        <p>¡Tu cuenta ha sido activada! Ya puedes acceder al sistema.</p>
      </div>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Ingresar al Sistema</a>
    `),

  solicitudParaAprobacion: (data: { numeroSolicitud: string; solicitante: string; robots: string; fechaInicio: string; fechaFin: string; motivo: string }) =>
    baseTemplate('📋 Nueva Solicitud Pendiente de Aprobación', `
      <p>Hola,</p>
      <div class="info-box">
        <p><strong>Hay una nueva solicitud de demo pendiente de aprobación.</strong></p>
      </div>
      <table>
        <tr><td>Número de Solicitud:</td><td><strong>${data.numeroSolicitud}</strong></td></tr>
        <tr><td>Solicitante:</td><td>${data.solicitante}</td></tr>
        <tr><td>Robots:</td><td>${data.robots}</td></tr>
        <tr><td>Fecha Inicio:</td><td>${data.fechaInicio}</td></tr>
        <tr><td>Fecha Fin:</td><td>${data.fechaFin}</td></tr>
        <tr><td>Motivo:</td><td>${data.motivo}</td></tr>
      </table>
      <p>Por favor, revisa el sistema para aprobar o rechazar esta solicitud.</p>
    `),

  resultadoSolicitud: (data: { numeroSolicitud: string; solicitante: string; estado: 'APROBADO' | 'RECHAZADO'; robots: string; fechaInicio: string; fechaFin: string; motivo?: string }) =>
    baseTemplate(
      data.estado === 'APROBADO' ? '✅ Solicitud Aprobada' : '❌ Solicitud Rechazada',
      `
      <p>Hola,</p>
      <div class="${data.estado === 'APROBADO' ? 'success-box' : 'danger-box'}">
        <p><strong>La solicitud ${data.numeroSolicitud} ha sido ${data.estado === 'APROBADO' ? 'APROBADA' : 'RECHAZADA'}.</strong></p>
      </div>
      <table>
        <tr><td>Número de Solicitud:</td><td><strong>${data.numeroSolicitud}</strong></td></tr>
        <tr><td>Solicitante:</td><td>${data.solicitante}</td></tr>
        <tr><td>Robots:</td><td>${data.robots}</td></tr>
        <tr><td>Período:</td><td>${data.fechaInicio} - ${data.fechaFin}</td></tr>
        ${data.motivo ? `<tr><td>Motivo Rechazo:</td><td>${data.motivo}</td></tr>` : ''}
      </table>
      <p>${data.estado === 'APROBADO'
        ? 'El personal de servicio coordinará los detalles de entrega.'
        : 'Se ha notificado al solicitante sobre el rechazo.'}</p>
    `)
};

export default { sendEmail, templates };
