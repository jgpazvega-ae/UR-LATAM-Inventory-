const nodemailer = require('nodemailer');
require('dotenv').config();

async function testSMTP() {
  console.log('🧪 Testando configuración SMTP...\n');

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    console.log('📬 Credenciales SMTP:');
    console.log(`   Host: ${process.env.EMAIL_HOST}`);
    console.log(`   Port: ${process.env.EMAIL_PORT}`);
    console.log(`   User: ${process.env.EMAIL_USER}`);
    console.log(`   From: ${process.env.EMAIL_FROM}`);
    console.log('');

    console.log('📤 Enviando email de prueba...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      subject: '🧪 Email de Prueba - SMTP Funciona',
      html: `
        <h2>✅ Email de Prueba</h2>
        <p>Si recibiste este email, tu configuración SMTP está funcionando correctamente.</p>
        <p><strong>Usuario:</strong> ${process.env.EMAIL_USER}</p>
        <p><strong>Host:</strong> ${process.env.EMAIL_HOST}</p>
        <p>Ahora puedes usar el sistema para enviar notificaciones automáticas.</p>
      `,
    });

    console.log('✅ Email enviado exitosamente!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Sent to: ${process.env.EMAIL_USER}`);
    console.log('\n📧 Revisa tu bandeja de entrada (incluyendo SPAM)\n');
  } catch (error) {
    console.error('❌ Error al enviar email:');
    console.error(`   ${error.message}`);
    console.log('\nVerifica que:');
    console.log('  1. El App Password sea correcto (sin espacios)');
    console.log('  2. Gmail tenga 2FA habilitado');
    console.log('  3. El firewall no bloquee puerto 587');
  }
}

testSMTP();
