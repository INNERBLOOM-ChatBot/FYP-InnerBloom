const mysql = require('mysql2/promise');

async function fixDB() {
  const db = mysql.createPool({ host: 'localhost', user: 'root', password: 'root', database: 'innerbloom', port: 3300 });

  try {
    const [rows] = await db.execute("SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA = 'innerbloom' AND TABLE_NAME = 'messages'");
    console.log('FK on messages:', rows);

    // If chats_old is referenced, we drop it and point to chats
    for (const row of rows) {
      if (row.REFERENCED_TABLE_NAME === 'chats_old') {
        console.log('Fixing constraint', row.CONSTRAINT_NAME);
        await db.execute(`ALTER TABLE messages DROP FOREIGN KEY ${row.CONSTRAINT_NAME}`);
        await db.execute(`ALTER TABLE messages ADD CONSTRAINT ${row.CONSTRAINT_NAME} FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE`);
        console.log('Fixed!');
      }
    }
  } catch (e) {
    console.log('Error:', e.message);
  } finally {
    db.end();
  }
}
fixDB();
