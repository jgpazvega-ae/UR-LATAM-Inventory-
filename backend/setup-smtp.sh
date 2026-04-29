#!/bin/bash

echo "🔧 Configurar SMTP para envío de emails"
echo "======================================="
echo ""
echo "Necesitas un App Password de Gmail."
echo "Si no lo tienes, ve a: https://myaccount.google.com/apppasswords"
echo ""

read -p "📧 Email de Gmail: " EMAIL_USER
read -s -p "🔐 App Password (16 caracteres, se ocultará mientras escribes): " EMAIL_PASS
echo ""

# Actualizar .env
sed -i "s|EMAIL_USER=.*|EMAIL_USER=$EMAIL_USER|g" .env
sed -i "s|EMAIL_PASS=.*|EMAIL_PASS=$EMAIL_PASS|g" .env

echo ""
echo "✅ Credenciales guardadas en .env"
echo ""
echo "Reiniciando backend..."
echo ""

# Matar backend anterior y reiniciar
pkill -f "npm run dev" 2>/dev/null || true
sleep 2

npm run dev > backend.log 2>&1 &

sleep 4

echo "✅ Backend reiniciado en http://localhost:5000"
echo ""
echo "Próximos pasos:"
echo "1. Abre http://localhost:3000 en el navegador"
echo "2. Ve a ⚙️ Configuración"
echo "3. Click en '🧪 Enviar Email de Prueba'"
echo "4. Ingresa tu email y click en '📨 Enviar Email de Prueba'"
echo ""
