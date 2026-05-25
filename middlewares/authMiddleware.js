const jwt = require('jsonwebtoken');
const KUNCI_RAHASIA = '7b9c1e2d4f5a'; // Kode acak singkat untuk testing

const verifikasiToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ pesan: 'Token tidak ditemukan.' });

  jwt.verify(token, KUNCI_RAHASIA, (err, decoded) => {
    if (err) return res.status(403).json({ pesan: 'Token tidak valid.' });
    req.user = decoded;
    next();
  });
};

const cekRole = (roleYangDiizinkan) => {
  return (req, res, next) => {
    if (req.user.role_id === roleYangDiizinkan) next();
    else res.status(403).json({ pesan: 'Akses ditolak.' });
  };
};

module.exports = { verifikasiToken, cekRole };