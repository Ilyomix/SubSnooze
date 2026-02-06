#!/usr/bin/env bash
# SubSnooze — Supabase database backup script
# Usage: ./scripts/backup-db.sh [output_dir]
#
# Requires:
#   - supabase CLI (npx supabase or global install)
#   - SUPABASE_DB_URL environment variable (connection string)
#     Format: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
#
# Supabase Pro plan includes automatic daily backups with point-in-time recovery.
# This script provides an additional manual backup for safety.

set -euo pipefail

OUTPUT_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="subsnooze_backup_${TIMESTAMP}.sql"

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "Error: SUPABASE_DB_URL environment variable is required."
  echo "Format: postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

echo "Backing up SubSnooze database..."
pg_dump "$SUPABASE_DB_URL" \
  --no-owner \
  --no-privileges \
  --schema=public \
  --format=plain \
  > "${OUTPUT_DIR}/${FILENAME}"

# Compress the backup
gzip "${OUTPUT_DIR}/${FILENAME}"

echo "Backup saved to: ${OUTPUT_DIR}/${FILENAME}.gz"
echo "Size: $(du -h "${OUTPUT_DIR}/${FILENAME}.gz" | cut -f1)"

# Cleanup old backups (keep last 30)
BACKUP_COUNT=$(ls -1 "${OUTPUT_DIR}"/subsnooze_backup_*.sql.gz 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 30 ]; then
  ls -1t "${OUTPUT_DIR}"/subsnooze_backup_*.sql.gz | tail -n +31 | xargs rm -f
  echo "Cleaned up old backups (kept 30 most recent)"
fi

echo "Done."
