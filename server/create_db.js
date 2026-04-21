import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

/**
 * Script to initialize the InnerBloom database.
 * This reads the schema.sql file and executes it on the configured MySQL server.
 */
async function createDatabase() {
    console.log("-----------------------------------------");
    console.log("🚀 InnerBloom Database Initializer");
    console.log("-----------------------------------------");

    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true // Essential for running full schema.sql dumps
    };

    console.log(`Connecting to MySQL at ${dbConfig.host}:${dbConfig.port} as ${dbConfig.user}...`);

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("✅ Successfully connected to MySQL server.");

        const schemaPath = path.join(__dirname, 'schema.sql');
        if (!fs.existsSync(schemaPath)) {
            console.error(`❌ Error: schema.sql file not found at ${schemaPath}`);
            process.exit(1);
        }

        console.log("📖 Reading schema.sql...");
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log("🛠️  Executing database schema (creating tables and importing data)...");
        console.log("Wait a moment, this might take a few seconds...");

        await connection.query(schemaSql);
        console.log("✅ Database and tables created successfully!");

        // --- FIX: Foreign Key Constraint for messages table ---
        console.log("🛠️  Fixing foreign key constraints for 'messages' table...");
        try {
            await connection.query('SET FOREIGN_KEY_CHECKS = 0');
            
            // Drop the old incorrect constraint if it exists
            const [constraints] = await connection.query(`
                SELECT CONSTRAINT_NAME 
                FROM information_schema.TABLE_CONSTRAINTS 
                WHERE TABLE_SCHEMA = 'innerbloom' 
                AND TABLE_NAME = 'messages' 
                AND CONSTRAINT_NAME = 'messages_ibfk_1'
            `);

            if (constraints.length > 0) {
                await connection.query('ALTER TABLE innerbloom.messages DROP FOREIGN KEY messages_ibfk_1');
                console.log("🗑️  Old constraint 'messages_ibfk_1' dropped.");
            }

            // Ensure we reference the correct 'chats' table
            await connection.query(`
                ALTER TABLE innerbloom.messages 
                ADD CONSTRAINT messages_fk_chats 
                FOREIGN KEY (chat_id) REFERENCES innerbloom.chats (id) 
                ON DELETE CASCADE
            `);
            
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
            console.log("✅ Constraints fixed successfully! 'messages' now references 'chats'.");
        } catch (fixErr) {
            console.warn("⚠️  Warning: Could not patch foreign key constraints:", fixErr.message);
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        }

        // Set a default admin password for convenience
        console.log("🔐 Setting default admin password (admin123)...");
        try {
            const bcrypt = await import('bcryptjs');
            const hashedPassword = await bcrypt.default.hash('admin123', 10);
            
            await connection.query('USE innerbloom');
            await connection.query('UPDATE authentication SET password = ? WHERE email = ?', [hashedPassword, 'admin@innerbloom.com']);
            await connection.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'admin@innerbloom.com']);
            
            console.log("✅ Admin credentials set: admin@innerbloom.com / admin123");
        } catch (bcryptErr) {
            console.warn("⚠️  Could not hash admin password (bcryptjs missing?), skipping admin update.");
        }

        console.log("-----------------------------------------");
        console.log("🎉 DATABASE SETUP COMPLETE!");
        console.log("-----------------------------------------");

    } catch (err) {
        console.error("\n❌ FAILED TO SETUP DATABASE:");
        if (err.code === 'ECONNREFUSED') {
            console.error("   Reason: Could not connect to MySQL. Is it running?");
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error("   Reason: Access denied. Check your DB_USER and DB_PASSWORD in .env file.");
        } else {
            console.error(`   Reason: ${err.message}`);
        }
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

createDatabase();
