#!/bin/bash

# Espera a que PostgreSQL esté listo
echo "Esperando a que la base de datos esté disponible en $PGHOST:$PGPORT..."

until pg_isready -h "$PGHOST" -p "$PGPORT" -U "$PGUSER"; do
  >&2 echo "Postgres aún no está disponible - esperando 2 segundos..."
  sleep 2
done

echo "Postgres está listo - iniciando Odoo..."
exec "$@"
