// database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, 'database.sqlite'), (err) => {
    if (err) {
        console.error('Failed to connect to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Create the authors table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS authors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

module.exports = db;
