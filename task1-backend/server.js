const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage
const dataStore = [];

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// POST /api/form - Menerima dan menyimpan data formulir
app.post('/api/form', (req, res) => {
  const formData = req.body;

  if (!formData || Object.keys(formData).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Data formulir tidak boleh kosong.',
    });
  }

  const entry = {
    id: dataStore.length + 1,
    ...formData,
    createdAt: new Date().toISOString(),
  };

  dataStore.push(entry);

  return res.status(201).json({
    success: true,
    message: 'Data berhasil disimpan.',
    data: entry,
  });
});

// GET /api/data - Mengembalikan semua data yang tersimpan
app.get('/api/data', (req, res) => {
  return res.status(200).json({
    success: true,
    total: dataStore.length,
    data: dataStore,
  });
});

// GET /api/data/:id - Mengembalikan data berdasarkan ID
app.get('/api/data/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const entry = dataStore.find((item) => item.id === id);

  if (!entry) {
    return res.status(404).json({
      success: false,
      message: `Data dengan ID ${id} tidak ditemukan.`,
    });
  }

  return res.status(200).json({
    success: true,
    data: entry,
  });
});

// DELETE /api/data/:id - Menghapus data berdasarkan ID
app.delete('/api/data/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = dataStore.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Data dengan ID ${id} tidak ditemukan.`,
    });
  }

  const deleted = dataStore.splice(index, 1)[0];

  return res.status(200).json({
    success: true,
    message: `Data dengan ID ${id} berhasil dihapus.`,
    data: deleted,
  });
});

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server berjalan dengan baik.',
    endpoints: {
      'POST /api/form': 'Simpan data formulir',
      'GET /api/data': 'Ambil semua data',
      'GET /api/data/:id': 'Ambil data berdasarkan ID',
      'DELETE /api/data/:id': 'Hapus data berdasarkan ID',
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

module.exports = app;
