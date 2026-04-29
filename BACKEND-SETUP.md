# 🔧 Guía de Solución: Backend, Base de Datos y SMTP

## 0. 🗄️ Configurar Base de Datos (PostgreSQL)

### Requisito: PostgreSQL debe estar instalado y corriendo

**En Linux/Mac:**
```bash
# Instalar PostgreSQL
brew install postgresql  # Mac
sudo apt-get install postgresql postgresql-contrib  # Ubuntu/Debian

# Iniciar el servicio
brew services start postgresql  # Mac
sudo systemctl start postgresql  # Linux
```

**En Windows:**
- Descargar desde: https://www.postgresql.org/download/windows/
- Ejecutar instalador y seguir instrucciones

### Crear la base de datos

```bash
# Conectar como usuario postgres
psql -U postgres

# Dentro de PostgreSQL, ejecutar:
CREATE DATABASE ur_latam_inventory;
\q
```

### Aplicar migraciones

```bash
cd /home/user/UR-LATAM-Inventory-/backend
npm run db:generate    # Generar tipos Prisma
npm run db:migrate     # Aplicar migraciones
npm run db:seed        # Cargar datos iniciales (usuarios, robots, etc.)
```

**Resultado esperado:**
```
✓ Familias de robots creadas
✓ Distribuidores creados
✓ Usuarios iniciales creados
✓ 50+ robots cargados
✓ Configuración inicial creada
✅ Seed completado
```

---

## 1. ✅ Backend Ahora Está Corriendo

El backend está activo en `http://localhost:5000`

### Para mantenerlo corriendo:

**Opción 1: En Terminal (Recomendado para desarrollo)**
```bash
cd /home/user/UR-LATAM-Inventory-/backend
npm run dev
```

**Opción 2: Como servicio en segundo plano**
```bash
cd /home/user/UR-LATAM-Inventory-/backend
nohup npm run dev > backend.log 2>&1 &
```

---

## 2. 📧 Configurar SMTP (Gmail Recomendado)

### Opción A: Configurar a través de la UI (Recomendado)

**Requisito:** Base de datos debe estar corriendo

1. **Login como Admin**
2. Ve a **⚙️ Configuración**
3. Rellena estos campos EXACTAMENTE:

```
Host SMTP:        smtp.gmail.com
Puerto:           587
Email (Usuario):  tu-email@gmail.com
Contraseña:       [tu-app-password-de-16-caracteres]
Email Remitente:  noreply@teradyne-robotics.com
```

4. Click **✅ Guardar Configuración**

### Opción B: Configurar mediante .env (Si BD no está disponible)

1. Abre `/backend/.env`
2. Rellena estos campos:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password-de-16-caracteres
EMAIL_FROM=noreply@teradyne-robotics.com
```

3. Reinicia el backend: `npm run dev`

### Paso 1: Crear App Password en Google
1. Ve a: https://myaccount.google.com/apppasswords
2. Si pide 2FA, configúralo primero:
   - https://myaccount.google.com/security

3. En App Passwords:
   - **App**: Mail
   - **Device**: Windows/Mac/Linux
4. Google te da una contraseña de **16 caracteres**
5. **Copia exactamente esa contraseña** (sin espacios)

### IMPORTANTE: Cosas comunes que fallan

❌ **INCORRECTO**: Usar contraseña normal de Gmail
✅ **CORRECTO**: Usar App Password de 16 caracteres

❌ **INCORRECTO**: Espacios en la contraseña
✅ **CORRECTO**: Copiar exactamente sin espacios

❌ **INCORRECTO**: Puerto 465
✅ **CORRECTO**: Puerto 587

---

## 3. 🧪 Verificar que Todo Funciona

### Test 1: Email Simple
1. Click **🧪 Enviar Email de Prueba**
2. El panel debe mostrar:
   - ✅ Dropdown con usuarios registrados
   - ✅ Campo para email personalizado

3. Selecciona un usuario O ingresa un email
4. Click **📨 Enviar Email de Prueba**
5. **Resultado esperado**:
   - ✅ Verde: "Email enviado exitosamente"
   - Revisa bandeja de entrada (incluyendo SPAM)

### Test 2: Notificación + Email
1. Scroll a **🔔 Test del Sistema de Notificaciones**
2. Selecciona tipo de notificación
3. Ingresa tu email personal
4. Click **📤 Enviar Notificación de Prueba**
5. **Resultado esperado**:
   - ✅ Notificación aparece en 🔔
   - ✅ Email se envía a tu bandeja

---

## 4. 🐛 Solución de Problemas

### Problema: "El backend no está disponible"

**Causa**: El backend `npm run dev` no está corriendo

**Solución**:
```bash
# Abrir una nueva terminal
cd /home/user/UR-LATAM-Inventory-/backend
npm run dev
```

Espera a ver:
```
[INFO] XX:XX:XX ts-node-dev ver. 2.0.0
```

### Problema: "Email no se envía"

**Opción 1: Credenciales incorrectas**
- Verifica EXACTAMENTE en `⚙️ Configuración`
- Host SMTP debe ser: `smtp.gmail.com`
- Puerto debe ser: `587` (no 465)
- Contraseña debe ser App Password (16 caracteres)

**Opción 2: Firewall/Antivirus**
- Verifica que el puerto 587 esté abierto
- Algunos antivirus bloquean SMTP

**Opción 3: Gmail requiere 2FA**
- Si usas Gmail sin 2FA, genera App Password aquí:
  https://myaccount.google.com/apppasswords
- Si no ves esa opción, habilita 2FA primero:
  https://myaccount.google.com/security

### Problema: Email va a SPAM

**Solución**:
1. Marca como "No es spam" en Gmail
2. Configura el email en tus contactos
3. Los siguientes emails irán a Bandeja de Entrada

---

## 5. ✅ Checklist Final

### Base de Datos
- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `ur_latam_inventory` creada
- [ ] Migraciones aplicadas (`npm run db:migrate`)
- [ ] Datos iniciales cargados (`npm run db:seed`)

### Backend
- [ ] Backend corriendo (`npm run dev` en terminal)
- [ ] Backend responde en http://localhost:5000
- [ ] Health check muestra configuración: `curl http://localhost:5000/health`

### SMTP Configuration
- [ ] Credenciales SMTP configuradas (UI o .env)
- [ ] Email de prueba se envía exitosamente
- [ ] Email llega a bandeja (revisar SPAM)

### Funcionalidad
- [ ] Login funciona con usuarios iniciales
- [ ] Notificación local aparece en 🔔
- [ ] Email se envía cuando se aprueba/rechaza solicitud

---

## 6. 🚀 Flujo Completo (Con Backend y SMTP Funcionando)

**Escenario: Crear y aprobar una solicitud**

### Paso 1: Vendedor crea solicitud
```
Login como: emmanuel.ponce@teradyne-robotics.com
Ir a: 📋 Solicitudes Demo
Click: + Nueva Solicitud
Enviar ✅
```

**Resultado automático**:
- ✅ Email enviado a admin@teradyne-robotics.com
- ✅ Email enviado a uriel.fraire@teradyne-robotics.com
- ✅ Notificación para Uriel

### Paso 2: Gerente aprueba
```
Login como: uriel.fraire@teradyne-robotics.com
Ir a: 📋 Solicitudes Demo
Click: Aprobar
```

**Resultado automático**:
- ✅ Email enviado al vendedor: "Solicitud Aprobada"
- ✅ Email enviado a jose-giovanny.paz@... (SERVICIO)
- ✅ Notificaciones para equipo de servicio

### Paso 3: Servicio recolecta robot
```
Login como: jose-giovanny.paz@teradyne-robotics.com
Ir a: 📋 Solicitudes Demo
Click: ✅ Marcar como recolectado
```

**Resultado automático**:
- ✅ Notificaciones para todos (vendedor, servicio, Giovanny)

### Paso 4: Servicio devuelve robot
```
Click: ✔️ Verificado - Devolver a Disponible
```

**Resultado automático**:
- ✅ Email al vendedor: "Demo completada"
- ✅ Notificación al vendedor
- ✅ Robot vuelve a DISPONIBLE

---

## 7. 📞 Soporte Adicional

Si aún tienes problemas:

1. **Verifica el log del backend**:
```bash
# En la terminal donde corre el backend
# Busca mensajes de ERROR
```

2. **Prueba con otro proveedor**:
   - SendGrid
   - AWS SES
   - Microsoft Office 365

3. **Revisa las credenciales una vez más**:
   - Copia/pega desde Google App Passwords
   - Sin espacios
   - Exacto como se muestra

---

**Última actualización**: 29 de abril de 2026  
**Status**: ✅ Backend corriendo, listo para configurar SMTP
