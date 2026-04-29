# Guía de Testing - UR LATAM Inventory

## 1. Validación de Cambios en la Interfaz (index.html)

### A. Prueba de Selección de Fechas (FIX CRÍTICO)
1. Login a la aplicación con cualquier usuario vendedor
2. Haz click en "📋 Solicitudes Demo"
3. Haz click en "+ Nueva Solicitud"
4. **VERIFICA:**
   - Campo "Fecha de Inicio" (selector calendario) ✓
   - Campo "Fecha de Fin" (selector calendario) ✓
   - **NO** debe aparecer "Duración (días)"
   - Fecha de fin predeterminada debe ser 7 días después del inicio

### B. Validaciones de Fechas
1. Intenta seleccionar fecha fin anterior a fecha inicio
   - **ESPERADO:** Error: "La fecha de fin debe ser posterior a la fecha de inicio"

2. Intenta seleccionar rango mayor a 2 meses (>60 días)
   - **ESPERADO:** Error: "La duración máxima permitida es de 2 meses (60 días)"

3. Intenta crear dos solicitudes con fechas superpuestas para el mismo robot
   - **ESPERADO:** Error: "Este robot ya tiene una reserva en las fechas seleccionadas"

### C. Dashboard de Préstamos (solo ADMIN/GERENTE_VENTAS)
1. Login como ADMIN o como Uriel (GERENTE_VENTAS)
2. Ve al Dashboard
3. **VERIFICA:**
   - Sección "Robots en Préstamo" debe ser visible
   - Muestra contador de "Préstamos Activos"
   - Muestra contador de "Préstamos Vencidos"
   - Tabla con columnas: Robot, Solicitado por, Inicio, Fin, Estado

### D. Notificaciones In-App
1. Login como usuario de SERVICIO
2. **VERIFICA:**
   - Bell icon (🔔) en el header superior derecho
   - Badge rojo con número de notificaciones no leídas
3. Hacer que un ADMIN apruebe una solicitud
   - **ESPERADO:** El usuario de SERVICIO recibe notificación "📦 Robot listo para recoger"

### E. Botón "Marcar como Recolectado"
1. Login como ADMIN, aprueba una solicitud
2. Login como usuario de SERVICIO
3. Ve a "Solicitudes Demo"
4. **VERIFICA:**
   - Solicitud APROBADA debe mostrar botón "✅ Marcar como recolectado"
   - Al hacer click, el botón desaparece y estado cambia a RECOLECTADO

---

## 2. Testing de Email (Backend)

### Configuración Requerida
1. Crea un archivo `.env` en `/backend`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/ur_latam_inventory"
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email-gmail@gmail.com
EMAIL_PASS=tu-app-password-gmail
EMAIL_FROM=noreply@teradyne-robotics.com
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

**Nota para Gmail:**
- Habilita "Acceso a aplicaciones menos seguras" O
- Usa "Contraseñas de aplicación" (recomendado)

### Testing del Endpoint
1. **Health Check:**
```bash
curl -X GET http://localhost:5000/api/test/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-29T...",
  "emailConfig": {
    "host": "smtp.gmail.com",
    "user": "***",
    "configured": true
  }
}
```

2. **Enviar Email de Prueba (requiere ser ADMIN):**
```bash
curl -X POST http://localhost:5000/api/test/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu-jwt-token>" \
  -d '{"emailTo":"correo@ejemplo.com"}'
```

**Respuesta esperada:**
```json
{
  "mensaje": "Email de prueba enviado exitosamente",
  "emailTo": "correo@ejemplo.com",
  "timestamp": "2026-04-29T..."
}
```

---

## 3. Testing de Reset de Contraseña

### Endpoint de Reset (Backend)
```bash
curl -X POST http://localhost:5000/api/usuarios/:usuarioId/resetear-password \
  -H "Authorization: Bearer <admin-token>"
```

**Respuesta:**
```json
{
  "mensaje": "Contraseña reseteada para Nombre Usuario",
  "tempPassword": "abc123def456",
  "instrucciones": "Comparte esta contraseña temporal con el usuario..."
}
```

**Verificación:**
- La contraseña temporal se genera aleatoriamente (diferente cada vez)
- Se retorna una sola vez
- El usuario debe cambiarla al siguiente login (forcePasswordReset = true)

---

## 4. Validación de Email Format

1. Intenta crear un usuario con email inválido
   - **ESPERADO:** Error: "Ingresa un email válido"
2. Emails aceptados: 
   - ✓ usuario@ejemplo.com
   - ✓ usuario.nombre@empresa.co
   - ✗ usuario@
   - ✗ @ejemplo.com
   - ✗ usuario(sin-arroba).com

---

## 5. Checklist de Deployment

- [ ] Los cambios están en rama `InventoryURLATAMDEMOS`
- [ ] GitHub Actions workflow de deploy ha ejecutado exitosamente
- [ ] GitHub Pages muestra los cambios (espera 1-2 minutos)
- [ ] Puedes ver la nueva interfaz en `https://jgpazvega-ae.github.io/UR-LATAM-Inventory-/`

---

## 6. Solución de Problemas

### Los cambios no aparecen en la página
1. Limpia caché del navegador (Ctrl+Shift+Delete)
2. Abre en incógnito/privado
3. Verifica que el push llegó a `InventoryURLATAMDEMOS`
4. Revisa workflow status en GitHub Actions

### El email no envía
1. Verifica configuración en `.env`
2. Revisa logs: `npm run dev` muestra errores de email
3. Si usas Gmail:
   - Habilita "Acceso a aplicaciones menos seguras" en configuración de cuenta
   - O genera "Contraseña de aplicación" (recomendado)

### Las notificaciones no llegan
- Verifica que el usuario tenga rol SERVICIO
- Recarga la página si la notificación no aparece inmediatamente
- Abre el Developer Tools (F12) → Console para ver errores

---

## 7. Cambios Técnicos Realizados

### Frontend (Static HTML)
- ✓ Reemplazo de "duración en días" con "fecha fin"
- ✓ Validación de rango (máximo 60 días)
- ✓ Prevención de solapamiento de reservas
- ✓ Dashboard de préstamos para admin/gerente
- ✓ Sistema de notificaciones in-app con bell icon
- ✓ Botón "Marcar como recolectado" para servicio

### Backend (Node.js + Prisma)
- ✓ Campo `forcePasswordReset` en modelo Usuario
- ✓ Endpoint `/api/usuarios/:usuarioId/resetear-password` con password temporal
- ✓ Configuración de email (nodemailer)
- ✓ Endpoints de testing: `/api/test/email` y `/api/test/health`
- ✓ Validación de email format en usuario creation
- ✓ Archivo `.env.example` con variables requeridas

---

**Última actualización:** 29 de abril de 2026
**Estado:** ✅ Listo para testing
