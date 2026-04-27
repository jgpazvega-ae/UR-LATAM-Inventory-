# Teradyne Robotics - Sistema de Control de Inventarios

Plataforma web para gestión de préstamos (demos) de robots industriales con control de inventario en tiempo real, autenticación de usuarios, flujo de aprobación y automatización de notificaciones.

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd ur-latam-inventory

# Instalar dependencias backend
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar migraciones
npm run db:migrate

# Instalar dependencias frontend
cd ../frontend
npm install

# Iniciar desarrollo
npm run dev
```

## 📁 Estructura del Proyecto

```
ur-latam-inventory/
├── frontend/          # React app
├── backend/           # Express + PostgreSQL
├── database/          # Schemas y migraciones
├── SPECIFICATION.md   # Especificación técnica completa
└── README.md         # Este archivo
```

## 📚 Documentación

- [Especificación Técnica](./SPECIFICATION.md)
- [API Documentation](./docs/API.md) (en desarrollo)
- [Setup Guide](./docs/SETUP.md) (en desarrollo)

## 🛠️ Stack Tecnológico

**Frontend:** React + TypeScript + Tailwind CSS
**Backend:** Node.js + Express + PostgreSQL + Prisma
**Auth:** JWT
**Email:** Nodemailer

## 📝 Licencia

Teradyne Robotics © 2024
