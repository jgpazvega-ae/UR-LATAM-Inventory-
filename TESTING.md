# 🧪 Testing Guide - Multi-Region Inventory System

## Prerequisites

- PostgreSQL running with `ur_latam_inventory` database populated via seed
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:3000`
- Test users created via seed (MX and BR regions)

## Test Scenarios

### 1. Multi-Region Isolation

#### Objective: Verify users can only see data from their region

```bash
# Terminal 1: Test MX Region User
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendedor_mx@example.com",
    "password": "password123"
  }'
# Expected: Returns token with region: "MX"

# Save the token from response as TOKEN_MX

# List robots in MX region
curl -X GET http://localhost:5000/api/robots \
  -H "Authorization: Bearer $TOKEN_MX"
# Expected: Only robots with regionId for MX

# Terminal 2: Test BR Region User
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendedor_br@example.com",
    "password": "password123"
  }'
# Save as TOKEN_BR

# List robots in BR region
curl -X GET http://localhost:5000/api/robots \
  -H "Authorization: Bearer $TOKEN_BR"
# Expected: Only robots with regionId for BR (different from MX)
```

**Expected Result**: Robots are properly isolated by region. MX and BR users see completely different robot lists.

### 2. Multi-Language Support

#### Objective: Verify translations load correctly and can be switched

```bash
# Get Spanish translations (default)
curl -X GET http://localhost:5000/api/regiones/traducciones/ES \
  -H "Authorization: Bearer $TOKEN_MX"
# Expected: Returns full Spanish (ES) translation object

# Get Portuguese translations
curl -X GET http://localhost:5000/api/regiones/traducciones/PT \
  -H "Authorization: Bearer $TOKEN_MX"
# Expected: Returns full Portuguese (PT) translation object

# Get English translations
curl -X GET http://localhost:5000/api/regiones/traducciones/EN \
  -H "Authorization: Bearer $TOKEN_MX"
# Expected: Returns full English (EN) translation object
```

**Expected Result**: All three languages are available with complete translation keys.

### 3. Robot Loan & Return with History

#### Objective: Verify complete loan lifecycle is tracked in historial

```bash
# Create a loan request
curl -X POST http://localhost:5000/api/prestamos \
  -H "Authorization: Bearer $TOKEN_MX" \
  -H "Content-Type: application/json" \
  -d '{
    "robotIds": ["robot-id-1"],
    "distribuidorId": "distribuidor-id",
    "fechaInicio": "2026-05-15",
    "fechaFin": "2026-05-20",
    "motivo": "Demo para cliente"
  }'
# Save the ID as PRESTAMO_ID

# Approve and confirm delivery
# Check robot historial - should have PRESTAMO_INICIADO event
curl -X GET http://localhost:5000/api/robots/robot-id-1/historial \
  -H "Authorization: Bearer $TOKEN_MX"
```

**Expected Result**: 
- Loan initiation creates PRESTAMO_INICIADO event
- Return creates PRESTAMO_DEVUELTO event
- Historial shows complete sequence

### 4. Robot Damage Reporting

#### Objective: Verify damage can be reported and tracked

```bash
# Report damage
curl -X POST http://localhost:5000/api/robots/robot-id-1/reportar-dano \
  -H "Authorization: Bearer $TOKEN_SERVICE" \
  -H "Content-Type: application/json" \
  -d '{
    "descripcion": "Motor dañado",
    "requisitos": "Reemplazo de motor"
  }'

# Repair the robot
curl -X POST http://localhost:5000/api/robots/robot-id-1/reparar \
  -H "Authorization: Bearer $TOKEN_SERVICE"

# Check historial for DANADO and REPARADO events
curl -X GET http://localhost:5000/api/robots/robot-id-1/historial \
  -H "Authorization: Bearer $TOKEN_MX"
```

**Expected Result**: Damage and repair events are properly tracked.

### 5. Robot Report Generation

#### Objective: Verify comprehensive robot reports

```bash
curl -X GET http://localhost:5000/api/robots/robot-id-1/reportes \
  -H "Authorization: Bearer $TOKEN_MX"
# Expected: Includes robot details, historial, and resumen statistics
```

### 6. Region Access Control

#### Objective: Verify cross-region access is blocked

```bash
# Try to access MX robot from BR user
curl -X GET http://localhost:5000/api/robots/mx-robot-id \
  -H "Authorization: Bearer $TOKEN_BR"
# Expected: 404 error (not found)
```

## Frontend Testing

1. Login with different region users
2. Verify language switching works
3. Check that historial tab shows robot events
4. Create loan, confirm delivery, verify robot state changes
5. Report damage and verify state becomes DANADO
6. Repair and verify state returns to DISPONIBLE

## Checklist

- [ ] MX user sees only MX robots
- [ ] BR user sees only BR robots
- [ ] Language switching loads correct translations
- [ ] Loan creates PRESTAMO_INICIADO event
- [ ] Return creates PRESTAMO_DEVUELTO event
- [ ] Damage report creates DANADO event
- [ ] Repair creates REPARADO event
- [ ] Cross-region access is blocked
- [ ] Reports show correct statistics
