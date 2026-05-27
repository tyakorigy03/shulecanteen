const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        console.log('🚀 Seeding Initial Admin...');

        const adminPhone = '0788000000';
        const adminPassword = 'adminpassword123'; // User should change this after first login

        // Check if admin already exists
        const userSnapshot = await db.collection('users')
            .where('phone', '==', adminPhone)
            .get();

        if (!userSnapshot.empty) {
            console.log('ℹ️ Admin user already exists (Phone: ' + adminPhone + '). Skipping seed.');
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        const adminData = {
            fullName: 'System Administrator',
            phone: adminPhone,
            password: hashedPassword,
            role: 'superadmin',
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        await db.collection('users').add(adminData);

        console.log(`
✅ ADMIN SEEDED SUCCESSFULLY
-------------------------------
Phone: ${adminPhone}
Password: ${adminPassword}
Role: superadmin
-------------------------------
ATTENTION: Please change the password immediately after first login!
        `);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Error:', error.message);
        process.exit(1);
    }
};

seedAdmin();
