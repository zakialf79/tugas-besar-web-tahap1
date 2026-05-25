const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifikasiToken, cekRole } = require('../middlewares/authMiddleware');

// Rute autentikasi utama
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rute area administrator / dashboard statis
router.get('/dashboard-admin', verifikasiToken, cekRole(1), (req, res) => {
  res.json({ pesan: 'Selamat datang di ruang kendali administrator.' });
});

router.get('/dashboard-user', verifikasiToken, cekRole(2), (req, res) => {
  res.json({ pesan: 'Selamat datang di portal informasi mahasiswa.' });
});

// ==========================================
// POSISI MASUKNYA RUTE PERJALANAN DINAS B5
// ==========================================

// Mengambil semua data perjalanan dinas dari database
router.get('/dinas', verifikasiToken, authController.ambilSemuaDinas);

// Pegawai mengirimkan pengajuan dinas baru
router.post('/dinas', verifikasiToken, authController.tambahDinas);

// Pimpinan (Zaki) menyetujui atau menolak permohonan dinas (Khusus Role 1)
router.put('/dinas/:id', verifikasiToken, cekRole(1), authController.ubahStatusDinas);

// Baris ekspor ini wajib berada di paling bawah file!
module.exports = router;