# 🤖 Teradyne Robotics - Sistema de Control de Inventarios

**Plataforma web profesional para gestión de préstamos (demos) de robots industriales.** Control de inventario en tiempo real, autenticación de usuarios, flujo de aprobación automático y notificaciones por email.

![Estado](https://img.shields.io/badge/status-desarrollo-blue)
![Versión](https://img.shields.io/badge/version-0.1.0-brightgreen)
![Node](https://img.shields.io/badge/node-18%2B-green)
![React](https://img.shields.io/badge/react-18-61DAFB)

---

## 📋 Características

✅ **Autenticación JWT** con control de roles (Admin, Gerente, Vendedor, Servicio)
✅ **Gestión de Solicitudes** con wizard de 6 pasos
✅ **Flujo de Aprobación** automático con notificaciones
✅ **Sistema de Notificaciones** con emails HTML personalizados
✅ **Cron Jobs** para alertas de vencimiento automáticas
✅ **CRUD de Robots** con control de inventario en tiempo real
✅ **Dashboard** con estadísticas en vivo
✅ **Panel Administrativo** completo
✅ **Responsive Design** con Tailwind CSS
✅ **Multi-Región** - Soporte para México, Brasil y USA con aislamiento de datos
✅ **Multi-Idioma** - Español, Portugués e Inglés con cambio dinámico
✅ **Historial de Robots** - Auditoría completa de préstamos, devoluciones, daños y reparaciones
✅ **Reportes Detallados** - Historial y estadísticas por robot

---

## 🚀 Quick Start

### Requisitos
- **Node.js** 18+
- **PostgreSQL** 14+
- **npm** o **yarn**

### Instalación (2 minutos)

```bash
# 1. Clonar
git clone https://github.com/jgpazvega-ae/UR-LATAM-Inventory-.git
cd UR-LATAM-Inventory-

# 2. Backend
cd backend
npm install
cp .env.example .env
# Edita .env con tu DATABASE_URL
npm run db:migrate
npm run db:seed
npm run dev

# 3. Frontend (otra terminal)
cd frontend
npm install
npm run dev

# 4. Acceder
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

👤 **Usuarios iniciales después de `npm run db:seed`:**
- **Admin:** admin@teradyne-robotics.com / password123
- **Gerente:** uriel.fraire@teradyne-robotics.com / password123
- **Vendedores:** (5 usuarios) / password123
- **Técnico:** (2 usuarios) / password123

🌍 **Seleccionar Región e Idioma:**
- En la pantalla de login, selecciona tu región (México, Brasil, USA) y tu idioma preferido (Español, Portugués, English)
- Una vez dentro, puedes cambiar región e idioma desde el selector en la esquina superior derecha del header

🔗 **Demostración en Vivo:**
- Accede a la demostración: https://jgpazvega-ae.github.io/UR-LATAM-Inventory-/

Ver [SETUP.md](./docs/SETUP.md) para instalación completa y configuración.

---

## 📚 Documentación

| Documento | Descripción |
|-----------|------------|
| [SPECIFICATION.md](./SPECIFICATION.md) | Especificación técnica completa (BD, flujos, requerimientos) |
| [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md) | Guía completa de implementación multi-región y multi-idioma |
| [TESTING.md](./TESTING.md) | Guía de testing con casos de prueba detallados |
| [PROJECT-STATUS.md](./PROJECT-STATUS.md) | Estado del proyecto y lista de verificación |
| [docs/SETUP.md](./docs/SETUP.md) | Guía de instalación y configuración detallada |
| [docs/API.md](./docs/API.md) | Documentación de endpoints (en desarrollo) |

---

## 🏗️ Arquitectura

### Stack Tecnológico

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS
- React Router v6
- Axios
- Vite

**Backend:**
- Node.js + Express.js
- TypeScript
- PostgreSQL 14+
- Prisma ORM
- JWT (autenticación)
- Nodemailer (emails)
- node-cron (tareas automáticas)

### Estructura de Carpetas

```
├── backend/
│   ├── src/
│   │   ├── controllers/        # Lógica de negocio
│   │   ├── routes/             # Endpoints API
│   │   ├── middleware/         # Auth, validación
│   │   ├── services/           # Email, notificaciones
│   │   ├── config/             # Conexión Prisma
│   │   └── index.ts            # Servidor principal
│   ├── prisma/
│   │   ├── schema.prisma       # Schema de BD
│   │   └── seed.ts             # Datos iniciales
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── pages/              # Páginas/vistas
│   │   ├── services/           # Clientes API
│   │   ├── contexts/           # Context API (Auth)
│   │   └── App.tsx             # Punto de entrada
│   └── package.json
│
└── docs/
    ├── SPECIFICATION.md
    ├── SETUP.md
    └── API.md
```

---

## 🌍 Características Multi-Región & Multi-Idioma

### Regiones Soportadas
- **México (MX)** - Zona horaria: America/Mexico_City
- **Brasil (BR)** - Zona horaria: America/Sao_Paulo
- **USA** - Zona horaria: America/New_York

### Idiomas Soportados
- **Español (ES)** - Idioma predeterminado para México
- **Portugués (PT)** - Idioma predeterminado para Brasil
- **Inglés (EN)** - Idioma predeterminado para USA

### Aislamiento de Datos por Región
- ✅ Robots filtrados por región del usuario
- ✅ Usuarios solo pueden ver su región
- ✅ Solicitudes aisladas por región
- ✅ Historial regional independiente

### Cambio de Región e Idioma
1. **En Login:** Selecciona región e idioma antes de ingresar
2. **En Aplicación:** Usa los selectores en la barra superior derecha
3. **Persistencia:** Las selecciones se guardan automáticamente

---

## 📜 Sistema de Historial y Auditoría

### Eventos Registrados
- ✅ Préstamo iniciado (robot en transporte)
- ✅ Préstamo devuelto (robot recibido)
- ✅ Robot dañado (con descripción del daño)
- ✅ Robot reparado (vuelto a servicio)
- ✅ Cambios de ubicación
- ✅ Cambios de estado

### Acceso al Historial
- Ver historial completo: `/api/robots/:id/historial`
- Generar reporte: `/api/robots/:id/reportes`
- Reportar daño: `POST /api/robots/:id/reportar-dano`
- Registrar reparación: `POST /api/robots/:id/reparar`

---

## 📖 Flujos Principales

### 1️⃣ Solicitud de Demo (Vendedor)
```
Vendedor → Crear Solicitud → Wizard 6 pasos → Email al Gerente
```

### 2️⃣ Aprobación (Gerente)
```
Gerente → Revisar Solicitud → Aprobar/Rechazar → Email a Vendedor
```

### 3️⃣ Salida de Robot (Servicio)
```
Servicio → Confirmar Salida → Estado: EN_PRESTAMO → Email enviado
```

### 4️⃣ Retorno de Robot (Servicio)
```
Servicio → Confirmar Recepción → Estado: DISPONIBLE → Caso cerrado
```

### 5️⃣ Alertas Automáticas
```
Cron Job (3x/día) → Verifica vencimientos → Envía alertas por email
```

---

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT con expiración (7 días)
- ✅ Autenticación por roles
- ✅ CORS configurado
- ✅ Validación de entrada server-side
- ✅ HTTPS en producción (recomendado)

---

## 📧 Notificaciones

9 tipos de emails automáticos:
1. Solicitud creada
2. Solicitud aprobada
3. Solicitud rechazada
4. Salida confirmada
5. Recordatorio (7 días antes)
6. Alerta vencimiento próximo
7. Alerta vencido
8. Alerta crítica (>7 días)
9. Recepción confirmada

Plantillas HTML personalizadas con branding Teradyne.

---

## 🤝 Contactos del Sistema

| Nombre | Email | Rol |
|--------|-------|-----|
| Administrador | admin@teradyne-robotics.com | ADMIN |
| Uriel Fraire | uriel.fraire@teradyne-robotics.com | GERENTE_VENTAS |
| Ximena Lama | ximena.lama@teradyne-robotics.com | VENDEDOR |
| Emmanuel Ponce | emmanuel.ponce@teradyne-robotics.com | VENDEDOR |
| Miguel Lopez | miguel.lopez@teradyne-robotics.com | VENDEDOR |
| Jesus Coronado | jesus.coronado@teradyne-robotics.com | VENDEDOR |
| Maria Salcido | maria.salcido@teradyne-robotics.com | VENDEDOR |
| Giovanny Paz | jose-giovanny.paz@teradyne-robotics.com | SERVICIO |
| Vinicius Bueno | vinicius.bueno-santos@teradyne-robotics.com | SERVICIO |

---

## 🚢 Deploy

### Frontend
```bash
cd frontend
npm run build
# Subir contenido de 'dist/' a Vercel, Netlify o AWS S3
```

### Backend
```bash
cd backend
npm run build
# Deployar en Heroku, Railway, AWS EC2 o DigitalOcean
```

Ver [SETUP.md](./docs/SETUP.md#deploy-a-producción) para detalles completos.

---

## 📞 Soporte

- 📖 Lee [SETUP.md](./docs/SETUP.md) primero
- 🐛 Revisa logs: `npm run dev` muestra errores
- 🔍 Inspecciona BD: `npm run db:studio`
- 📋 Consulta [SPECIFICATION.md](./SPECIFICATION.md)

---

## 📄 Licencia

Copyright © 2024 Teradyne Robotics. Todos los derechos reservados.

---

**Hecho con ❤️ para Teradyne Robotics**
