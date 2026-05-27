const admin = require('./config/firebase');
const db = admin.firestore();

async function checkUsers() {
    console.log('--- LATEST USERS ---');
    const snapshot = await db.collection('users').orderBy('createdAt', 'desc').limit(5).get();
    if (snapshot.empty) {
        console.log('No users found.');
        return;
    }
    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id}`);
        console.log(`Name: ${data.fullName}`);
        console.log(`Phone: "${data.phone}"`);
        console.log(`Role: ${data.role}`);
        console.log(`TempPass: ${data.tempPassword}`);
        console.log(`HasPasswordHash: ${!!data.password}`);
        console.log('------------------');
    });
}

checkUsers().catch(console.error);
