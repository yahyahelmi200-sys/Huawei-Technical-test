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
