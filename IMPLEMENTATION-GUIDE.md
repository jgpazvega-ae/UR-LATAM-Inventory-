# 🚀 GUÍA COMPLETA DE IMPLEMENTACIÓN - Sistema Multi-Región

## 📋 Tabla de Contenidos
1. [Instalación](#instalación)
2. [Configuración](#configuración)
3. [Estructura](#estructura)
4. [Deployment](#deployment)
5. [Testing](#testing)
6. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Instalación

### Requisitos
- Node.js v18+
- PostgreSQL 12+
- npm o yarn

### 1. Clonar repositorio
```bash
git clone https://github.com/jgpazvega-ae/UR-LATAM-Inventory-.git
cd UR-LATAM-Inventory-
```

### 2. Backend
```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Variables obligatorias:
# DATABASE_URL=postgresql://user:password@localhost:5432/ur_latam_inventory
# EMAIL_USER=tu-email@gmail.com
# EMAIL_PASS=tu-app-password
# JWT_SECRET=tu-secret-key-seguro
```

### 3. Base de datos
```bash
# Usar script automático (recomendado)
bash backend/setup-database.sh

# O pasos manuales:
createdb ur_latam_inventory
npx prisma generate
npx prisma migrate dev --name initial
npx prisma db seed
```

### 4. Iniciar servidor
```bash
npm run dev
# Backend en http://localhost:5000
```

---

## ⚙️ Configuración

### Configurar SMTP para Emails
1. Ir a https://myaccount.google.com/apppasswords
2. Generar App Password para Mail
3. Copiar contraseña en `.env`:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASS=tu-app-password-16-caracteres
   ```

### Agregar Nueva Región
1. Actualizar `backend/src/config/regions.config.ts`:
   ```typescript
   AR: {
     codigo: 'AR',
     nombre: 'Argentina',
     idiomaPrincipal: 'ES',
     codigoIso: 'es-AR',
     zonaHoraria: 'America/Argentina/Buenos_Aires',
     formatoFecha: 'DD/MM/YYYY',
     formatoMoneda: 'ARS',
   }
   ```

2. Actualizar `prisma/seed.ts` con nueva región

3. Correr:
   ```bash
   npx prisma db seed
   ```

### Agregar Nuevo Idioma
1. Crear archivo `backend/src/i18n/xx.json` (xx = código idioma)
2. Copiar estructura de `es.json` y traducir
3. Actualizar `regions.config.ts` con nuevo idioma

---

## 📁 Estructura del Proyecto

```
UR-LATAM-Inventory-/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts
│   │   │   └── regions.config.ts ⭐
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts (actualizado)
│   │   │   ├── prestamo.controller.ts
│   │   │   └── robot.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── region.ts ⭐
│   │   ├── services/
│   │   │   ├── email.service.ts
│   │   │   ├── translation.service.ts ⭐
│   │   │   ├── region.service.ts ⭐
│   │   │   └── historial.service.ts ⭐
│   │   ├── routes/
│   │   │   └── region.routes.ts ⭐
│   │   ├── i18n/
│   │   │   ├── es.json ⭐
│   │   │   ├── pt.json ⭐
│   │   │   ├── en.json ⭐
│   │   │   └── index.ts ⭐
│   │   └── index.ts (actualizado)
│   ├── prisma/
│   │   ├── schema.prisma (actualizado)
│   │   └── seed.ts (actualizado)
│   ├── .env
│   └── package.json
├── frontend/
│   ├── index.html (actualizado)
│   └── js/
│       ├── main.js
│       └── i18n.js ⭐
└── docs/
    ├── IMPLEMENTATION-GUIDE.md
    ├── PHASE-1-STATUS.md
    ├── API-ENDPOINTS.md
    └── TROUBLESHOOTING.md
```

⭐ = Nuevos archivos

---

## 🌐 Endpoints API

### Regiones (Públicos)
```
GET /api/regiones/publicas
GET /api/regiones/idiomas/publicos
```

### Regiones (Autenticados)
```
GET /api/regiones
GET /api/regiones/:codigo
GET /api/regiones/config/:codigo/:idioma
POST /api/regiones/cambiar-idioma { idioma: "ES" }
GET /api/regiones/traducciones/:idioma
GET /api/regiones/zona-horaria/:codigo
```

### Auth
```
POST /api/auth/login { email, password }
POST /api/auth/register { username, email, password, nombreCompleto, regionCode, idioma }
GET /api/auth/me
```

### Robots
```
GET /api/robots (filtrado por región del usuario)
GET /api/robots/:id
POST /api/robots
PUT /api/robots/:id
GET /api/robots/:id/historial
GET /api/robots/:id/reportes
```

---

## 🚀 Deployment en Railway

### 1. Crear Procfile
```
web: npm run db:migrate && npm start
```

### 2. Variables de entorno en Railway
```
DATABASE_URL=[generado por Railway]
NODE_ENV=production
JWT_SECRET=[secret-key-seguro]
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=correo@gmail.com
EMAIL_PASS=app-password
FRONTEND_URL=https://tu-dominio.com
```

### 3. Deploy
```bash
# Conectar repo
git remote add railway https://railway.app/github/username/repo

# Hacer push
git push railway main
```

---

## 🧪 Testing

### Test de Región
```bash
# Crear usuario en MX
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@mx.com", "password":"pass"}'

# Verificar que solo ve datos de MX
curl -X GET http://localhost:5000/api/robots \
  -H "Authorization: Bearer TOKEN"
```

### Test de Idioma
```bash
# Obtener traducciones en portugués
curl -X GET http://localhost:5000/api/regiones/traducciones/PT \
  -H "Authorization: Bearer TOKEN"
```

### Test de Historial de Robots
```bash
# Obtener historial de robot
curl -X GET http://localhost:5000/api/robots/ROBOT_ID/historial \
  -H "Authorization: Bearer TOKEN"

# Reportar daño
curl -X POST http://localhost:5000/api/robots/ROBOT_ID/reportar-dano \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"descripcion":"Rotor dañado", "requisitos":"Cambio de motor"}'
```

---

## ❓ Solución de Problemas

### Error: "Can't reach database server"
```bash
# Iniciar PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql   # Mac

# Verificar conexión
psql -U postgres -d ur_latam_inventory
```

### Error: "Email no se envía"
1. Verificar Gmail App Password (no contraseña normal)
2. Verificar puerto 587 no bloqueado
3. Habilitar 2FA en Google
4. Revisar logs: `tail -f backend.log`

### Error: "Region not found"
```bash
# Verificar regiones en BD
npx prisma studio

# Ejecutar seed de nuevo
npx prisma db seed
```

### JWT Token inválido
```bash
# Generar nuevo secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Actualizar en .env
JWT_SECRET=nuevo-secret
```

---

## 📊 Estadísticas

- **Regiones soportadas**: 3 (expandible)
- **Idiomas soportados**: 3 (expandible)
- **Usuarios de prueba**: 9 (2 admin, 1 gerente, 5 vendedores, 2 servicio)
- **Robots iniciales**: 50+ robots Teradyne reales
- **Estados de robot**: 5 (DISPONIBLE, EN_PRESTAMO, MANTENIMIENTO, DANADO, RETIRADO)
- **Tipos de eventos**: 9

---

## 📝 Checklist Final

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos creada y migrada
- [ ] Backend inicia sin errores (`npm run dev`)
- [ ] Frontend accesible (http://localhost:3000)
- [ ] Login funciona con usuario test
- [ ] Selector de región/idioma visible
- [ ] Emails se envían correctamente
- [ ] Historial de robots se registra
- [ ] Tests pasan
- [ ] Deployed a production

---

## 🔗 Recursos

- [Documentación Prisma](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Railway Docs](https://docs.railway.app/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

---

**Última actualización**: 29 de abril de 2026  
**Versión**: 2.0 (Multi-región, Multi-idioma, Historial)  
**Status**: ✅ Producción-lista
