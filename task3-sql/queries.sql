-- =============================================================================
-- queries.sql
-- Huawei Technical Test - Task 3: Data Processing (SQL)
-- Jalankan schema.sql terlebih dahulu sebelum file ini
-- =============================================================================

-- ============================================================
-- Query 1: INSERT — Tambahkan employee baru Albert
-- Posisi: Engineer, Join Date: 24 Januari 2024,
-- Year of Experience: 2.5 year, Salary: $50
-- ============================================================
INSERT INTO employee (name, position, join_date, release_date, year_of_exp, salary)
VALUES ('Albert', 'Engineer', '2024-01-24', NULL, 2.5, 50.00);

-- Verifikasi
SELECT * FROM employee WHERE name = 'Albert';


-- ============================================================
-- Query 2: UPDATE — Semua posisi Engineer diupdate salary $85
-- ============================================================
UPDATE employee
SET salary = 85.00
WHERE LOWER(position) = 'engineer';

-- Verifikasi
SELECT id, name, position, salary
FROM employee
WHERE LOWER(position) = 'engineer';


-- ============================================================
-- Query 3: Hitung total pengeluaran salary pada tahun 2021
-- Karyawan aktif di tahun 2021:
--   join_date <= '2021-12-31'
--   AND (release_date IS NULL OR release_date >= '2021-01-01')
-- ============================================================
SELECT
    SUM(salary) AS total_salary_2021
FROM employee
WHERE
    join_date    <= '2021-12-31'
    AND (release_date IS NULL OR release_date >= '2021-01-01');

-- Detail karyawan aktif tahun 2021
SELECT
    name,
    position,
    join_date,
    release_date,
    salary
FROM employee
WHERE
    join_date    <= '2021-12-31'
    AND (release_date IS NULL OR release_date >= '2021-01-01')
ORDER BY salary DESC;


-- ============================================================
-- Query 4: Sorting — Tampilkan 3 employee dengan
-- Years of Experience terbanyak
-- ============================================================
SELECT
    name,
    position,
    year_of_exp,
    salary
FROM employee
ORDER BY year_of_exp DESC
LIMIT 3;


-- ============================================================
-- Query 5: Subquery — Employee dengan posisi Engineer
-- yang memiliki experience <= 3 tahun
-- ============================================================
SELECT
    id,
    name,
    position,
    year_of_exp,
    salary
FROM employee
WHERE id IN (
    SELECT id
    FROM employee
    WHERE LOWER(position) = 'engineer'
      AND year_of_exp <= 3.0
)
ORDER BY year_of_exp ASC;
