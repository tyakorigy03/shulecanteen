// config/legacyDb.js
const mysql = require('mysql2/promise'); // Use promise version

// Create promise pool
const poolPromise = mysql.createPool({
     host: process.env.MYSQL_DATABASE_HOST || 'localhost',
    user: process.env.MYSQL_DATABASE_USER || 'root',
    password: process.env.MYSQL_DATABASE_PASSWORD || '',
    database: process.env.MYSQL_DATABASE_NAME || 'babyeyi',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Keep original pool for backward compatibility if needed
const pool = require('mysql2').createPool({
    host: process.env.MYSQL_DATABASE_HOST || 'localhost',
    user: process.env.MYSQL_DATABASE_USER || 'root',
    password: process.env.MYSQL_DATABASE_PASSWORD || '',
    database: process.env.MYSQL_DATABASE_NAME || 'babyeyi',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = { pool, poolPromise };
