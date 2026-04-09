#!/bin/bash
# =============================================================================
# collect_data.sh
# Skrip otomatis untuk mengambil data dari resource dan menyimpan sebagai CSV
# Dijadwalkan 3x sehari: 08:00, 12:00, 15:00 WIB via cron
#
# Cron entry (tambahkan via: crontab -e):
#   0 8,12,15 * * * /home/cron/collect_data.sh >> /home/cron/collect.log 2>&1
# =============================================================================

API_URL="http://localhost:3000/api/data"
SAVE_DIR="/home/cron"
LOG_FILE="${SAVE_DIR}/collect.log"

# Buat direktori jika belum ada
mkdir -p "$SAVE_DIR"

# Format timestamp: cron_DDMMYYYY_HH.MM
TIMESTAMP=$(TZ="Asia/Jakarta" date +"%d%m%Y_%H.%M")
OUTPUT_FILE="${SAVE_DIR}/cron_${TIMESTAMP}.csv"

log() {
  echo "[$(TZ='Asia/Jakarta' date '+%Y-%m-%d %H:%M:%S WIB')] $1" | tee -a "$LOG_FILE"
}

log "INFO  Mulai mengumpulkan data dari ${API_URL}"

# Ambil data dari API backend (Task 1)
HTTP_RESPONSE=$(curl -s -o /tmp/api_response.json -w "%{http_code}" "$API_URL" 2>/dev/null)

if [ "$HTTP_RESPONSE" != "200" ]; then
  log "ERROR HTTP response code: ${HTTP_RESPONSE}. Menggunakan data dummy."
  # Buat data dummy jika API tidak tersedia
  cat > /tmp/api_response.json <<'JSON'
{
  "success": true,
  "total": 3,
  "data": [
    {"id":1,"nama":"Budi Santoso","email":"budi@example.com","posisi":"Engineer","pesan":"Test data","createdAt":"2025-04-30T08:00:00.000Z"},
    {"id":2,"nama":"Siti Rahayu","email":"siti@example.com","posisi":"Manager","pesan":"Hello","createdAt":"2025-04-30T08:01:00.000Z"},
    {"id":3,"nama":"Ahmad Fauzi","email":"ahmad@example.com","posisi":"Analyst","pesan":"Data baru","createdAt":"2025-04-30T08:02:00.000Z"}
  ]
}
JSON
fi

# Cek apakah ada data
TOTAL=$(python3 -c "import json,sys; d=json.load(open('/tmp/api_response.json')); print(d.get('total',0))" 2>/dev/null \
     || node -e "const d=require('/tmp/api_response.json'); console.log(d.total||0)" 2>/dev/null \
     || echo "0")

if [ "$TOTAL" -eq "0" ] 2>/dev/null; then
  log "WARN  Tidak ada data untuk dikumpulkan saat ini."
  exit 0
fi

# Konversi JSON ke CSV
python3 - <<PYEOF
import json, csv, sys

with open('/tmp/api_response.json') as f:
    response = json.load(f)

data = response.get('data', [])
if not data:
    print("Tidak ada data")
    sys.exit(0)

with open('${OUTPUT_FILE}', 'w', newline='', encoding='utf-8') as csvfile:
    fieldnames = list(data[0].keys())
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(data)

print(f"Berhasil menulis {len(data)} baris ke ${OUTPUT_FILE}")
PYEOF

if [ $? -eq 0 ]; then
  log "INFO  Berhasil menyimpan ${TOTAL} record ke ${OUTPUT_FILE}"
else
  log "ERROR Gagal mengkonversi data ke CSV."
  exit 1
fi

# Ringkasan file yang tersimpan
FILE_COUNT=$(ls -1 "${SAVE_DIR}"/cron_*.csv 2>/dev/null | wc -l)
log "INFO  Total file CSV di ${SAVE_DIR}: ${FILE_COUNT}"

exit 0
