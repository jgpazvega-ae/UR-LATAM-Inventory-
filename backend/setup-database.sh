#!/bin/bash

# Script para configurar PostgreSQL y aplicar migraciones
# Ejecutar esto cuando tengas PostgreSQL instalado

set -e

echo "🚀 Iniciando configuración de base de datos..."

# Paso 1: Instalar PostgreSQL (si no está instalado)
echo "📍 Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL no está instalado. Instalando..."

    # Detectar sistema operativo
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update
        sudo apt-get install -y postgresql postgresql-contrib
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install postgresql
    else
        echo "❌ Sistema operativo no soportado. Instala PostgreSQL manualmente."
        exit 1
    fi
fi

# Paso 2: Iniciar PostgreSQL
echo "📍 Iniciando servicio PostgreSQL..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo systemctl start postgresql
elif [[ "$OSTYPE" == "darwin"* ]]; then
    brew services start postgresql
fi

sleep 2

# Paso 3: Crear base de datos
echo "📍 Creando base de datos..."
psql -U postgres -c "CREATE DATABASE ur_latam_inventory;" 2>/dev/null || echo "Base de datos ya existe"

# Paso 4: Aplicar migraciones
echo "📍 Aplicando migraciones de Prisma..."
cd /home/user/UR-LATAM-Inventory-/backend

# Generar cliente Prisma
npx prisma generate

# Crear migración
npx prisma migrate dev --name add_multiregion_multiidioma_historial

# Paso 5: Cargar datos iniciales
echo "📍 Cargando datos iniciales..."
npx prisma db seed

echo ""
echo "✅ Base de datos configurada exitosamente"
echo "📊 Regiones: México, Brasil, USA"
echo "🌐 Idiomas: Español, Portugués, Inglés"
echo "🤖 ${robot_count} robots cargados"
echo ""
echo "Próximo paso: Iniciar el backend con 'npm run dev'"
