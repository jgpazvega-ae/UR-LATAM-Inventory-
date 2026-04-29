# 📧 Guía Completa de Testing de Emails

## Resumen Rápido

El sistema envía emails automáticamente en estos eventos:
- ✅ **Solicitud creada** → Vendedor + Gerente de ventas
- ✅ **Solicitud aprobada** → Vendedor + Personal de servicio
- ✅ **Solicitud rechazada** → Vendedor + Personal de servicio
- ✅ **Robot entregado** → Vendedor
- ✅ **Robot devuelto** → Vendedor

---

## Paso 1: Configuración de Gmail (Recomendado)

### A. Crear Contraseña de Aplicación (AppPassword)

**Opción 1: Con 2FA habilitado (Recomendado)**

1. Ve a: https://myaccount.google.com/apppasswords
2. Selecciona:
   - App: "Mail" (Correo)
   - Device: "Windows/Mac/Linux"
3. Copia la contraseña de 16 caracteres generada
4. Pégala en tu `.env` como `EMAIL_PASS`

**Opción 2: Sin 2FA (Menos seguro)**

Si no tienes 2FA habilitado:
1. Ve a: https://myaccount.google.com/u/0/security
2. Busca "Acceso a aplicaciones menos seguras"
3. Actívalo
4. Usa tu contraseña normal de Gmail en `EMAIL_PASS`

### B. Configurar Archivo `.env`

Crea/edita `/backend/.env`:

```env
# Configuración de Base de Datos
DATABASE_URL="postgresql://user:password@localhost:5432/ur_latam_inventory"

# Configuración de Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password-de-16-caracteres
EMAIL_FROM=noreply@teradyne-robotics.com

# Frontend
FRONTEND_URL=http://localhost:3000

# Server
PORT=5000
NODE_ENV=development
```

**Nota:** Nunca hagas push del archivo `.env` a Git. Usa `.env.example` para referencia.

---

## Paso 2: Testear Configuración Inicial

### Ejecutar Script de Testing

```bash
cd backend
npm install  # Si no está instalado
npm run test:email
```

**Salida esperada:**

```
🧪 Testing Email Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  Verificando variables de entorno...
✅ Variables de entorno configuradas:
   - EMAIL_HOST: smtp.gmail.com
   - EMAIL_PORT: 587
   - EMAIL_USER: tu-email@gmail.com
   - EMAIL_FROM: noreply@teradyne-robotics.com

2️⃣  Creando conexión SMTP...
✅ Conexión SMTP verificada correctamente

3️⃣  Enviando email de prueba...
✅ Email enviado exitosamente!
```

**Si falla:**
```
❌ Error conectando a SMTP:
```

### Solución de Errores de SMTP

| Error | Solución |
|-------|----------|
| `Invalid login` | AppPassword incorredo, regenera uno |
| `Username and Password not accepted` | EMAIL_USER o EMAIL_PASS incorrecto |
| `Timeout` | Verifica conexión a internet, EMAIL_HOST/PORT correcto |
| `550 User not found` | EMAIL_USER no existe en Gmail |

---

## Paso 3: Testear Flujo Completo de Emails

### Escenario 1: Crear Solicitud

1. Inicia el servidor backend: `npm run dev`
2. Accede a la interfaz (frontend)
3. Login como vendedor (ej: `emmanuel.ponce@teradyne-robotics.com`)
4. Ve a "📋 Solicitudes Demo" → "+ Nueva Solicitud"
5. Completa el formulario:
   - Robot: Selecciona uno disponible
   - Fecha Inicio: Selecciona fecha (7+ días laborales desde hoy)
   - Fecha Fin: Selecciona fecha posterior
   - Observaciones: Opcional
6. Envía la solicitud

**Emails esperados:**
- ✅ Vendedor recibe: "Solicitud de Demo Creada"
- ✅ Gerente de Ventas recibe: "⏳ Aprobación Requerida"

### Escenario 2: Aprobar Solicitud

1. Login como Uriel (GERENTE_VENTAS)
2. Ve a "📋 Solicitudes Demo"
3. Busca la solicitud PENDIENTE
4. Haz click en "Aprobar"

**Emails esperados:**
- ✅ Vendedor recibe: "✅ Solicitud Aprobada"
- ✅ Personal de Servicio recibe: "✅ Solicitud Aprobada - Preparar Entrega"

### Escenario 3: Rechazar Solicitud

1. Login como Uriel (GERENTE_VENTAS)
2. Ve a "📋 Solicitudes Demo"
3. Busca una solicitud PENDIENTE
4. Haz click en "Rechazar" y escribe motivo

**Emails esperados:**
- ✅ Vendedor recibe: "❌ Solicitud Rechazada"
- ✅ Personal de Servicio recibe: "❌ Solicitud Rechazada"

### Escenario 4: Confirmar Salida (Entrega de Robot)

1. Login como Personal de Servicio
2. Ve a "📋 Solicitudes Demo"
3. Busca solicitud APROBADA
4. Haz click en "Confirmar Salida"

**Emails esperados:**
- ✅ Vendedor recibe: "Robot Entregado"

### Escenario 5: Confirmar Recepción (Devolución de Robot)

1. Login como Personal de Servicio
2. Ve a "📋 Solicitudes Demo"
3. Busca solicitud ACTIVA
4. Haz click en "Confirmar Recepción"

**Emails esperados:**
- ✅ Vendedor recibe: "Robot Devuelto - Caso Cerrado"

---

## Paso 4: Verificar Emails Recibidos

### En Gmail:

1. Abre tu bandeja de entrada en Gmail
2. Busca por remitente: `noreply@teradyne-robotics.com`
3. Los emails deberían tener:
   - Diseño profesional con logo de Teradyne
   - Información clara del estado de la solicitud
   - Detalles del robot y fechas
   - Próximas acciones requeridas

### Filtros para encontrarlos:

```
from:noreply@teradyne-robotics.com
subject:(Solicitud OR Aprobada OR Rechazada OR Entregado OR Devuelto)
```

---

## Paso 5: Monitoreo en Producción

### Ver Logs de Email

En backend, los logs mostrarán:

```
✅ Email enviado a usuario@ejemplo.com
📧 Template: solicitudCreada
⏰ Timestamp: 2026-04-29T...
```

### Errores Comunes en Logs

| Error | Causa | Solución |
|-------|-------|----------|
| `ECONNREFUSED` | No hay conexión SMTP | Verifica EMAIL_HOST y PORT |
| `Invalid credentials` | EMAIL_USER/PASS incorrecto | Regenera AppPassword en Gmail |
| `timeout` | Servidor SMTP lento/offline | Intenta de nuevo en 30 segundos |

---

## Paso 6: Proveedores Alternativos de Email

Si no usas Gmail, puedes usar:

### SendGrid

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@teradyne-robotics.com
```

### AWS SES

```env
EMAIL_HOST=email-smtp.region.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-smtp-user
EMAIL_PASS=your-smtp-password
EMAIL_FROM=verified-email@yourdomain.com
```

### Microsoft Office 365

```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@company.com
EMAIL_PASS=your-password
EMAIL_FROM=your-email@company.com
```

---

## Checklist de Validación

- [ ] Archivo `.env` configurado en `/backend/.env`
- [ ] `npm run test:email` ejecutado exitosamente
- [ ] Email de prueba recibido en bandeja de entrada
- [ ] Solicitud creada y email enviado a vendedor
- [ ] Solicitud aprobada y emails enviados
- [ ] Emails con formato profesional
- [ ] Todos los datos en emails son correctos

---

## Troubleshooting

### Q: Los emails no se envían pero no hay error

**R:** Verifica en Gmail spam o promociones. Agrega a contactos.

### Q: El email se envía pero llega al spam

**R:** 
- Verifica SPF records de tu dominio
- Usa un dominio profesional en `EMAIL_FROM`
- Configura DKIM si es posible

### Q: ¿Cómo cambiar el remitente (From)?

**R:** Edita `EMAIL_FROM` en `.env`:
```env
EMAIL_FROM=demos@tuempresa.com
```

### Q: ¿Puedo enviar emails a múltiples destinatarios?

**R:** Sí, el sistema ya lo hace:
- Solicitud: Vendedor + Gerente
- Aprobación: Vendedor + Servicio
- Rechazo: Vendedor + Servicio

---

## API de Testing Manual

Si prefieres testear sin la interfaz web:

```bash
# 1. Obtener token JWT
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@teradyne-robotics.com",
    "password":"latamrules123"
  }'

# Copiar el token de la respuesta

# 2. Enviar email de prueba
curl -X POST http://localhost:5000/api/test/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TU-TOKEN-JWT>" \
  -d '{
    "emailTo":"usuario@ejemplo.com"
  }'

# Respuesta exitosa:
{
  "mensaje": "Email de prueba enviado exitosamente",
  "emailTo": "usuario@ejemplo.com",
  "timestamp": "2026-04-29T10:30:00Z"
}
```

---

## Documentación Relacionada

- [Backend Email Service](./backend/src/services/email.service.ts)
- [Prestamo Controller](./backend/src/controllers/prestamo.controller.ts)
- [Email Templates](./backend/src/services/email.service.ts#L79)

---

**Última actualización:** 29 de abril de 2026
**Status:** ✅ Sistema de emails completamente integrado y listo para testing
