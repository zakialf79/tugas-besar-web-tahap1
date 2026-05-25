const db = require('./config/db'); // Sesuaikan dengan jalur folder config db lu
const bcrypt = require('bcryptjs');

const seedAkun = async () => {
    try {
        // Hash password secara murni pakai bcryptjs backend lu
        const pwPimpinan = await bcrypt.hash('pimpinan123', 10);
        const pwKaryawan = await bcrypt.hash('karyawan123', 10);

        // Bersihkan data lama jika ada
        db.query("DELETE FROM users WHERE email IN ('zaki@contoh.com', 'vanesa@contoh.com')", () => {
            
            // 1. Suntik Akun Pimpinan (Zaki - Role 1)
            db.query("INSERT INTO users (nama, email, password, role_id) VALUES (?, ?, ?, ?)", 
            ['Zaki Alfurqani', 'zaki@contoh.com', pwPimpinan, 1], (err) => {
                if (err) console.log("Gagal buat akun Zaki:", err.message);
                else console.log("SUKSES: Akun Zaki (Pimpinan) berhasil disuntik!");
            });

            // 2. Suntik Akun Pegawai (Vanesa - Role 2)
            db.query("INSERT INTO users (nama, email, password, role_id) VALUES (?, ?, ?, ?)", 
            ['Vanesa Gociardi', 'vanesa@contoh.com', pwKaryawan, 2], (err) => {
                if (err) console.log("Gagal buat akun Vanesa:", err.message);
                else {
                    console.log("SUKSES: Akun Vanesa (Pegawai) berhasil disuntik!");
                    process.exit(); // Selesai dan matikan skrip
                }
            });
        });

    } catch (error) {
        console.error(error);
    }
};

seedAkun();