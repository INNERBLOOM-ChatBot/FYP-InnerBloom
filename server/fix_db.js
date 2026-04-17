import pool from './db.js';

async function fixDB() {
    try {
        console.log("Dropping old foreign key constraint...");
        await pool.query('ALTER TABLE messages DROP FOREIGN KEY messages_ibfk_1;');
        
        console.log("Adding correct foreign key constraint to 'chats' table...");
        await pool.query('ALTER TABLE messages ADD CONSTRAINT messages_ibfk_1 FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE;');
        
        console.log("Database foreign key fixed successfully!");
    } catch (err) {
        console.error("Error fixing database:", err.message);
    } finally {
        process.exit(0);
    }
}
fixDB();
