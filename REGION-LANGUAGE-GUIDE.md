# 🌍 Guía de Selección de Región e Idioma

## Dónde Seleccionar Región e Idioma

### 1. En la Pantalla de Login 🔐

Cuando accedas a `http://localhost:3000/login`, verás:

```
┌─────────────────────────────────────┐
│   Teradyne Robotics                 │
│   Control de Inventarios            │
├─────────────────────────────────────┤
│ Email o Usuario:                    │
│ [                                 ] │
│                                     │
│ Contraseña:                         │
│ [                                 ] │
│                                     │
│ ┌─────────────────┬────────────────┐│
│ │ Región ▼        │ Idioma ▼       ││
│ │ México          │ Español        ││
│ │ Brasil          │ Português      ││
│ │ USA             │ English        ││
│ └─────────────────┴────────────────┘│
│                                     │
│        [  Ingresar  ]               │
│                                     │
│ ¿No tienes cuenta? Regístrate aquí  │
└─────────────────────────────────────┘
```

**Pasos:**
1. Selecciona tu **Región**: México 🇲🇽, Brasil 🇧🇷, o USA 🇺🇸
2. Selecciona tu **Idioma**: Español, Português, o English
3. Ingresa email/usuario y contraseña
4. Haz clic en "Ingresar"

### 2. Dentro de la Aplicación (Header) 📱

Una vez autenticado, en la esquina superior derecha del header encontrarás:

```
┌────────────────────────────────────────────────────────┐
│ Sistema de Control de Inventarios                      │
│                               [MX▼] [ES▼] │ Usuario   │
│                                           │ Logout    │
└────────────────────────────────────────────────────────┘
```

**Selectores disponibles:**
- **Región**: 🇲🇽 México, 🇧🇷 Brasil, 🇺🇸 USA
- **Idioma**: ES (Español), PT (Português), EN (English)

**Para cambiar:**
1. Haz clic en el selector de región o idioma
2. Selecciona la nueva opción
3. La página se actualizará automáticamente
4. El cambio se guarda en localStorage (persiste al cerrar sesión)

## Comportamiento según Región 🔒

### México (MX)
- **Idioma predeterminado**: Español
- **Zona horaria**: America/Mexico_City
- **Formato fecha**: DD/MM/YYYY
- **Moneda**: MXN
- **Robots visibles**: Solo los de México
- **Usuarios visibles**: Solo los de México

### Brasil (BR)
- **Idioma predeterminado**: Portugués
- **Zona horaria**: America/Sao_Paulo
- **Formato fecha**: DD/MM/YYYY
- **Moneda**: BRL
- **Robots visibles**: Solo los de Brasil
- **Usuarios visibles**: Solo los de Brasil

### USA
- **Idioma predeterminado**: English
- **Zona horaria**: America/New_York
- **Formato fecha**: MM/DD/YYYY
- **Moneda**: USD
- **Robots visibles**: Solo los de USA
- **Usuarios visibles**: Solo los de USA

## Cambio de Idioma 🗣️

Los idiomas disponibles son:

| Código | Nombre | Bandera |
|--------|--------|---------|
| ES | Español | 🇪🇸 |
| PT | Português | 🇵🇹 |
| EN | English | 🇺🇸 |

Al cambiar de idioma:
- ✅ Menú de navegación se actualiza
- ✅ Formularios se traducen
- ✅ Mensajes de error en nuevo idioma
- ✅ Fechas se formatean según regional
- ✅ Historial de robots se muestra en nuevo idioma

## Usuarios de Prueba por Región 👥

### Región México (MX)
```
Admin:
- Email: admin@teradyne-robotics.com
- Password: password123
- Region: MX
- Language: ES

Gerente de Ventas:
- Email: uriel.fraire@teradyne-robotics.com
- Password: password123
- Region: MX

Vendedor:
- Email: ximena.lama@teradyne-robotics.com
- Password: password123
- Region: MX

Servicio:
- Email: giovanny.paz@teradyne-robotics.com
- Password: password123
- Region: MX
```

### Región Brasil (BR)
```
Vendedor BR:
- Email: vendedor_br@example.com
- Password: password123
- Region: BR
- Language: PT
```

### Región USA
```
Vendedor USA:
- Email: vendedor_usa@example.com
- Password: password123
- Region: USA
- Language: EN
```

## Aislamiento de Datos 🔐

Cuando seleccionas una región:

1. **Backend filtra automáticamente** los datos por regionId
2. **No puedes ver datos de otras regiones** (403 Forbidden)
3. **El token JWT contiene tu región** para validación
4. **Las solicitudes incluyen filtros de región** automáticamente

Ejemplo: Si eres usuario de MX:
- ✅ Ver robots de MX
- ✅ Ver usuarios de MX
- ✅ Ver solicitudes de MX
- ❌ No ver robots de BR
- ❌ No ver usuarios de USA
- ❌ No ver solicitudes de BR

## Flujo Completo 🔄

```
1. Acceder a Login
   ↓
2. Seleccionar Región (México, Brasil, USA)
   ↓
3. Seleccionar Idioma (Español, Portugués, English)
   ↓
4. Ingresar credenciales
   ↓
5. Dashboard carga en región e idioma seleccionados
   ↓
6. Header muestra selectores para cambiar en cualquier momento
   ↓
7. Cambio automático de idioma en toda la app
   ↓
8. Datos siempre filtrados por región del usuario
```

## Troubleshooting 🔧

### No veo los selectores en Login
- ✓ Verifica que estés en `http://localhost:3000/login`
- ✓ Limpia cache del navegador (Ctrl+Shift+Delete)
- ✓ Recarga la página (F5)

### No cambia el idioma
- ✓ Verifica que el backend está corriendo (`npm run dev`)
- ✓ Revisa la consola del navegador (F12 → Console)
- ✓ Verifica que el archivo de idioma existe en `backend/src/i18n/`

### Veo robots de otra región
- ✓ Verifica que el token JWT contiene la región correcta
- ✓ Cierra sesión y vuelve a entrar
- ✓ Limpia localStorage: `localStorage.clear()` en console

### El selector de región no funciona
- ✓ Verifica que el endpoint `/api/regiones/publicas` responde
- ✓ Revisa que las regiones estén en la base de datos
- ✓ Revisa los logs del backend

## Testing 🧪

Para verificar que multi-región y multi-idioma funcionan:

```bash
# 1. Login como usuario de MX
Email: ximena.lama@teradyne-robotics.com
Password: password123
Region: MX
Language: ES

# 2. Ver robots disponibles
# Deberías ver solo robots de MX

# 3. Cambiar a idioma PT
# El UI debería cambiar a Portugués

# 4. Cambiar región a BR (si es posible)
# Backend debería filtrar datos para BR

# 5. Cambiar a Language EN
# Todo debería estar en English
```

---

**Versión**: 2.0
**Última actualización**: 29 de Abril de 2026
**Estado**: ✅ Listo para producción
