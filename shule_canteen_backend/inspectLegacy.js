const mysql = require('mysql2/promise');

async function inspectDB() {
    const config = {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'babyeyi',
        port: 3306
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ Connected to Babyeyi DB');

        const [tables] = await connection.query('SHOW TABLES');
        console.log('\n--- ALL TABLES ---');
        tables.forEach(t => console.log(Object.values(t)[0]));

        // Search for pocket money / wallet / shulecard
        const searchTerms = ['wallet', 'pocket', 'card', 'shulecard'];
        console.log('\n--- SEARCHING FOR WALLET/CARD TABLES ---');
        for (const term of searchTerms) {
            const [results] = await connection.query(`SHOW TABLES LIKE '%${term}%'`);
            results.forEach(r => {
                const tableName = Object.values(r)[0];
                console.log(`Potential table found: ${tableName}`);
            });
        }

        // Specifically check for parent_shulecard_wallets if found
        const [finalCheck] = await connection.query("SHOW TABLES LIKE 'parent_shulecard_wallets'");
        if (finalCheck.length > 0) {
            console.log('\n✅ FOUND: parent_shulecard_wallets');
            const [desc] = await connection.query('DESCRIBE parent_shulecard_wallets');
            console.table(desc);

            const [sample] = await connection.query('SELECT * FROM parent_shulecard_wallets LIMIT 1');
            console.log('\nSample Record:', JSON.stringify(sample, null, 2));
        } else {
            console.log('\n❌ Table parent_shulecard_wallets NOT found in babyeyi database.');
        }

        await connection.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

inspectDB();
