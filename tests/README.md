# Playwright Tests

## Instalasi & Menjalankan Test

```bash
# Dari root folder D:\Interview_task

# 1. Install semua dependensi
npm install

# 2. Install Playwright browsers (hanya perlu sekali)
npx playwright install

# 3. Jalankan semua test
npm test

# 4. Jalankan per task
npm run test:task1   # API Backend
npm run test:task2   # Automation Scripts
npm run test:task3   # SQL Queries

# 5. Lihat HTML report
npm run test:report
```

## Ringkasan Test Cases

### task1.spec.js — API Backend (15 test)
| Test | Deskripsi |
|------|-----------|
| GET / | Health check & daftar endpoint |
| POST /api/form | Simpan data valid → 201 |
| POST /api/form | Data kosong → 400 |
| POST /api/form | createdAt berformat ISO 8601 |
| POST /api/form | ID bertambah tiap data baru |
| GET /api/data | Mengembalikan array + total |
| GET /api/data | total == panjang array |
| GET /api/data | Data baru muncul di response |
| GET /api/data/:id | Data benar berdasarkan ID |
| GET /api/data/:id | 404 jika ID tidak ada |
| DELETE /api/data/:id | Hapus berhasil + kembalikan data |
| DELETE /api/data/:id | 404 setelah dihapus |
| DELETE /api/data/:id | 404 jika ID tidak ada |

### task2.spec.js — Automation Scripts (18 test)
| Test | Deskripsi |
|------|-----------|
| Format nama file | cron_DDMMYYYY_HH.MM.csv |
| Format nama file | Tiga jadwal: 08.00, 12.00, 15.00 |
| Collect data | File CSV terbuat |
| Collect data | Header CSV benar |
| Collect data | Jumlah baris = data + 1 header |
| Collect data | Nilai data tersimpan benar |
| Collect data | 3 file terpisah untuk 3 jadwal |
| Clean data | File >30 hari dihapus |
| Clean data | File <30 hari tidak dihapus |
| Clean data | Hanya cron_*.csv yang dihapus |
| Clean data | Skenario campuran |
| File skrip | collect_data.sh & clean_data.sh ada |

### task3.spec.js — SQL Queries (23 test)
| Test | Deskripsi |
|------|-----------|
| Schema | Tabel terbuat, 6 kolom benar |
| Schema | 6 data awal tersimpan |
| Query 1 | INSERT Albert berhasil |
| Query 1 | Semua field Albert benar |
| Query 2 | UPDATE salary Engineer = 85 |
| Query 2 | Non-Engineer tidak terpengaruh |
| Query 3 | 5 karyawan aktif 2021 |
| Query 3 | Total salary 2021 = 650 |
| Query 4 | TOP 3: Alano, John, Jacky |
| Query 4 | Urutan descending benar |
| Query 5 | Subquery Engineer ≤ 3 tahun |
| Query 5 | Aaron & Albert masuk, Allen tidak |
