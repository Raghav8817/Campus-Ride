const mysql = require('mysql2');

// Ensures environment variables are hooked if db.js is loaded independently
require('dotenv').config({ path: __dirname + '/../.env' }); 

const rawUri = process.env.DATABASE_URL || '';
const cleanUri = rawUri ? rawUri.split('?')[0] : '';

const db = mysql.createPool({
    uri: cleanUri || process.env.DATABASE_URL, 
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;
