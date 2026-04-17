import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

async function check() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });
        const [rows] = await connection.query('SHOW DATABASES;');
        console.log("Databases accessible via Node (Port 3306):", rows.map(r => Object.values(r)[0]));
        await connection.end();
    } catch(err) {
        console.error("Connection failed:", err.message);
    }
}
check();
