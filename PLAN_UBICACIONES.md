📋 PLAN: Sistema Profesional de Gestión de Ubicaciones de Robots
═══════════════════════════════════════════════════════════════

FASE 1: INFRAESTRUCTURA DE UBICACIONES
──────────────────────────────────────────
✅ 1.1 Servicio de Ubicaciones
   - CRUD de ubicaciones (crear, editar, eliminar)
   - Tipos: Oficina, Cliente, Almacén, Taller, Otro
   - Datos: nombre, tipo, dirección, contacto, teléfono
   - Estados: Activa, Inactiva, Archivada

✅ 1.2 Mejorar Robot Service
   - Agregar campo ubicacionActual (con timestamp)
   - Agregar historial de ubicaciones
   - Registrar movimientos (quién, cuándo, desde dónde, hacia dónde)
   - Registrar razón del movimiento (Préstamo, Retorno, Mantenimiento, etc)

✅ 1.3 Servicio de Movimientos
   - Registro de cada cambio de ubicación
   - Trazabilidad completa
   - Alertas si un robot sale de ubicación esperada

FASE 2: INTERFAZ DE USUARIO
──────────────────────────────────────────
✅ 2.1 Página de Ubicaciones
   - Lista de todas las ubicaciones
   - Mapa interactivo (visual de ubicaciones)
   - Cantidad de robots por ubicación
   - Estado de ubicación

✅ 2.2 Dashboard de Robots por Ubicación
   - Vista de robots en cada ubicación
   - Filtrado por ubicación/estado/tipo
   - Información detallada de cada robot
   - Botón "Ver historial de movimientos"

✅ 2.3 Historial de Movimientos
   - Timeline visual de movimientos
   - Quién movió el robot
   - Cuándo
   - Desde/Hacia
   - Razón del movimiento

FASE 3: REPORTES Y ANÁLISIS
──────────────────────────────────────────
✅ 3.1 Reportes Disponibles
   - Robots por ubicación (CSV/PDF)
   - Historial de movimientos de un robot
   - Actividad diaria/semanal/mensual
   - Robots sin actividad (potenciales robos)

✅ 3.2 Alertas Automáticas
   - Robot no regresó en fecha estimada
   - Robot moved unexpectedly
   - Robot detectado en ubicación no autorizada

FASE 4: MEJORA DE UI/UX GENERAL
──────────────────────────────────────────
✅ 4.1 Diseño más Profesional
   - Colores corporativos mejorados
   - Iconografía consistente
   - Espaciado y tipografía profesional
   - Animations sutiles y fluidas

✅ 4.2 Componentes Reutilizables
   - Cards mejoradas
   - Badges con más información
   - Modales profesionales
   - Tablas con sorteo y paginación

═══════════════════════════════════════════════════════════════

IMPLEMENTACIÓN RECOMENDADA (orden de prioridad):
1. Crear Servicio de Ubicaciones
2. Mejorar datos de Robot (agregar ubicación + historial)
3. Crear página "Ubicaciones de Robots" (dashboard visual)
4. Crear Servicio de Movimientos
5. Historial de movimientos visual
6. Reportes básicos
7. Mejorar UI/UX general
8. Alertas automáticas
