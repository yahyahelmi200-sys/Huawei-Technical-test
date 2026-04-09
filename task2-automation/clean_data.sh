#!/bin/bash
# =============================================================================
# clean_data.sh
# Skrip otomatis untuk menghapus file CSV yang sudah lebih dari 1 bulan
# di direktori /home/cron secara otomatis.
#
# Cron entry (tambahkan via: crontab -e):
#   0 0 * * * /home/cron/clean_data.sh >> /home/cron/clean.log 2>&1
# =============================================================================

SAVE_DIR="/home/cron"
LOG_FILE="${SAVE_DIR}/clean.log"
RETENTION_DAYS=30

mkdir -p "$SAVE_DIR"

log() {
  echo "[$(TZ='Asia/Jakarta' date '+%Y-%m-%d %H:%M:%S WIB')] $1" | tee -a "$LOG_FILE"
}

log "INFO  Mulai proses data cleansing di ${SAVE_DIR}"
log "INFO  Menghapus file CSV yang lebih dari ${RETENTION_DAYS} hari"

# Hitung dan tampilkan file yang akan dihapus
EXPIRED_FILES=$(find "$SAVE_DIR" -name "cron_*.csv" -type f -mtime "+${RETENTION_DAYS}" 2>/dev/null)

if [ -z "$EXPIRED_FILES" ]; then
  log "INFO  Tidak ada file yang perlu dihapus."
else
  COUNT=0
  TOTAL_SIZE=0

  while IFS= read -r FILE; do
    SIZE=$(stat -c%s "$FILE" 2>/dev/null || stat -f%z "$FILE" 2>/dev/null || echo 0)
    TOTAL_SIZE=$((TOTAL_SIZE + SIZE))
    log "DELETE Menghapus: $(basename "$FILE") (${SIZE} bytes)"
    rm -f "$FILE"
    COUNT=$((COUNT + 1))
  done <<< "$EXPIRED_FILES"

  log "INFO  Selesai. ${COUNT} file dihapus, total ${TOTAL_SIZE} bytes dibebaskan."
fi

# Ringkasan file yang masih tersimpan
REMAINING=$(ls -1 "${SAVE_DIR}"/cron_*.csv 2>/dev/null | wc -l)
log "INFO  File CSV tersisa di ${SAVE_DIR}: ${REMAINING}"

exit 0
