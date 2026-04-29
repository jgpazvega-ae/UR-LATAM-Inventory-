#!/usr/bin/env node

/**
 * Email Testing Script
 * Testa la configuración y envío de emails
 *
 * Uso: npm run test:email
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('\n🧪 Testing Email Configuration\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Validar variables de entorno
console.log('\n1️⃣  Verificando variables de entorno...\n');

const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error(`❌ Faltan variables de entorno: ${missing.join(', ')}`);
  console.error('\n📝 Configura tu archivo .env con:\n');
  console.error(`
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-o-app-password
EMAIL_FROM=noreply@teradyne-robotics.com
  `);
  process.exit(1);
}

console.log('✅ Variables de entorno configuradas:');
console.log(`   - EMAIL_HOST: ${process.env.EMAIL_HOST}`);
console.log(`   - EMAIL_PORT: ${process.env.EMAIL_PORT}`);
console.log(`   - EMAIL_USER: ${process.env.EMAIL_USER}`);
console.log(`   - EMAIL_FROM: ${process.env.EMAIL_FROM}`);

// Crear transporter
console.log('\n2️⃣  Creando conexión SMTP...\n');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verificar conexión
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error conectando a SMTP:');
    console.error(error.message);
    console.error('\n⚠️  Solución rápida para Gmail:');
    console.error('1. Ve a: https://myaccount.google.com/apppasswords');
    console.error('2. Crea una contraseña de aplicación');
    console.error('3. Usa esa contraseña en EMAIL_PASS del .env');
    process.exit(1);
  } else {
    console.log('✅ Conexión SMTP verificada correctamente\n');
    testEmailSend();
  }
});

// Enviar email de prueba
function testEmailSend() {
  console.log('3️⃣  Enviando email de prueba...\n');

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1f2937 0%, #3b82f6 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; color: #1f2937; line-height: 1.6; }
        .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Teradyne Robotics</h1>
          <p>Sistema de Control de Inventarios</p>
        </div>
        <div class="content">
          <h2>🧪 Email de Prueba</h2>
          <div class="success-box">
            <p><strong>¡Excelente!</strong> Los emails están configurados correctamente.</p>
          </div>
          <p>Este es un email de prueba para validar que la configuración de SMTP funciona correctamente.</p>
          <h3>Información del Test:</h3>
          <ul>
            <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
            <li><strong>From:</strong> ${process.env.EMAIL_FROM}</li>
            <li><strong>Host:</strong> ${process.env.EMAIL_HOST}</li>
            <li><strong>Status:</strong> ✅ Exitoso</li>
          </ul>
          <p>Los siguientes eventos enviarán emails automáticamente:</p>
          <ul>
            <li>✅ Solicitud de demo creada → Email al solicitante y gerente</li>
            <li>✅ Solicitud aprobada → Email al solicitante y servicio</li>
            <li>✅ Solicitud rechazada → Email al solicitante y servicio</li>
            <li>✅ Robot entregado → Email al solicitante</li>
            <li>✅ Robot devuelto → Email al solicitante</li>
          </ul>
        </div>
        <div class="footer">
          <p>Este es un correo automático del sistema. Por favor no responder.</p>
          <p>&copy; ${new Date().getFullYear()} Teradyne Robotics</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_USER,
    subject: '🧪 Email de Prueba - Teradyne Robotics',
    html: htmlTemplate,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Error enviando email:');
      console.error(error.message);
      console.error('\n💡 Tips de solución:');
      console.error('- Verifica que EMAIL_USER y EMAIL_PASS sean correctos');
      console.error('- Para Gmail, usa Contraseña de Aplicación (AppPassword)');
      console.error('- Habilita "Acceso a apps menos seguras" si usas contraseña normal');
      process.exit(1);
    } else {
      console.log('✅ Email enviado exitosamente!\n');
      console.log('📧 Detalles:');
      console.log(`   - Message ID: ${info.messageId}`);
      console.log(`   - Response: ${info.response}`);
      console.log(`   - Para: ${process.env.EMAIL_USER}\n`);

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n✅ Configuración de Email EXITOSA\n');
      console.log('Los emails se enviarán automáticamente cuando:');
      console.log('  1. Se cree una solicitud de demo');
      console.log('  2. Se apruebe o rechace una solicitud');
      console.log('  3. Se confirme entrega o devolución de robots\n');

      process.exit(0);
    }
  });
}
