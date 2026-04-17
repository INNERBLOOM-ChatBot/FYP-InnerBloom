import bcrypt from 'bcryptjs';
import pool from './db.js';

async function setAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        console.log("Setting password for admin@innerbloom.com...");
        const [res] = await pool.query('UPDATE authentication SET password = ? WHERE email = ?', [hashedPassword, 'admin@innerbloom.com']);
        console.log("Updated rows:", res.affectedRows);
        console.log("Admin credentials: admin@innerbloom.com / admin123");
    } catch (err) {
        console.error(err.message);
    } finally {
        process.exit(0);
    }
}
setAdmin();
