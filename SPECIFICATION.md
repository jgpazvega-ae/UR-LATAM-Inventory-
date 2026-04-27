# Sistema de Control de Inventarios - Teradyne Robotics
## Especificación Técnica Completa

---

## 1. VISIÓN GENERAL DEL PROYECTO

**Objetivo:** Crear una plataforma web de gestión de préstamos (demos) de robots industriales con control de inventario en tiempo real, autenticación de usuarios, flujo de aprobación y automatización de notificaciones.

**Usuarios principales:**
- Vendedores (solicitan préstamos)
- Gerente de Ventas (aprueba solicitudes)
- Administrador/TI (gestiona inventario, usuarios, configuración)
- Personal de Servicio (confirma salida/recepción de robots)

---

## 2. ARQUITECTURA DE BASE DE DATOS

### 2.1 Base de Datos 1: USUARIOS Y AUTENTICACIÓN

```sql
TABLE: usuarios
├── id (PRIMARY KEY, UUID)
├── username (VARCHAR, UNIQUE, NOT NULL)
├── email (VARCHAR, UNIQUE, NOT NULL)
├── password_hash (VARCHAR, NOT NULL)
├── nombre_completo (VARCHAR)
├── rol (ENUM: 'vendedor', 'gerente_ventas', 'servicio', 'admin')
├── activo (BOOLEAN, DEFAULT: FALSE)
├── distribuidor (VARCHAR, FK a tabla distribuidores)
├── fecha_creacion (TIMESTAMP)
├── fecha_ultima_login (TIMESTAMP)
└── fecha_modificacion (TIMESTAMP)

TABLE: distribuidores
├── id (PRIMARY KEY, UUID)
├── nombre (VARCHAR, NOT NULL)
├── contacto_principal (VARCHAR)
├── correo (VARCHAR)
└── telefono (VARCHAR)
```

### 2.2 Base de Datos 2: INVENTARIO DE ROBOTS

```sql
TABLE: familias_robots
├── id (PRIMARY KEY, UUID)
├── nombre_familia (VARCHAR, UNIQUE)
└── descripcion (TEXT)

TABLE: robots
├── id (PRIMARY KEY, UUID)
├── numero_serie (VARCHAR, UNIQUE, NOT NULL)
├── familia_id (FK -> familias_robots)
├── modelo (VARCHAR)
├── estado (ENUM: 'disponible', 'en_prestamo', 'mantenimiento', 'retirado')
├── ubicacion_actual (VARCHAR)
├── fecha_adquisicion (DATE)
├── notas (TEXT)
└── fecha_ultima_actualizacion (TIMESTAMP)

TABLE: prestamos
├── id (PRIMARY KEY, UUID)
├── numero_solicitud (VARCHAR, AUTO-GENERATED)
├── usuario_solicitante_id (FK -> usuarios)
├── robot_id (FK -> robots)
├── distribuidor_id (FK -> distribuidores)
├── fecha_inicio_solicitada (DATE)
├── fecha_fin_solicitada (DATE)
├── motivo (TEXT)
├── estado (ENUM: 'pendiente_aprobacion', 'aprobado', 'rechazado', 'activo', 'completado', 'vencido')
├── estado_salida (ENUM: null, 'confirmado', 'rechazado')
├── estado_recepcion (ENUM: null, 'confirmado', 'rechazado')
├── fecha_salida_real (TIMESTAMP)
├── fecha_recepcion_real (TIMESTAMP)
├── usuario_servicio_salida_id (FK -> usuarios)
├── usuario_servicio_recepcion_id (FK -> usuarios)
├── fecha_creacion (TIMESTAMP)
├── fecha_aprobacion (TIMESTAMP)
├── usuario_aprobador_id (FK -> usuarios)
└── fecha_modificacion (TIMESTAMP)

TABLE: detalles_prestamo_robots
├── id (PRIMARY KEY, UUID)
├── prestamo_id (FK -> prestamos)
├── robot_id (FK -> robots)
├── orden (INT)
└── fecha_agregado (TIMESTAMP)

TABLE: configuracion
├── id (PRIMARY KEY, UUID)
├── dias_minimos_anticipacion (INT, DEFAULT: 7)
├── dias_vencimiento_alerta (INT, DEFAULT: 7)
├── correo_admin_principal (VARCHAR)
├── correo_admin_copia_1 (VARCHAR)
├── correo_admin_copia_2 (VARCHAR)
├── horarios_notificacion (JSON)
└── estado_sistema (ENUM: 'activo', 'mantenimiento')
```

---

## 3. FLUJO DEL USUARIO (USER JOURNEY)

### 3.1 FASE 1: AUTENTICACIÓN Y REGISTRO

**Pantalla de Inicio - Login:**
- Usuario ingresa username/email y contraseña
- Sistema valida credenciales
- Se redirige al dashboard si es exitoso

**Flujo de Registro:**
- Usuario ingresa: username, email, password, nombre completo
- Sistema verifica email/usuario únicos
- Cuenta se crea con `activo = FALSE`
- Admin debe activar manualmente

### 3.2 FASE 2: SOLICITUD DE PRÉSTAMO (DEMO) - Wizard Multi-paso

**Paso 1:** Seleccionar familia de robot (CB3, Serie E, UR Series, MIR)
**Paso 2:** Seleccionar robot(s) disponibles de esa familia
**Paso 3:** Fechas de préstamo (mín. 7 días de anticipación)
**Paso 4:** Distribuidor (pre-asignado, modificable)
**Paso 5:** Motivo del préstamo (textarea, max 500 caracteres)
**Paso 6:** Revisión y confirmación

### 3.3 FASE 3: FLUJO DE APROBACIÓN

**Panel Administrativo:**
- Lista de solicitudes pendientes (filtrable)
- Detalles completos de cada solicitud
- Acciones: Aprobar / Rechazar / Posponer

### 3.4 FASE 4: GESTIÓN DE SALIDA/RECEPCIÓN

**Portal de Servicio Técnico:**
- Salidas programadas (confirmar salida)
- Recepciones vencidas (confirmar retorno)
- Alertas de demoras

---

## 4. SISTEMA DE NOTIFICACIONES

### Tipos de notificaciones:
1. Solicitud creada (inmediato)
2. Solicitud aprobada (cuando admin aprueba)
3. Solicitud rechazada (cuando admin rechaza)
4. Salida confirmada (cuando servicio confirma)
5. Alerta de vencimiento (7 días antes)
6. Recordatorios diarios (L-V a las 08:00, 12:00, 16:00)
7. Demanda vencida (primer día después del vencimiento)
8. Alerta crítica (7 días sin retorno)
9. Recepción confirmada (cuando retorna)

---

## 5. PANEL ADMINISTRATIVO

- **Dashboard:** Estado general, robots por estado, vencimientos próximos
- **Gestión de Usuarios:** CRUD, activación, asignación de distribuidor
- **Gestión de Inventario:** CRUD robots, búsqueda, historial
- **Gestión de Solicitudes:** Ver, aprobar, rechazar, reportes PDF/Excel
- **Configuración:** Días anticipación, correos, horarios, estado sistema
- **Reportes:** Robots más solicitados, distribuidores activos, tasas cumplimiento

---

## 6. STACK TECNOLÓGICO

**Frontend:**
- React.js + TypeScript
- Tailwind CSS
- React Router v6
- Axios
- React Hook Form
- Zod (validación)

**Backend:**
- Node.js + Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT (autenticación)
- bcryptjs (encriptación)
- Nodemailer (emails)
- node-cron (tareas automáticas)

**Infraestructura:**
- GitHub (versionamiento)
- Docker (contenedorización)
- PostgreSQL (base datos)

---

## 7. ESTRUCTURA DE CARPETAS

```
ur-latam-inventory/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── prisma/
│   │   └── config/
│   ├── .env.example
│   └── package.json
│
├── database/
│   └── schema.sql
│
└── docs/
    ├── API.md
    └── SETUP.md
```

---

## 8. FASES DE DESARROLLO

**Fase 1: MVP (4-5 semanas)**
- ✅ Autenticación básica
- ✅ CRUD de usuarios (admin activa)
- ✅ CRUD de robots
- ✅ Flujo básico de solicitud
- ✅ Confirmación de salida/recepción

**Fase 2: Flujo Completo (2-3 semanas)**
- ✅ Flujo de aprobación por admin
- ✅ Sistema de notificaciones
- ✅ Cálculo de fechas mínimas
- ✅ Alertas de vencimiento

**Fase 3: Automatización (2-3 semanas)**
- ✅ Cron jobs para notificaciones
- ✅ Alertas de vencimiento automáticas
- ✅ Cambio automático de estado
- ✅ Reportes

**Fase 4: Pulido y Deploy (1-2 semanas)**
- ✅ Testing
- ✅ Documentación
- ✅ Deploy a producción
- ✅ Capacitación

---

## 9. CONSIDERACIONES DE SEGURIDAD

✅ Hash de contraseñas (bcrypt, min 12 rondas)
✅ JWT con expiración
✅ HTTPS obligatorio
✅ CORS configurado
✅ Rate limiting
✅ Validación de entrada (server-side)
✅ Sanitización de datos
✅ Logs de auditoría
✅ Backup automático
✅ Encriptación de datos sensibles

---

## 10. MÉTRICAS DE ÉXITO

- Tiempo de respuesta: < 2 segundos
- Disponibilidad: 99.5%
- Tasa de entrega de emails: > 99%
- Adopción de usuarios: 100% del equipo en 2 semanas
- Reducción de gestión manual: > 80%
