# Setup Guide - Teradyne Robotics Inventory System

## Requisitos Previos

- **Node.js** 18+
- **PostgreSQL** 14+
- **npm** o **yarn**
- **Git**

## Instalación Paso a Paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/jgpazvega-ae/UR-LATAM-Inventory-.git
cd UR-LATAM-Inventory-
```

### 2. Configurar PostgreSQL

```sql
-- Crear base de datos
CREATE DATABASE ur_latam_inventory;

-- Crear usuario (opcional, si usas auth)
CREATE USER inventory_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE ur_latam_inventory TO inventory_user;
```

### 3. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus valores:
# DATABASE_URL="postgresql://user:password@localhost:5432/ur_latam_inventory"
# JWT_SECRET="tu-clave-secreta-super-segura"
# EMAIL_HOST=smtp.gmail.com (o tu servidor SMTP)
# EMAIL_USER=tu-email@gmail.com
# EMAIL_PASS=tu-contraseña-app
# ADMIN_EMAIL=uriel.fraire@teradyne-robotics.com
nano .env

# Generar cliente Prisma
npm run db:generate

# Crear schema y correr migraciones
npm run db:migrate

# Cargar datos iniciales (usuarios, familias, distribuidores)
npm run db:seed

# Iniciar servidor de desarrollo
npm run dev
```

El backend estará disponible en: **http://localhost:5000**

### 4. Configurar Frontend

En otra terminal:

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: **http://localhost:3000**

## Acceso Inicial

Después de ejecutar `npm run db:seed`, tienes estos usuarios disponibles:

### Admin
- **Email:** admin@teradyne-robotics.com
- **Contraseña:** password123
- **Rol:** Administrador (acceso total)

### Gerente de Ventas
- **Email:** uriel.fraire@teradyne-robotics.com
- **Contraseña:** password123
- **Rol:** Aprueba solicitudes

### Vendedores
- **Ximena Lama** - ximena.lama@teradyne-robotics.com
- **Emmanuel Ponce** - emmanuel.ponce@teradyne-robotics.com
- **Miguel Lopez** - miguel.lopez@teradyne-robotics.com
- **Jesus Coronado** - jesus.coronado@teradyne-robotics.com
- **Maria Salcido** - maria.salcido@teradyne-robotics.com
- **Contraseña:** password123

### Equipo Técnico
- **Giovanny Paz** - jose-giovanny.paz@teradyne-robotics.com
- **Vinicius Bueno** - vinicius.bueno-santos@teradyne-robotics.com
- **Contraseña:** password123

## Configuración de Email (SMTP)

Para que las notificaciones funcionen, necesitas configurar un servidor SMTP:

### Opción 1: Gmail
```bash
# En .env del backend:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-app  # No la contraseña normal, usar App Password
```

[Cómo obtener App Password en Gmail](https://support.google.com/accounts/answer/185833)

### Opción 2: SendGrid
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_PASS=SG.tu-api-key
```

### Opción 3: Otro SMTP
Configura los valores correspondientes en `.env`

## Scripts Disponibles

### Backend
```bash
npm run dev          # Inicia servidor en modo desarrollo
npm run build        # Compila TypeScript
npm run start        # Corre versión compilada
npm run db:migrate   # Ejecuta migraciones pendientes
npm run db:generate  # Regenera cliente Prisma
npm run db:seed      # Carga datos iniciales
npm run db:studio    # Abre Prisma Studio (interfaz visual DB)
npm test             # Ejecuta tests
```

### Frontend
```bash
npm run dev      # Inicia servidor Vite
npm run build    # Compila para producción
npm run preview  # Previsualiza build de producción
npm run lint     # Verifica código
```

## Estructura del Proyecto

```
ur-latam-inventory/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Lógica de negocio
│   │   ├── routes/             # Endpoints de API
│   │   ├── middleware/         # Autenticación, validación
│   │   ├── services/           # Email, notificaciones
│   │   ├── config/             # Conexión Prisma
│   │   └── index.ts            # Punto de entrada
│   ├── prisma/
│   │   ├── schema.prisma       # Schema de base de datos
│   │   └── seed.ts             # Datos iniciales
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   ├── pages/              # Páginas/vistas
│   │   ├── services/           # Clientes API
│   │   ├── contexts/           # Context API
│   │   └── App.tsx             # Punto de entrada
│   └── package.json
│
└── docs/
    ├── API.md                  # Documentación API
    └── SETUP.md                # Este archivo
```

## Troubleshooting

### Error: "Cannot find module 'bcryptjs'"
```bash
npm install bcryptjs
```

### Error: "Connect ECONNREFUSED 127.0.0.1:5432"
- Verifica que PostgreSQL está corriendo
- Revisa que DATABASE_URL es correcta en .env

### Error: "EADDRINUSE :::5000"
- El puerto 5000 ya está en uso. Cambia PORT en .env o cierra la aplicación anterior

### Error: "CORS error"
- Verifica que FRONTEND_URL en .env coincide con donde corre el frontend

### Los emails no se envían
- Verifica credenciales SMTP en .env
- Si usas Gmail, usa App Password en lugar de contraseña normal
- Revisa logs del servidor para detalles

## Deploy a Producción

Para deploy en producción:

1. **Build frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Build backend:**
   ```bash
   cd backend
   npm run build
   ```

3. **Variables de entorno de producción:**
   - Usar URL real de base de datos
   - Cambiar JWT_SECRET a valor seguro
   - Usar servidor SMTP real (no Gmail si es posible)
   - Configurar FRONTEND_URL correctamente
   - Aumentar seguridad (HTTPS, rate limiting, etc)

4. **Sugerir plataformas:**
   - **Frontend:** Vercel, Netlify, AWS S3 + CloudFront
   - **Backend:** Heroku, Railway, AWS EC2, DigitalOcean

## Soporte

Si encuentras problemas, verifica:
1. Logs del servidor: `npm run dev` muestra errores en consola
2. Consola del navegador: Abre DevTools (F12)
3. Prisma Studio: `npm run db:studio` para inspeccionar datos
4. Documentación API: Ver `docs/API.md`
