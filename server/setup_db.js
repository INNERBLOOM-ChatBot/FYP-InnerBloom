import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function setupDatabase() {
    console.log("Connecting to MySQL to setup database...");
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        console.log("Connected successfully. Reading schema.sql...");
        const schemaPath = path.join(process.cwd(), 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log("Executing schema.sql. This may take a moment...");
        await connection.query(schema);

        console.log("✅ Database schema initialized successfully!");
        
        // After DB is created, also update the admin password just like we did manually
        console.log("Setting default configured password for admin@innerbloom.com...");
        try {
            const bcrypt = await import('bcryptjs');
            const hashedPassword = await bcrypt.default.hash('admin123', 10);
            await connection.query('USE innerbloom');
            await connection.query('UPDATE authentication SET password = ? WHERE email = ?', [hashedPassword, 'admin@innerbloom.com']);
            console.log("✅ Admin credentials configured: admin@innerbloom.com / admin123");
        } catch(e) {
            console.log("Could not explicitly set admin password, may already be set.");
        }
        
        await connection.end();
        console.log("🎉 Database Setup Complete!");
        process.exit(0);

    } catch (err) {
        console.error("❌ Failed to setup database. Have you started MySQL?");
        console.error(err.message);
        process.exit(1);
    }
}

setupDatabase();
