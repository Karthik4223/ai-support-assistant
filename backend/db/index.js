const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

const initializeDb = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create sessions table
      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          title TEXT DEFAULT 'New Conversation',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
      });

      // Create messages table
      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL,
          role TEXT CHECK(role IN ('user','assistant')),
          content TEXT NOT NULL,
          image TEXT, -- Added image column
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES sessions (id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          // Check if image column exists, if not add it
          db.all("PRAGMA table_info(messages)", (err, rows) => {
            if (err) {
              reject(err);
            } else {
              const hasImageColumn = rows.some(row => row.name === 'image');
              if (!hasImageColumn) {
                db.run("ALTER TABLE messages ADD COLUMN image TEXT", (err) => {
                  if (err) reject(err);
                  else resolve();
                });
              } else {
                resolve();
              }
            }
          });
        }
      });
      // Create api_keys table
      db.run(`
        CREATE TABLE IF NOT EXISTS api_keys (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          key TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
};

module.exports = {
  db,
  initializeDb
};
