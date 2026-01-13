const sqlite3 = require('sqlite3').verbose();
const path = require('path');


const dbPath = path.resolve(__dirname, 'database.sqlite');


const db = new sqlite3.Database(dbPath, (err) => {
if (err) {
console.error('Error opening database', err);
} else {
console.log('Connected to SQLite database.');
initDb();
}
});


function initDb() {
db.serialize(() => {
db.run(`CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT UNIQUE,
password TEXT
)`);


db.run(`CREATE TABLE IF NOT EXISTS products (
id INTEGER PRIMARY KEY AUTOINCREMENT,
code TEXT,
brand TEXT,
type TEXT,
category TEXT,
price REAL,
cost REAL,
notes TEXT
)`);
});
}


module.exports = db;