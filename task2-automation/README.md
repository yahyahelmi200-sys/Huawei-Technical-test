# Task 2 - Automation Testing (Cron Job)

Dua skrip otomatis untuk **pengumpulan data** dan **pembersihan file lama**.

## Struktur File

```
task2-automation/
├── collect_data.sh   # Cron job: kumpulkan data & simpan CSV
├── clean_data.sh     # Cron job: hapus file CSV > 1 bulan
├── setup_cron.sh     # Helper: daftarkan kedua cron sekaligus
└── README.md
```

## Cara Setup

```bash
# Jalankan setup otomatis (Linux/macOS)
bash setup_cron.sh

# Atau daftarkan manual via:
crontab -e
```

## Cron Schedule

```
# collect_data: 08:00, 12:00, 15:00 WIB (UTC+7 → UTC 01:00, 05:00, 08:00)
0 1,5,8 * * * /home/cron/collect_data.sh >> /home/cron/collect.log 2>&1

# clean_data: setiap hari tengah malam WIB
0 17 * * * /home/cron/clean_data.sh >> /home/cron/clean.log 2>&1
```

## Format Nama File Output

```
cron_DDMMYYYY_HH.MM.csv

Contoh:
  cron_12192024_08.00.csv   ← collect pukul 08:00
  cron_12192024_12.00.csv   ← collect pukul 12:00
  cron_12192024_15.00.csv   ← collect pukul 15:00
```

## Alur `collect_data.sh`

1. Panggil `GET http://localhost:3000/api/data` (backend Task 1)
2. Konversi response JSON → CSV
3. Simpan ke `/home/cron/cron_DDMMYYYY_HH.MM.csv`
4. Log hasil ke `/home/cron/collect.log`

## Alur `clean_data.sh`

1. Scan semua file `cron_*.csv` di `/home/cron`
2. Hapus file yang `mtime > 30 hari`
3. Log nama file & ukuran yang dihapus ke `/home/cron/clean.log`

## Contoh Log

```
# collect.log
[2025-04-30 08:00:01 WIB] INFO  Mulai mengumpulkan data dari http://localhost:3000/api/data
[2025-04-30 08:00:01 WIB] INFO  Berhasil menyimpan 5 record ke /home/cron/cron_30042025_08.00.csv

# clean.log
[2025-05-30 00:00:01 WIB] INFO  Mulai proses data cleansing di /home/cron
[2025-05-30 00:00:01 WIB] DELETE Menghapus: cron_30042025_08.00.csv (1024 bytes)
[2025-05-30 00:00:01 WIB] INFO  Selesai. 3 file dihapus, total 3072 bytes dibebaskan.
```
