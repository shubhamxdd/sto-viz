#!/bin/sh
set -e

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="${BACKUP_DIR}/foliocity_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "Starting PostgreSQL backup to ${FILENAME}..."
docker compose exec -T db pg_dump -U "${POSTGRES_USER:-foliouser}" "${POSTGRES_DB:-foliocity}" | gzip > "${FILENAME}"

echo "Backup complete: ${FILENAME}"
