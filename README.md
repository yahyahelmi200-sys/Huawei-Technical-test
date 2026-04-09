# Huawei-Technical-test

---

# Task 1 - Pengembangan Backend

Server sederhana menggunakan **Node.js + Express** untuk menerima, menyimpan, dan mengembalikan data formulir dari frontend.

## Prasyarat

- [Node.js](https://nodejs.org/) v18 atau lebih baru

## Cara Menjalankan

```bash
# 1. Masuk ke folder proyek
cd task1-backend

# 2. Install dependensi
npm install

# 3. Jalankan server
npm start
```

Server akan berjalan di **http://localhost:3000**

## Endpoint API

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/` | Health check & daftar endpoint |
| `POST` | `/api/form` | Simpan data formulir baru |
| `GET` | `/api/data` | Ambil semua data yang tersimpan |
| `GET` | `/api/data/:id` | Ambil data berdasarkan ID |
| `DELETE` | `/api/data/:id` | Hapus data berdasarkan ID |

## Contoh Request & Response

### POST /api/form

**Request:**
```json
{
  "nama": "Budi Santoso",
  "email": "budi@example.com",
  "posisi": "Engineer",
  "pesan": "Halo dunia"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Data berhasil disimpan.",
  "data": {
    "id": 1,
    "nama": "Budi Santoso",
    "email": "budi@example.com",
    "posisi": "Engineer",
    "pesan": "Halo dunia",
    "createdAt": "2025-04-30T08:00:00.000Z"
  }
}
```

### GET /api/data

**Response (200):**
```json
{
  "success": true,
  "total": 1,
  "data": [...]
}
```

## Frontend

Buka file `index.html` di browser (pastikan server sudah berjalan) untuk menggunakan antarmuka formulir.

## Struktur Proyek

```
task1-backend/
├── server.js       # Entry point — Express server & semua endpoint
├── package.json    # Dependensi dan script
├── index.html      # Frontend formulir sederhana
└── README.md
```

---

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

---

# Task 3 - Data Processing (SQL)

Query SQL untuk mengelola tabel `employee` sesuai ketentuan soal.

## Struktur File

```
task3-sql/
├── schema.sql   # CREATE TABLE + INSERT data awal
├── queries.sql  # 5 query utama sesuai soal
└── README.md
```

## Cara Menjalankan

### Menggunakan SQLite (direkomendasikan, tidak perlu instalasi server)

```bash
# Buat database dan jalankan semua query
sqlite3 employee.db < schema.sql
sqlite3 employee.db < queries.sql
```

### Menggunakan MySQL / MariaDB

```sql
-- Ubah AUTOINCREMENT → AUTO_INCREMENT pada schema.sql, lalu:
SOURCE schema.sql;
SOURCE queries.sql;
```

### Menggunakan PostgreSQL

```sql
-- Ubah AUTOINCREMENT → SERIAL pada schema.sql, lalu:
\i schema.sql
\i queries.sql
```

---

## Data Awal

| Name  | Position           | Join Date  | Release Date | Year of Exp | Salary |
|-------|--------------------|------------|--------------|-------------|--------|
| Jacky | Solution Architect | 2018-07-25 | 2022-07-25   | 8.0         | $150   |
| John  | Assistant Manager  | 2016-02-02 | 2021-02-02   | 12.0        | $155   |
| Alano | Manager            | 2010-11-09 | -            | 14.0        | $175   |
| Aaron | Engineer           | 2021-08-16 | 2022-08-16   | 1.0         | $80    |
| Allen | Engineer           | 2024-06-06 | -            | 4.0         | $75    |
| Peter | Team Leader        | 2020-01-09 | -            | 3.0         | $85    |

---

## Penjelasan Query

### Query 1 — INSERT Albert
```sql
INSERT INTO employee (name, position, join_date, release_date, year_of_exp, salary)
VALUES ('Albert', 'Engineer', '2024-01-24', NULL, 2.5, 50.00);
```

### Query 2 — UPDATE salary Engineer menjadi $85
```sql
UPDATE employee
SET salary = 85.00
WHERE LOWER(position) = 'engineer';
```
> Setelah update: Aaron, Allen, Albert → salary $85

### Query 3 — Total salary tahun 2021
Karyawan dianggap **aktif di 2021** jika:
- `join_date <= 2021-12-31` **DAN**
- `release_date IS NULL` ATAU `release_date >= 2021-01-01`

| Karyawan Aktif 2021 | Salary |
|---------------------|--------|
| Jacky               | $150   |
| John                | $155   |
| Alano               | $175   |
| Aaron               | $80    |
| Peter               | $85    |
| **Total**           | **$645** |

### Query 4 — TOP 3 Experience terbanyak
| Name  | Position           | Year of Exp |
|-------|--------------------|-------------|
| Alano | Manager            | 14.0        |
| John  | Assistant Manager  | 12.0        |
| Jacky | Solution Architect | 8.0         |

### Query 5 — Subquery Engineer dengan experience ≤ 3 tahun
```sql
SELECT ... FROM employee
WHERE id IN (
    SELECT id FROM employee
    WHERE LOWER(position) = 'engineer' AND year_of_exp <= 3.0
);
```
> Hasil (setelah INSERT Albert): **Aaron** (1 year), **Albert** (2.5 year)
