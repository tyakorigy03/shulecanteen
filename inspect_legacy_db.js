const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'C:/Users/HP/Documents/ny/babyeyipro/all_poratl_backend_with_former_react/backend/.env' });

async function inspect() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'babyeyi',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('--- Schools Table ---');
        try {
            const [columns] = await connection.query('DESCRIBE schools');
            console.log(JSON.stringify(columns, null, 2));
        } catch (e) {
            console.log('Schools table error:', e.message);
        }

        console.log('\n--- Checking for Wallet Tables ---');
        const [tables] = await connection.query('SHOW TABLES');
        const walletTables = tables.filter(t => Object.values(t)[0].toLowerCase().includes('wallet'));
        console.log('Wallet Tables found:', JSON.stringify(walletTables, null, 2));

        for (const t of walletTables) {
            const tableName = Object.values(t)[0];
            const [cols] = await connection.query(`DESCRIBE ${tableName}`);
            console.log(`\n--- Schema for ${tableName} ---`);
            console.log(JSON.stringify(cols, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspect();
