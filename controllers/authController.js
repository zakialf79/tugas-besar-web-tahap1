const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const KUNCI_RAHASIA = '7b9c1e2d4f5a';

const register = async (req, res) => {
  try {
    const { nama, email, password, role_id } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = 'INSERT INTO users (nama, email, password, role_id) VALUES (?, ?, ?, ?)';
    db.query(sql, [nama, email, hashedPassword, role_id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ pesan: 'Registrasi sukses.' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

const login = (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';
  
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    if (results.length === 0) return res.status(401).json({ pesan: 'Email salah.' });

    const user = results[0];
    const cocok = await bcrypt.compare(password, user.password);
    if (!cocok) return res.status(401).json({ pesan: 'Password salah.' });

    const token = jwt.sign({ id: user.id, role_id: user.role_id }, KUNCI_RAHASIA, { expiresIn: '1h' });
    res.json({ tiket_token: token, role_id: user.role_id });
  });
};

// Mengambil semua data perjalanan dinas dari database
const ambilSemuaDinas = (req, res) => {
  const sql = 'SELECT * FROM permohonan_dinas';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Gagal mengambil data.' });
    res.json(results);
  });
};

// Pegawai menambahkan permohonan dinas baru
const tambahDinas = (req, res) => {
  const { nama_pegawai, tujuan, tanggal_pergi, estimasi_biaya } = req.body;
  const sql = 'INSERT INTO permohonan_dinas (nama_pegawai, tujuan, tanggal_pergi, estimasi_biaya) VALUES (?, ?, ?, ?)';
  db.query(sql, [nama_pegawai, tujuan, tanggal_pergi, estimasi_biaya], (err) => {
    if (err) return res.status(500).json({ error: 'Gagal menambah pengajuan.' });
    res.status(201).json({ pesan: 'Permohonan dinas berhasil dikirim.' });
  });
};

// Pimpinan (Zaki) menyetujui atau menolak permohonan
const ubahStatusDinas = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const sql = 'UPDATE permohonan_dinas SET status = ? WHERE id = ?';
  db.query(sql, [status, id], (err) => {
    if (err) return res.status(500).json({ error: 'Gagal memperbarui status.' });
    res.json({ pesan: `Permohonan berhasil di-${status.toLowerCase()}.` });
  });
};

module.exports = { register, login, ambilSemuaDinas, tambahDinas, ubahStatusDinas };