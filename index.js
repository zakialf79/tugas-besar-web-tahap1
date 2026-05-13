const express = require('express');
const mysql = require('mysql2'); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

const app = express();
const port = 3000;
const KUNCI_RAHASIA = 'kunci_rahasia_pongo_123'; 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_tugas_auth'
});

db.connect((err) => {
  if (err) console.error('Gagal nyambung:', err);
  else console.log('Uhuuu! Berhasil nyambung ke MySQL XAMPP!');
});

// ==========================================
// MIDDLEWARE ACL (SATPAM PENJAGA PINTU)
// ==========================================

// 1. Satpam Pengecek Tiket
const verifikasiToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Bentuk token nanti "Bearer eyJhbG...", jadi kita ambil kata keduanya saja
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ pesan: 'Akses ditolak! Tiketnya mana?' });

  jwt.verify(token, KUNCI_RAHASIA, (err, decoded) => {
    if (err) return res.status(403).json({ pesan: 'Tiket tidak valid atau kadaluwarsa!' });
    req.user = decoded; // Simpan data user ke dalam request
    next(); // Silakan masuk!
  });
};

// 2. Satpam Pengecek Jabatan (Role)
const cekRole = (roleYangDiizinkan) => {
  return (req, res, next) => {
    // Ingat, waktu register kita kasih role_id = 1 (Admin)
    if (req.user.role_id === roleYangDiizinkan) {
      next(); // Jabatan sesuai, silakan lewat!
    } else {
      res.status(403).json({ pesan: 'Akses ditolak! Kamu bukan Admin!' });
    }
  };
};

// ==========================================
// RUTE-RUTE KITA
// ==========================================

app.post('/register', async (req, res) => {
  try {
    const { nama, email, password, role_id } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = 'INSERT INTO users (nama, email, password, role_id) VALUES (?, ?, ?, ?)';
    db.query(sql, [nama, email, hashedPassword, role_id], (err, result) => {
      if (err) return res.status(500).json({ pesan: 'Gagal mendaftar', error: err.message });
      res.status(201).json({ pesan: 'Uhuuu! User berhasil didaftarkan!' });
    });
  } catch (error) {
    res.status(500).json({ pesan: 'Terjadi kesalahan sistem' });
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';
  
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ pesan: 'Error database' });
    if (results.length === 0) return res.status(401).json({ pesan: 'Email tidak ditemukan!' });

    const user = results[0]; 
    const passwordCocok = await bcrypt.compare(password, user.password);
    
    if (!passwordCocok) return res.status(401).json({ pesan: 'Password salah!' });

    const token = jwt.sign({ id: user.id, role_id: user.role_id }, KUNCI_RAHASIA, { expiresIn: '1h' });
    res.json({ pesan: 'Berhasil Login!', tiket_token: token });
  });
});

// --- RUTE RAHASIA (TES ACL) ---
// Rute ini dipasangkan Satpam verifikasiToken DAN cekRole(1)
app.get('/dashboard-admin', verifikasiToken, cekRole(1), (req, res) => {
  res.json({ pesan: 'Selamat datang, Paduka Admin! Ini ruang rahasia.' });
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});