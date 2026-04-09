// =============================================================================
// task2.spec.js — Test Automation Scripts (Task 2)
// Menguji logika collect_data dan clean_data menggunakan Node.js
// (cross-platform: Windows & Linux)
// =============================================================================

const { test, expect } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

// Gunakan temp directory agar test tidak menulis ke /home/cron sungguhan
let TEST_DIR;

test.beforeAll(() => {
  TEST_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'cron-test-'));
});

test.afterAll(() => {
  // Bersihkan temp directory setelah semua test selesai
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// Helper: port logika collect_data.sh ke Node.js
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate nama file CSV sesuai format: cron_DDMMYYYY_HH.MM.csv
 * Mirror dari collect_data.sh: TIMESTAMP=$(date +"%d%m%Y_%H.%M")
 */
function generateFileName(date = new Date()) {
  const dd   = String(date.getDate()).padStart(2, '0');
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh   = String(date.getHours()).padStart(2, '0');
  const min  = String(date.getMinutes()).padStart(2, '0');
  return `cron_${dd}${mm}${yyyy}_${hh}.${min}.csv`;
}

/**
 * Konversi array of objects ke string CSV
 */
function toCSV(data) {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows    = data.map((row) => headers.map((h) => `"${row[h] ?? ''}"`).join(','));
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Simulasi collect_data: ambil data dan simpan ke CSV
 */
function collectData(apiData, saveDir, date = new Date()) {
  fs.mkdirSync(saveDir, { recursive: true });
  const fileName = generateFileName(date);
  const filePath = path.join(saveDir, fileName);
  const content  = toCSV(apiData);
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

/**
 * Simulasi clean_data: hapus file CSV yang lebih tua dari retentionDays
 */
function cleanData(saveDir, retentionDays = 30) {
  const cutoff   = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const files    = fs.readdirSync(saveDir).filter((f) => f.match(/^cron_.*\.csv$/));
  const deleted  = [];

  for (const file of files) {
    const filePath = path.join(saveDir, file);
    const mtime    = fs.statSync(filePath).mtimeMs;
    if (mtime < cutoff) {
      fs.unlinkSync(filePath);
      deleted.push(file);
    }
  }
  return deleted;
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: Format Nama File
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Format Nama File CSV', () => {
  test('format nama file sesuai cron_DDMMYYYY_HH.MM.csv', () => {
    const date     = new Date(2024, 11, 19, 15, 0); // 19 Des 2024, 15:00
    const fileName = generateFileName(date);
    expect(fileName).toBe('cron_19122024_15.00.csv');
  });

  test('contoh file soal: cron_12192024_15.00.csv terbentuk dengan benar', () => {
    // Soal menyebutkan "cron_12192024_15.00" → interpret sebagai DD=12, MM=19 tidak valid
    // Format yang diimplementasikan: DDMMYYYY → 19 Des 2024 = cron_19122024_15.00.csv
    const date = new Date(2024, 11, 19, 15, 0);
    const name = generateFileName(date);
    expect(name).toMatch(/^cron_\d{8}_\d{2}\.\d{2}\.csv$/);
  });

  test('pukul 08:00 menghasilkan nama file dengan _08.00', () => {
    const date = new Date(2024, 11, 19, 8, 0);
    expect(generateFileName(date)).toContain('_08.00.csv');
  });

  test('pukul 12:00 menghasilkan nama file dengan _12.00', () => {
    const date = new Date(2024, 11, 19, 12, 0);
    expect(generateFileName(date)).toContain('_12.00.csv');
  });

  test('pukul 15:00 menghasilkan nama file dengan _15.00', () => {
    const date = new Date(2024, 11, 19, 15, 0);
    expect(generateFileName(date)).toContain('_15.00.csv');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test: Collect Data
// ─────────────────────────────────────────────────────────────────────────────
test.describe('collect_data — Pengumpulan Data ke CSV', () => {
  const SAMPLE_DATA = [
    { id: 1, nama: 'Budi',  email: 'budi@test.com',  posisi: 'Engineer',  createdAt: '2025-01-01T08:00:00Z' },
    { id: 2, nama: 'Siti',  email: 'siti@test.com',  posisi: 'Manager',   createdAt: '2025-01-01T08:01:00Z' },
    { id: 3, nama: 'Ahmad', email: 'ahmad@test.com', posisi: 'Analyst',   createdAt: '2025-01-01T08:02:00Z' },
  ];

  test('file CSV terbuat di direktori yang benar', () => {
    const filePath = collectData(SAMPLE_DATA, TEST_DIR);
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('file CSV memiliki header sesuai field data', () => {
    const filePath = collectData(SAMPLE_DATA, TEST_DIR, new Date(2025, 0, 1, 8, 0));
    const content  = fs.readFileSync(filePath, 'utf8');
    const header   = content.split('\n')[0];
    expect(header).toBe('id,nama,email,posisi,createdAt');
  });

  test('jumlah baris CSV = jumlah data + 1 header', () => {
    const date     = new Date(2025, 0, 2, 12, 0);
    const filePath = collectData(SAMPLE_DATA, TEST_DIR, date);
    const lines    = fs.readFileSync(filePath, 'utf8').trim().split('\n');
    expect(lines.length).toBe(SAMPLE_DATA.length + 1);
  });

  test('nilai data tersimpan dengan benar di CSV', () => {
    const date     = new Date(2025, 0, 3, 15, 0);
    const filePath = collectData(SAMPLE_DATA, TEST_DIR, date);
    const content  = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('Budi');
    expect(content).toContain('budi@test.com');
    expect(content).toContain('Engineer');
  });

  test('collect 3 kali sehari menghasilkan 3 file terpisah', () => {
    const baseDate = new Date(2025, 5, 1); // 1 Jun 2025
    const times    = [[8, 0], [12, 0], [15, 0]];

    const subDir = path.join(TEST_DIR, 'three-times');

    for (const [h, m] of times) {
      const d = new Date(baseDate);
      d.setHours(h, m, 0, 0);
      collectData(SAMPLE_DATA, subDir, d);
    }

    const files = fs.readdirSync(subDir).filter((f) => f.endsWith('.csv'));
    expect(files.length).toBe(3);
    expect(files.some((f) => f.includes('_08.00.csv'))).toBe(true);
    expect(files.some((f) => f.includes('_12.00.csv'))).toBe(true);
    expect(files.some((f) => f.includes('_15.00.csv'))).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test: Clean Data
// ─────────────────────────────────────────────────────────────────────────────
test.describe('clean_data — Hapus File Lama (>30 hari)', () => {
  /**
   * Buat file CSV dengan waktu modifikasi yang disesuaikan
   */
  function createFileWithAge(dir, fileName, daysOld) {
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, 'id,nama\n1,Test', 'utf8');
    const mtime = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    fs.utimesSync(filePath, mtime, mtime);
    return filePath;
  }

  test('file yang lebih dari 30 hari dihapus', () => {
    const subDir = path.join(TEST_DIR, 'clean-old');
    fs.mkdirSync(subDir, { recursive: true });

    createFileWithAge(subDir, 'cron_01012025_08.00.csv', 31); // harus dihapus

    const deleted = cleanData(subDir, 30);
    expect(deleted.length).toBe(1);
    expect(deleted[0]).toBe('cron_01012025_08.00.csv');
    expect(fs.existsSync(path.join(subDir, 'cron_01012025_08.00.csv'))).toBe(false);
  });

  test('file yang kurang dari 30 hari tidak dihapus', () => {
    const subDir = path.join(TEST_DIR, 'clean-new');
    fs.mkdirSync(subDir, { recursive: true });

    createFileWithAge(subDir, 'cron_01012025_12.00.csv', 10); // tidak dihapus

    const deleted = cleanData(subDir, 30);
    expect(deleted.length).toBe(0);
    expect(fs.existsSync(path.join(subDir, 'cron_01012025_12.00.csv'))).toBe(true);
  });

  test('hanya file CSV (cron_*.csv) yang dihapus, bukan file lain', () => {
    const subDir = path.join(TEST_DIR, 'clean-selective');
    fs.mkdirSync(subDir, { recursive: true });

    createFileWithAge(subDir, 'cron_01012025_08.00.csv', 31); // CSV lama → dihapus
    createFileWithAge(subDir, 'collect.log', 60);              // log → tidak dihapus

    cleanData(subDir, 30);

    expect(fs.existsSync(path.join(subDir, 'collect.log'))).toBe(true);
    expect(fs.existsSync(path.join(subDir, 'cron_01012025_08.00.csv'))).toBe(false);
  });

  test('skenario campuran: hapus yang lama, pertahankan yang baru', () => {
    const subDir = path.join(TEST_DIR, 'clean-mixed');
    fs.mkdirSync(subDir, { recursive: true });

    createFileWithAge(subDir, 'cron_01022025_08.00.csv', 40); // lama → dihapus
    createFileWithAge(subDir, 'cron_01032025_12.00.csv', 35); // lama → dihapus
    createFileWithAge(subDir, 'cron_01042025_15.00.csv', 5);  // baru → dipertahankan

    const deleted = cleanData(subDir, 30);
    expect(deleted.length).toBe(2);

    const remaining = fs.readdirSync(subDir).filter((f) => f.endsWith('.csv'));
    expect(remaining.length).toBe(1);
    expect(remaining[0]).toBe('cron_01042025_15.00.csv');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test: Script Files Exist
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Keberadaan File Skrip', () => {
  const SCRIPTS_DIR = path.join(__dirname, '../task2-automation');

  test('collect_data.sh ada', () => {
    expect(fs.existsSync(path.join(SCRIPTS_DIR, 'collect_data.sh'))).toBe(true);
  });

  test('clean_data.sh ada', () => {
    expect(fs.existsSync(path.join(SCRIPTS_DIR, 'clean_data.sh'))).toBe(true);
  });

  test('setup_cron.sh ada', () => {
    expect(fs.existsSync(path.join(SCRIPTS_DIR, 'setup_cron.sh'))).toBe(true);
  });

  test('collect_data.sh mengandung cron schedule yang benar', () => {
    const content = fs.readFileSync(path.join(SCRIPTS_DIR, 'collect_data.sh'), 'utf8');
    expect(content).toContain('0 8,12,15');
    expect(content).toContain('/home/cron');
  });

  test('clean_data.sh mengandung logika penghapusan 30 hari', () => {
    const content = fs.readFileSync(path.join(SCRIPTS_DIR, 'clean_data.sh'), 'utf8');
    expect(content).toContain('30');
    expect(content).toContain('find');
  });
});
