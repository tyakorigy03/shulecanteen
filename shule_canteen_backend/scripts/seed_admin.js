console.log('🚀 Seeding Script Started...');
let admin, db;
try {
    const firebase = require('../config/firebase');
    const bcrypt = require('bcryptjs');
    admin = firebase.admin;
    db = firebase.db;
    console.log('✅ Firebase Loaded successfully');
} catch (e) {
    console.error('❌ Failed to load Firebase:', e);
    process.exit(1);
}

const seedAdmin = async () => {
    try {
        console.log('🧹 Purging existing admin users...');
        const snapshot = await db.collection('users').where('role', '==', 'superadmin').get();
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        console.log('🌱 Hashing password and Seeding Superadmin account...');
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('adminpassword', salt);

        const superadmin = {
            uid: 'SUP-ADMIN-01',
            phone: '0780000000',
            password: hashedPassword,
            role: 'superadmin',
            name: 'Shule System Admin',
            email: 'admin@shulecanteen.rw',
            createdAt: new Date().toISOString()
        };

        await db.collection('users').doc(superadmin.uid).set(superadmin);

        console.log('✅ Superadmin seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedAdmin();
