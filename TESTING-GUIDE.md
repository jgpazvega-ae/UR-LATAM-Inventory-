# 🧪 Guía de Testing - Sistema de Inventario UR LATAM

## 1. Configuración de Emails (SMTP)

### Paso 1: Configurar Gmail
1. Ve a: https://myaccount.google.com/apppasswords
2. Selecciona:
   - **App**: Mail
   - **Device**: Windows/Mac/Linux
3. Copia la contraseña de 16 caracteres generada

### Paso 2: Guardar Configuración
1. Login como **Admin**
2. Ve a **⚙️ Configuración**
3. Completa los campos:
   - **Host SMTP**: `smtp.gmail.com`
   - **Puerto**: `587`
   - **Email (Usuario)**: Tu email de Gmail
   - **Contraseña/AppPassword**: La contraseña de 16 caracteres de Google
   - **Email Remitente**: `noreply@teradyne-robotics.com`
4. Click en **✅ Guardar Configuración**

### Paso 3: Probar Email
1. Click en **🧪 Enviar Email de Prueba**
2. Se mostrará un panel con:
   - Dropdown de usuarios registrados
   - Campo para ingresar email personalizado
3. Selecciona un usuario O ingresa un email personalizado
4. Click en **📨 Enviar Email de Prueba**
5. **Resultado esperado**:
   - ✅ Verde: Email enviado exitosamente
   - Revisa la bandeja de entrada (puede estar en SPAM)

---

## 2. Sistema de Notificaciones

### Paso 1: Test Manual de Notificaciones
1. Login como **cualquier usuario**
2. Ve a **⚙️ Configuración**
3. Scroll a **🔔 Test del Sistema de Notificaciones**
4. Selecciona un tipo:
   - ✅ Solicitud Aprobada (va a SERVICIO)
   - ❌ Solicitud Rechazada (va a VENDEDOR)
   - 🚚 Robot Recolectado (va a TODOS)
   - 📦 Robot Entregado
   - 🔄 Robot Devuelto
5. Click en **📤 Enviar Notificación de Prueba**
6. **Resultado esperado**:
   - 🔔 El icono de notificación muestra un número (badge)
   - Click en 🔔 para ver la notificación de prueba

---

## 3. Flujo Completo de Solicitudes

### Escenario: Solicitud desde el inicio hasta devolución

#### **Paso 1: Crear Solicitud (VENDEDOR)**
1. Login como: `emmanuel.ponce@teradyne-robotics.com` (VENDEDOR)
2. Ve a **📋 Solicitudes Demo**
3. Click **+ Nueva Solicitud**
4. Selecciona:
   - **Robot**: Cualquier robot disponible
   - **Fecha Inicio**: Mínimo 7 días desde hoy
   - **Fecha Fin**: Posterior a fecha inicio (máximo 60 días)
   - **PDF** (opcional): Puedes cargar un PDF
5. Click **Enviar Solicitud**
6. **Resultado esperado**:
   - ✅ Mensaje: "Solicitud enviada"
   - 📧 Email enviado a admin
   - 🔔 Notificación para Uriel (GERENTE_VENTAS)

#### **Paso 2: Aprobar Solicitud (GERENTE_VENTAS - Uriel)**
1. Logout
2. Login como: `uriel.fraire@teradyne-robotics.com` (GERENTE_VENTAS)
3. Ve a **📋 Solicitudes Demo**
4. Busca la solicitud PENDIENTE del vendedor
5. Click **Aprobar**
6. **Resultado esperado**:
   - ✅ Estado cambia a APROBADA
   - 📧 Email enviado a SERVICIO
   - 🔔 Notificación para equipo de SERVICIO

#### **Paso 3: Recolectar Robot (SERVICIO)**
1. Logout
2. Login como: `jose-giovanny.paz@teradyne-robotics.com` (SERVICIO)
3. Ve a **📋 Solicitudes Demo**
4. Busca la solicitud APROBADA
5. Click **✅ Marcar como recolectado**
6. **Resultado esperado**:
   - ✅ Estado cambia a RECOLECTADO
   - 🔔 Notificaciones enviadas a vendedor, Giovanny y servicio

#### **Paso 4: Devolver Robot (SERVICIO)**
1. En la misma solicitud RECOLECTADO
2. Aparece botón **✔️ Verificado - Devolver a Disponible**
3. Click en el botón
4. **Resultado esperado**:
   - ✅ Estado cambia a COMPLETADO
   - 🤖 Robot vuelve a DISPONIBLE
   - 🔔 Notificación al vendedor: "Demo completada - Robot devuelto"
   - 📧 Email enviado al vendedor

---

## 4. Checklist de Validación

### Configuración
- [ ] SMTP configurado correctamente
- [ ] Email de prueba se envía exitosamente
- [ ] Email de prueba aparece en bandeja (o spam)

### Notificaciones Locales
- [ ] Badge de notificaciones se actualiza
- [ ] Notificaciones de test aparecen en el panel
- [ ] Iconos de notificación se muestran correctamente

### Flujo de Solicitudes
- [ ] Solicitud se crea exitosamente
- [ ] Gerente recibe email de aprobación pendiente
- [ ] Gerente puede aprobar/rechazar
- [ ] Servicio recibe notificaciones después de aprobar
- [ ] Servicio puede marcar como recolectado
- [ ] **NUEVO**: Servicio puede devolver robot a disponible
- [ ] Vendedor recibe notificación cuando robot es devuelto
- [ ] Robot vuelve a estado DISPONIBLE en inventario

### Problemas Comunes

**❌ Email no se envía**
- [ ] ¿Completaste TODOS los campos de SMTP?
- [ ] ¿Usas Gmail App Password (no contraseña normal)?
- [ ] ¿El backend está corriendo?
- [ ] ¿El email no está en la carpeta SPAM?

**❌ Notificaciones no aparecen**
- [ ] ¿El usuario está logged in?
- [ ] ¿Revisaste el icono 🔔 en la esquina superior?
- [ ] ¿Está habilitado JavaScript en el navegador?

**❌ Servicio no puede devolver robot**
- [ ] ¿La solicitud está en estado RECOLECTADO?
- [ ] ¿Estás logged in como usuario SERVICIO?
- [ ] ¿El botón verde aparece debajo de la solicitud?

---

## 5. Estados de la Solicitud

```
PENDIENTE 
  ↓ (GERENTE aprueba)
APROBADA 
  ↓ (SERVICIO recolecta)
RECOLECTADO 
  ↓ (SERVICIO devuelve después de verificar)
COMPLETADO ✅
```

### Estado del Robot
- **DISPONIBLE** → Se puede solicitar
- **EN_PRESTAMO** → En uso (durante RECOLECTADO)
- **DISPONIBLE** → Vuelve después de COMPLETADO

---

## 6. Usuarios de Prueba

| Email | Rol | Contraseña |
|-------|-----|-----------|
| admin@teradyne-robotics.com | ADMIN | latamrules123 |
| uriel.fraire@teradyne-robotics.com | GERENTE_VENTAS | latamrules123 |
| emmanuel.ponce@teradyne-robotics.com | VENDEDOR | latamrules123 |
| jose-giovanny.paz@teradyne-robotics.com | SERVICIO | latamrules123 |
| vinicius.bueno-santos@teradyne-robotics.com | SERVICIO | latamrules123 |

---

## 7. Verificación Final

Cuando todo esté funcionando:

✅ **Emails Automáticos**
- Solicitudes crean emails automáticos
- Aprobaciones envían emails
- Devoluciones envían emails

✅ **Notificaciones**
- Badge se actualiza cuando hay nuevas notificaciones
- Notificaciones muestran información relevante
- Se marcan como leídas al abrir

✅ **Flujo de Robot**
- Robot va de DISPONIBLE → EN_PRESTAMO → DISPONIBLE
- Estados se reflejan en tiempo real
- Servicio puede completar el ciclo de préstamo

---

**Última actualización**: 29 de abril de 2026  
**Status**: ✅ Sistema completamente funcional
