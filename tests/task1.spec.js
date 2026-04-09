// =============================================================================
// task1.spec.js — Test API Backend (Task 1)
// Menguji semua endpoint Express server di task1-backend/server.js
// =============================================================================

const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3000';

// Data unik per test run agar tidak konflik dengan data sebelumnya
const RUN_ID = Date.now();
const SAMPLE = {
  nama:   `Test User ${RUN_ID}`,
  email:  `test${RUN_ID}@example.com`,
  posisi: 'Engineer',
  pesan:  'Data dari Playwright test',
};

// ─────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────
test.describe('GET / — Health Check', () => {
  test('mengembalikan status 200 dan daftar endpoint', async ({ request }) => {
    const res = await request.get(`${BASE}/`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.endpoints).toBeDefined();
    expect(body.endpoints).toHaveProperty('POST /api/form');
    expect(body.endpoints).toHaveProperty('GET /api/data');
  });
});

// ─────────────────────────────────────────────
// POST /api/form
// ─────────────────────────────────────────────
test.describe('POST /api/form — Simpan Data', () => {
  test('berhasil menyimpan data valid (201)', async ({ request }) => {
    const res = await request.post(`${BASE}/api/form`, {
      data: SAMPLE,
    });

    expect(res.status()).toBe(201);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toMatch(/berhasil/i);
    expect(body.data).toMatchObject(SAMPLE);
    expect(body.data.id).toBeGreaterThan(0);
    expect(body.data.createdAt).toBeDefined();
  });

  test('menolak data kosong (400)', async ({ request }) => {
    const res = await request.post(`${BASE}/api/form`, {
      data: {},
    });

    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toBeDefined();
  });

  test('field createdAt berformat ISO 8601', async ({ request }) => {
    const res = await request.post(`${BASE}/api/form`, {
      data: { ...SAMPLE, email: `iso${RUN_ID}@test.com` },
    });
    const body = await res.json();

    const date = new Date(body.data.createdAt);
    expect(date.toString()).not.toBe('Invalid Date');
  });

  test('setiap data mendapat id unik yang bertambah', async ({ request }) => {
    const res1 = await request.post(`${BASE}/api/form`, {
      data: { ...SAMPLE, email: `id1${RUN_ID}@test.com` },
    });
    const res2 = await request.post(`${BASE}/api/form`, {
      data: { ...SAMPLE, email: `id2${RUN_ID}@test.com` },
    });

    const body1 = await res1.json();
    const body2 = await res2.json();

    expect(body2.data.id).toBeGreaterThan(body1.data.id);
  });
});

// ─────────────────────────────────────────────
// GET /api/data
// ─────────────────────────────────────────────
test.describe('GET /api/data — Ambil Semua Data', () => {
  test('mengembalikan status 200 dan array data', async ({ request }) => {
    const res = await request.get(`${BASE}/api/data`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(typeof body.total).toBe('number');
  });

  test('field total sesuai panjang array data', async ({ request }) => {
    const res = await request.get(`${BASE}/api/data`);
    const body = await res.json();

    expect(body.total).toBe(body.data.length);
  });

  test('data yang baru disimpan muncul di response', async ({ request }) => {
    const uniqueEmail = `check${RUN_ID}@test.com`;

    await request.post(`${BASE}/api/form`, {
      data: { ...SAMPLE, email: uniqueEmail },
    });

    const res = await request.get(`${BASE}/api/data`);
    const body = await res.json();

    const found = body.data.find((d) => d.email === uniqueEmail);
    expect(found).toBeDefined();
    expect(found.nama).toBe(SAMPLE.nama);
  });
});

// ─────────────────────────────────────────────
// GET /api/data/:id
// ─────────────────────────────────────────────
test.describe('GET /api/data/:id — Ambil Data by ID', () => {
  test('mengembalikan data yang benar berdasarkan ID', async ({ request }) => {
    // Simpan data baru dan ambil ID-nya
    const postRes = await request.post(`${BASE}/api/form`, {
      data: { ...SAMPLE, email: `byid${RUN_ID}@test.com` },
    });
    const { data: saved } = await postRes.json();

    const res = await request.get(`${BASE}/api/data/${saved.id}`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(saved.id);
    expect(body.data.email).toBe(saved.email);
  });

  test('mengembalikan 404 jika ID tidak ditemukan', async ({ request }) => {
    const res = await request.get(`${BASE}/api/data/999999`);
    expect(res.status()).toBe(404);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/tidak ditemukan/i);
  });
});

// ─────────────────────────────────────────────
// DELETE /api/data/:id
// ─────────────────────────────────────────────
test.describe('DELETE /api/data/:id — Hapus Data', () => {
  test('berhasil menghapus data dan mengembalikan data yang dihapus', async ({ request }) => {
    // Simpan data baru
    const postRes = await request.post(`${BASE}/api/form`, {
      data: { ...SAMPLE, email: `del${RUN_ID}@test.com` },
    });
    const { data: saved } = await postRes.json();

    // Hapus
    const delRes = await request.delete(`${BASE}/api/data/${saved.id}`);
    expect(delRes.status()).toBe(200);

    const body = await delRes.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(saved.id);
  });

  test('data tidak lagi tersedia setelah dihapus (404)', async ({ request }) => {
    // Simpan data baru
    const postRes = await request.post(`${BASE}/api/form`, {
      data: { ...SAMPLE, email: `del2${RUN_ID}@test.com` },
    });
    const { data: saved } = await postRes.json();

    // Hapus
    await request.delete(`${BASE}/api/data/${saved.id}`);

    // Coba ambil lagi → harus 404
    const getRes = await request.get(`${BASE}/api/data/${saved.id}`);
    expect(getRes.status()).toBe(404);
  });

  test('mengembalikan 404 jika ID tidak ditemukan', async ({ request }) => {
    const res = await request.delete(`${BASE}/api/data/999999`);
    expect(res.status()).toBe(404);

    const body = await res.json();
    expect(body.success).toBe(false);
  });
});
