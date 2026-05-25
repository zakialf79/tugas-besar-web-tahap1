const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_tugas_auth'
});

// Menghubungkan koneksi ke database MySQL
db.connect((err) => {
  if (err) {
    console.error('Koneksi database gagal:', err);
  } else {
    console.log('Database MySQL berhasil terhubung.');
  }
});

module.exports = db;