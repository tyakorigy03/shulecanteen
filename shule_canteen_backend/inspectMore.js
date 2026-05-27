const mysql = require('mysql2/promise');

async function inspectMore() {
    const config = {
        host: 'localhost',
        user: 'root',
        password: '',
        port: 3306
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ Connected to MySQL Host');

        // List all databases
        const [dbs] = await connection.query('SHOW DATABASES');
        console.log('\n--- ALL DATABASES ---');
        dbs.forEach(db => console.log(db.Database));

        // Inspect student_card_cache in babyeyi
        await connection.query('USE babyeyi');
        console.log('\n--- INSPECTING student_card_cache ---');
        const [desc] = await connection.query('DESCRIBE student_card_cache');
        console.table(desc);

        const [sample] = await connection.query('SELECT * FROM student_card_cache LIMIT 1');
        console.log('Sample:', JSON.stringify(sample, null, 2));

        await connection.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

inspectMore();
