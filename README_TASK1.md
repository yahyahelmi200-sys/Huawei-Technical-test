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
