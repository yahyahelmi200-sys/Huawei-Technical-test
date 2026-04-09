// =============================================================================
// task3.spec.js — Test SQL Queries (Task 3)
// Menggunakan better-sqlite3 (in-memory) untuk verifikasi semua query
// =============================================================================

const { test, expect } = require('@playwright/test');
const Database = require('better-sqlite3');
const fs       = require('fs');
const path     = require('path');

// Buat database in-memory baru untuk setiap test suite
let db;

test.beforeAll(() => {
  db = new Database(':memory:');

  // Jalankan schema: buat tabel & insert data awal
  const schema = fs.readFileSync(
    path.join(__dirname, '../task3-sql/schema.sql'),
    'utf8'
  );
  // Hapus komentar SQL agar tidak error saat dijalankan
  const cleanSchema = schema.replace(/--.*$/gm, '').trim();
  db.exec(cleanSchema);
});

test.afterAll(() => {
  db.close();
});

// ─────────────────────────────────────────────────────────────────────────────
// Setup: Verifikasi Data Awal
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Data Awal (schema.sql)', () => {
  test('tabel employee berhasil dibuat', () => {
    const row = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='employee'"
    ).get();
    expect(row).toBeDefined();
    expect(row.name).toBe('employee');
  });

  test('tabel memiliki 6 kolom yang benar', () => {
    const cols = db.prepare('PRAGMA table_info(employee)').all();
    const names = cols.map((c) => c.name);
    expect(names).toContain('id');
    expect(names).toContain('name');
    expect(names).toContain('position');
    expect(names).toContain('join_date');
    expect(names).toContain('release_date');
    expect(names).toContain('year_of_exp');
    expect(names).toContain('salary');
  });

  test('data awal berisi 6 karyawan', () => {
    const result = db.prepare('SELECT COUNT(*) AS total FROM employee').get();
    expect(result.total).toBe(6);
  });

  test('data awal mengandung semua karyawan yang diharapkan', () => {
    const names = db.prepare('SELECT name FROM employee ORDER BY id').all().map((r) => r.name);
    expect(names).toEqual(['Jacky', 'John', 'Alano', 'Aaron', 'Allen', 'Peter']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Query 1: INSERT Albert
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Query 1 — INSERT Albert', () => {
  test.beforeAll(() => {
    db.exec(`
      INSERT INTO employee (name, position, join_date, release_date, year_of_exp, salary)
      VALUES ('Albert', 'Engineer', '2024-01-24', NULL, 2.5, 50.00)
    `);
  });

  test('Albert berhasil ditambahkan', () => {
    const row = db.prepare("SELECT * FROM employee WHERE name = 'Albert'").get();
    expect(row).toBeDefined();
  });

  test('posisi Albert adalah Engineer', () => {
    const row = db.prepare("SELECT position FROM employee WHERE name = 'Albert'").get();
    expect(row.position).toBe('Engineer');
  });

  test('join_date Albert adalah 2024-01-24', () => {
    const row = db.prepare("SELECT join_date FROM employee WHERE name = 'Albert'").get();
    expect(row.join_date).toBe('2024-01-24');
  });

  test('year_of_exp Albert adalah 2.5', () => {
    const row = db.prepare("SELECT year_of_exp FROM employee WHERE name = 'Albert'").get();
    expect(Number(row.year_of_exp)).toBe(2.5);
  });

  test('salary Albert adalah 50', () => {
    const row = db.prepare("SELECT salary FROM employee WHERE name = 'Albert'").get();
    expect(Number(row.salary)).toBe(50);
  });

  test('release_date Albert adalah NULL', () => {
    const row = db.prepare("SELECT release_date FROM employee WHERE name = 'Albert'").get();
    expect(row.release_date).toBeNull();
  });

  test('total karyawan menjadi 7 setelah INSERT', () => {
    const result = db.prepare('SELECT COUNT(*) AS total FROM employee').get();
    expect(result.total).toBe(7);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Query 2: UPDATE salary Engineer = $85
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Query 2 — UPDATE salary Engineer', () => {
  test.beforeAll(() => {
    db.exec(`
      UPDATE employee
      SET salary = 85.00
      WHERE LOWER(position) = 'engineer'
    `);
  });

  test('semua Engineer memiliki salary 85', () => {
    const engineers = db.prepare(
      "SELECT salary FROM employee WHERE LOWER(position) = 'engineer'"
    ).all();

    expect(engineers.length).toBeGreaterThan(0);
    for (const eng of engineers) {
      expect(Number(eng.salary)).toBe(85);
    }
  });

  test('Aaron (Engineer) salary diupdate menjadi 85', () => {
    const row = db.prepare("SELECT salary FROM employee WHERE name = 'Aaron'").get();
    expect(Number(row.salary)).toBe(85);
  });

  test('Allen (Engineer) salary diupdate menjadi 85', () => {
    const row = db.prepare("SELECT salary FROM employee WHERE name = 'Allen'").get();
    expect(Number(row.salary)).toBe(85);
  });

  test('Albert (Engineer) salary diupdate menjadi 85', () => {
    const row = db.prepare("SELECT salary FROM employee WHERE name = 'Albert'").get();
    expect(Number(row.salary)).toBe(85);
  });

  test('non-Engineer tidak terpengaruh — Alano (Manager) salary tetap 175', () => {
    const row = db.prepare("SELECT salary FROM employee WHERE name = 'Alano'").get();
    expect(Number(row.salary)).toBe(175);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Query 3: Total salary tahun 2021
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Query 3 — Total Salary Tahun 2021', () => {
  test('karyawan aktif di 2021 berjumlah 5', () => {
    const result = db.prepare(`
      SELECT COUNT(*) AS total
      FROM employee
      WHERE join_date    <= '2021-12-31'
        AND (release_date IS NULL OR release_date >= '2021-01-01')
    `).get();
    expect(result.total).toBe(5);
  });

  test('karyawan aktif 2021 adalah Jacky, John, Alano, Aaron, Peter', () => {
    const rows = db.prepare(`
      SELECT name FROM employee
      WHERE join_date    <= '2021-12-31'
        AND (release_date IS NULL OR release_date >= '2021-01-01')
      ORDER BY name
    `).all();

    const names = rows.map((r) => r.name);
    expect(names).toContain('Jacky');
    expect(names).toContain('John');
    expect(names).toContain('Alano');
    expect(names).toContain('Aaron');
    expect(names).toContain('Peter');
  });

  test('Allen TIDAK aktif di 2021 (join 2024)', () => {
    const row = db.prepare(`
      SELECT name FROM employee
      WHERE name = 'Allen'
        AND join_date    <= '2021-12-31'
        AND (release_date IS NULL OR release_date >= '2021-01-01')
    `).get();
    expect(row).toBeUndefined();
  });

  test('total salary 2021 = 645 (setelah UPDATE Engineer menjadi 85)', () => {
    // Jacky=150, John=155, Alano=175, Aaron=85 (updated), Peter=85
    // Total = 650 → Note: Setelah Query 2, Aaron=85 bukan 80
    const result = db.prepare(`
      SELECT SUM(salary) AS total_salary_2021
      FROM employee
      WHERE join_date    <= '2021-12-31'
        AND (release_date IS NULL OR release_date >= '2021-01-01')
    `).get();
    expect(Number(result.total_salary_2021)).toBe(650);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Query 4: TOP 3 Year of Experience terbanyak
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Query 4 — TOP 3 Year of Experience', () => {
  test('mengembalikan tepat 3 karyawan', () => {
    const rows = db.prepare(`
      SELECT name, year_of_exp FROM employee
      ORDER BY year_of_exp DESC
      LIMIT 3
    `).all();
    expect(rows.length).toBe(3);
  });

  test('urutan pertama adalah Alano (14 tahun)', () => {
    const rows = db.prepare(`
      SELECT name, year_of_exp FROM employee
      ORDER BY year_of_exp DESC LIMIT 3
    `).all();
    expect(rows[0].name).toBe('Alano');
    expect(Number(rows[0].year_of_exp)).toBe(14);
  });

  test('urutan kedua adalah John (12 tahun)', () => {
    const rows = db.prepare(`
      SELECT name, year_of_exp FROM employee
      ORDER BY year_of_exp DESC LIMIT 3
    `).all();
    expect(rows[1].name).toBe('John');
    expect(Number(rows[1].year_of_exp)).toBe(12);
  });

  test('urutan ketiga adalah Jacky (8 tahun)', () => {
    const rows = db.prepare(`
      SELECT name, year_of_exp FROM employee
      ORDER BY year_of_exp DESC LIMIT 3
    `).all();
    expect(rows[2].name).toBe('Jacky');
    expect(Number(rows[2].year_of_exp)).toBe(8);
  });

  test('hasil diurutkan descending (terbesar ke terkecil)', () => {
    const rows = db.prepare(`
      SELECT year_of_exp FROM employee
      ORDER BY year_of_exp DESC LIMIT 3
    `).all().map((r) => Number(r.year_of_exp));

    for (let i = 0; i < rows.length - 1; i++) {
      expect(rows[i]).toBeGreaterThanOrEqual(rows[i + 1]);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Query 5: Subquery — Engineer dengan experience <= 3 tahun
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Query 5 — Subquery Engineer ≤ 3 Tahun', () => {
  test('mengembalikan hasil yang valid (array)', () => {
    const rows = db.prepare(`
      SELECT id, name, position, year_of_exp, salary
      FROM employee
      WHERE id IN (
        SELECT id FROM employee
        WHERE LOWER(position) = 'engineer'
          AND year_of_exp <= 3.0
      )
      ORDER BY year_of_exp ASC
    `).all();
    expect(Array.isArray(rows)).toBe(true);
  });

  test('hanya karyawan dengan posisi Engineer', () => {
    const rows = db.prepare(`
      SELECT id, name, position, year_of_exp, salary
      FROM employee
      WHERE id IN (
        SELECT id FROM employee
        WHERE LOWER(position) = 'engineer' AND year_of_exp <= 3.0
      )
    `).all();
    for (const row of rows) {
      expect(row.position.toLowerCase()).toBe('engineer');
    }
  });

  test('semua hasil memiliki year_of_exp <= 3', () => {
    const rows = db.prepare(`
      SELECT year_of_exp FROM employee
      WHERE id IN (
        SELECT id FROM employee
        WHERE LOWER(position) = 'engineer' AND year_of_exp <= 3.0
      )
    `).all();
    for (const row of rows) {
      expect(Number(row.year_of_exp)).toBeLessThanOrEqual(3);
    }
  });

  test('Aaron (1 tahun) masuk hasil', () => {
    const row = db.prepare(`
      SELECT name FROM employee
      WHERE id IN (
        SELECT id FROM employee
        WHERE LOWER(position) = 'engineer' AND year_of_exp <= 3.0
      ) AND name = 'Aaron'
    `).get();
    expect(row).toBeDefined();
  });

  test('Albert (2.5 tahun) masuk hasil', () => {
    const row = db.prepare(`
      SELECT name FROM employee
      WHERE id IN (
        SELECT id FROM employee
        WHERE LOWER(position) = 'engineer' AND year_of_exp <= 3.0
      ) AND name = 'Albert'
    `).get();
    expect(row).toBeDefined();
  });

  test('Allen (4 tahun) TIDAK masuk hasil', () => {
    const row = db.prepare(`
      SELECT name FROM employee
      WHERE id IN (
        SELECT id FROM employee
        WHERE LOWER(position) = 'engineer' AND year_of_exp <= 3.0
      ) AND name = 'Allen'
    `).get();
    expect(row).toBeUndefined();
  });

  test('hasil diurutkan ascending berdasarkan year_of_exp', () => {
    const rows = db.prepare(`
      SELECT year_of_exp FROM employee
      WHERE id IN (
        SELECT id FROM employee
        WHERE LOWER(position) = 'engineer' AND year_of_exp <= 3.0
      )
      ORDER BY year_of_exp ASC
    `).all().map((r) => Number(r.year_of_exp));

    for (let i = 0; i < rows.length - 1; i++) {
      expect(rows[i]).toBeLessThanOrEqual(rows[i + 1]);
    }
  });
});
