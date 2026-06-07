# 🤖 Teradyne Robotics - Sistema de Control de Inventarios

**Plataforma web profesional para gestión de préstamos (demos) de robots industriales.** Control de inventario en tiempo real, autenticación de usuarios, flujo de aprobación automático y notificaciones.

![Estado](https://img.shields.io/badge/status-desarrollo%20demo-yellow)
![Versión](https://img.shields.io/badge/version-0.1.0--demo-brightgreen)
![Node](https://img.shields.io/badge/node-18%2B-green)
![React](https://img.shields.io/badge/react-18-61DAFB)

---

## ℹ️ Estado Actual - CICLO 3 (Validación y Debugging)

**Modo de Operación:** 🧪 **DEMO** - Todos los datos en localStorage (sin backend)

### ✅ Completado en CICLO 3:
- ✅ Logging detallado en `listarFamilias()` para diagnosticar conteos
- ✅ Validación de tipo-segura para matching de familiaIds (string vs number)
- ✅ Contexto de región agregado a NuevaSolicitudPage
- ✅ Logging exhaustivo en `getRobots()` y `getFamilias()`
- ✅ Validación de integridad de datos con alertas críticas
- ✅ Build exitoso sin errores ✓

### 🔍 En Investigación:
- Familia robot counts mostrando como 0 inicialmente (pero robots aparecen correctamente al seleccionar familia)

### 📋 Próximos Pasos:
1. **Probar la aplicación en GitHub Pages**
2. **Abrir consola del navegador** (F12)
3. **Ir a "Nueva Solicitud"** y observar los logs
4. **Compartir los logs de consola** para diagnosis definitiva
5. **CICLO 4:** Implementar el fix basado en los logs

---

## 🚀 Acceso a la Demo

### 🌐 En Línea (GitHub Pages)
```
URL: https://jgpazvega-ae.github.io/UR-LATAM-Inventory-/
```

**Cuentas de Prueba (Contraseña: `latamrules123`):**
- **Admin:** admin@teradyne-robotics.com
- **Gerente:** uriel.fraire@teradyne-robotics.com
- **Vendedores:** ximena.lama@teradyne-robotics.com, emmanuel.ponce@teradyne-robotics.com, etc.
- **Servicio:** jose-giovanny.paz@teradyne-robotics.com, vinicius.bueno-santos@teradyne-robotics.com

### 🏠 Localmente
```bash
cd frontend
npm install
npm run dev
# Abre http://localhost:5173
```

---

## 🔧 Debugging - Cómo Verificar los Logs

### Para el Issue de Familia Counts:

1. **Abrir aplicación** en navegador
2. **F12** → Ir a pestaña "Console"
3. **Login** con cualquier vendedor
4. **Click en "Nueva Solicitud"** en el menú
5. **Observar los logs:**

```
📥 Robots cargados desde localStorage: X robots
👨‍👩‍👧‍👦 Familias cargadas: 4
📊 Familia "CB3" (id: 1)
   - familiaId tipo: "string" valor: "1"
   - Robots encontrados: X
   - Ejemplos: ...
🤖 familiaIds únicos en robots: 1, 2, 3, 4
👨‍👩‍👧‍👦 IDs de familias: 1, 2, 3, 4
```

**Qué buscar:**
- ¿Cuántos robots se cargaron?
- ¿Cuántos robots se encuentran por familia?
- ¿Los tipos de IDs coinciden?
- ¿Hay alertas de error?

---

## 📋 Características (Modo Demo)

✅ **Autenticación** con control de roles (Admin, Gerente, Vendedor, Servicio)
✅ **Gestión de Solicitudes** con wizard de 6 pasos
✅ **Flujo de Aprobación** simulado
✅ **Sistema de Notificaciones** con toast notifications
✅ **CRUD de Robots** con 49 robots en inventario
✅ **Dashboard** (en desarrollo)
✅ **Panel Administrativo** para gestión de usuarios
✅ **Responsive Design** con Tailwind CSS
✅ **Multi-Región** - México, Brasil y USA con aislamiento de datos
✅ **Multi-Idioma** - Español, Portugués e Inglés
✅ **Persistencia en localStorage** - Todos los datos en navegador (demo)

---

## 📚 Documentación

| Documento | Descripción |
|-----------|------------|
| [SPECIFICATION.md](./SPECIFICATION.md) | Especificación técnica completa |
| [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md) | Guía de implementación multi-región y multi-idioma |
| [TESTING.md](./TESTING.md) | Guía de testing y casos de prueba |
| [PROJECT-STATUS.md](./PROJECT-STATUS.md) | Estado del proyecto |
| [docs/SETUP.md](./docs/SETUP.md) | Guía de instalación detallada |

---

## 🏗️ Arquitectura

### Stack Tecnológico (Demo)

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS
- React Router v6
- Context API (Auth, Region/Language, Notifications)
- Vite
- localStorage para persistencia

**Servicios (Demo):**
- `robot.service.ts` - Gestión de robots y familias
- `prestamo.service.ts` - Gestión de solicitudes de préstamos
- `user.service.ts` - Gestión de usuarios
- `auth.service.ts` - Autenticación
- Todos usan localStorage como backend

### Estructura de Carpetas

```
├── frontend/
│   ├── src/
│   │   ├── components/         # Componentes React reutilizables
│   │   ├── contexts/           # Context API (Auth, Region, Notifications)
│   │   ├── pages/              # Páginas principales
│   │   ├── services/           # Servicios (robot, user, auth, etc.)
│   │   ├── data/               # Datos iniciales (usuarios)
│   │   ├── locales/            # Traducciones (ES, PT, EN)
│   │   ├── App.tsx             # Punto de entrada
│   │   └── main.tsx            # Setup principal
│   ├── public/
│   │   └── favicon.ico
│   ├── index.html
│   └── package.json
│
└── docs/
    ├── SPECIFICATION.md
    ├── SETUP.md
    └── API.md
```

---

## 🌍 Multi-Región & Multi-Idioma

### Regiones Soportadas
- **México (MX)** - Zona horaria: America/Mexico_City
- **Brasil (BR)** - Zona horaria: America/Sao_Paulo
- **USA** - Zona horaria: America/New_York

### Idiomas Soportados
- **Español (ES)** - Predeterminado para México
- **Portugués (PT)** - Predeterminado para Brasil
- **Inglés (EN)** - Predeterminado para USA

### Características
- ✅ Robots filtrados por región
- ✅ Usuarios localizados por región
- ✅ Interfaz completamente traducida
- ✅ Cambio dinámico de idioma sin recargar
- ✅ Persistencia de preferencias

---

## 📊 Datos Iniciales (Demo)

### Robots Iniciales
- **Total:** 49 robots
- **Distribución por Familia:**
  - CB3: 8 robots (UR5, UR10)
  - Serie E: 31 robots (UR3e, UR5e, UR7e, UR10e, UR12e, UR16e)
  - UR Series: 5 robots (UR8L, UR15, UR20, UR30)
  - MIR: 5 robots (MIR 250, MIR 1200, MIR 1350, MC 250)

### Estados de Robots
- ✅ DISPONIBLE
- 📤 EN_PRESTAMO
- 🔧 MANTENIMIENTO
- ❌ RETIRADO

### Usuarios Iniciales
Total: 9 usuarios en 4 roles

**Admins:**
- admin@teradyne-robotics.com

**Gerente de Ventas:**
- uriel.fraire@teradyne-robotics.com

**Vendedores:**
- ximena.lama@teradyne-robotics.com
- emmanuel.ponce@teradyne-robotics.com
- miguel.lopez@teradyne-robotics.com
- jesus.coronado@teradyne-robotics.com
- maria.salcido@teradyne-robotics.com

**Técnicos de Servicio:**
- jose-giovanny.paz@teradyne-robotics.com
- vinicius.bueno-santos@teradyne-robotics.com

**Contraseña Demo:** `latamrules123`

---

## 🚢 Deploy (Frontend)

```bash
# Build
cd frontend
npm run build

# Contenido en dist/ está listo para:
# - GitHub Pages (en producción)
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
```

---

## 📞 Soporte y Debugging

### Verificar Datos en localStorage
```javascript
// En consola del navegador:
console.log(JSON.parse(localStorage.getItem('robots-demo')))
console.log(JSON.parse(localStorage.getItem('familias-demo')))
console.log(JSON.parse(localStorage.getItem('users-demo')))
```

### Limpiar localStorage (si hay problemas)
```javascript
// En consola:
localStorage.clear()
// Luego recargar la página (F5)
```

### Logs Útiles
- Abrir Console (F12)
- Filtrar por emoji: 📦, 🤖, 👨‍👩‍👧‍👦, ✅, ❌, etc.
- Buscar en los logs: "ALERTA", "ERROR", "Reinicializando"

---

## 🔐 Seguridad (Demo)

- ⚠️ **NO para Producción** - localStorage no es seguro
- Contraseña única: `latamrules123` para todos los usuarios
- Tokens simulados (no JWT reales)
- CORS deshabilitado (solo para demo)

---

## 📄 Licencia

Copyright © 2024 Teradyne Robotics. Todos los derechos reservados.

---

**Hecho con ❤️ para Teradyne Robotics LATAM**
