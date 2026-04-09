#!/bin/bash
# =============================================================================
# setup_cron.sh
# Skrip instalasi otomatis untuk mendaftarkan kedua cron job
# Jalankan sekali: bash setup_cron.sh
# =============================================================================

SCRIPT_DIR="/home/cron"
COLLECT_SCRIPT="${SCRIPT_DIR}/collect_data.sh"
CLEAN_SCRIPT="${SCRIPT_DIR}/clean_data.sh"

echo "=== Setup Cron Jobs ==="

# Buat direktori kerja
mkdir -p "$SCRIPT_DIR"

# Salin skrip ke /home/cron
cp collect_data.sh "$COLLECT_SCRIPT"
cp clean_data.sh   "$CLEAN_SCRIPT"

# Beri permission eksekusi
chmod +x "$COLLECT_SCRIPT"
chmod +x "$CLEAN_SCRIPT"

echo "Skrip disalin ke ${SCRIPT_DIR}"

# Tambahkan cron entries (hapus duplikat dulu)
CRON_TMP=$(mktemp)
crontab -l 2>/dev/null | grep -v "collect_data.sh" | grep -v "clean_data.sh" > "$CRON_TMP"

# collect_data: setiap hari pukul 08:00, 12:00, 15:00 WIB (UTC+7 → UTC: 01:00, 05:00, 08:00)
echo "0 1,5,8 * * * ${COLLECT_SCRIPT} >> ${SCRIPT_DIR}/collect.log 2>&1" >> "$CRON_TMP"

# clean_data: setiap hari pukul 00:00 WIB (UTC+7 → UTC: 17:00 hari sebelumnya)
echo "0 17 * * * ${CLEAN_SCRIPT} >> ${SCRIPT_DIR}/clean.log 2>&1" >> "$CRON_TMP"

crontab "$CRON_TMP"
rm "$CRON_TMP"

echo ""
echo "Cron jobs berhasil didaftarkan:"
echo "  - collect_data.sh : setiap hari pukul 08:00, 12:00, 15:00 WIB"
echo "  - clean_data.sh   : setiap hari pukul 00:00 WIB (hapus file >30 hari)"
echo ""
echo "Verifikasi dengan: crontab -l"
crontab -l
