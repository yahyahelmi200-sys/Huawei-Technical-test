-- =============================================================================
-- schema.sql
-- Membuat tabel dan mengisi data awal sesuai soal Task 3
-- =============================================================================

CREATE TABLE IF NOT EXISTS employee (
    id               INTEGER       PRIMARY KEY AUTOINCREMENT,
    name             VARCHAR(100)  NOT NULL,
    position         VARCHAR(100)  NOT NULL,
    join_date        DATE          NOT NULL,
    release_date     DATE          NULL,          -- NULL = masih aktif
    year_of_exp      DECIMAL(4,1)  NOT NULL,
    salary           DECIMAL(10,2) NOT NULL
);

-- Data awal dari soal
INSERT INTO employee (name, position, join_date, release_date, year_of_exp, salary) VALUES
    ('Jacky', 'Solution Architect', '2018-07-25', '2022-07-25', 8.0,  150.00),
    ('John',  'Assistant Manager',  '2016-02-02', '2021-02-02', 12.0, 155.00),
    ('Alano', 'Manager',            '2010-11-09', NULL,         14.0, 175.00),
    ('Aaron', 'Engineer',           '2021-08-16', '2022-08-16', 1.0,   80.00),
    ('Allen', 'Engineer',           '2024-06-06', NULL,          4.0,  75.00),
    ('Peter', 'Team Leader',        '2020-01-09', NULL,          3.0,  85.00);
