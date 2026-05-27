const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');
require('dotenv').config();

const usersToSeed = [
    {
        fullName: 'Test Supplier',
        phone: '0788111111',
        password: 'supplier123',
        role: 'supplier',
        status: 'active'
    },
    {
        fullName: 'Test Driver',
        phone: '0788222222',
        password: 'driver123',
        role: 'driver',
        status: 'active'
    },
    {
        fullName: 'Test Canteen',
        phone: '0788333333',
        password: 'canteen123',
        role: 'canteen',
        status: 'active'
    }
];

const seedUsers = async () => {
    try {
        console.log('🚀 Seeding Test Users...');

        for (const userData of usersToSeed) {
            // Check if user already exists
            const userSnapshot = await db.collection('users')
                .where('phone', '==', userData.phone)
                .get();

            if (!userSnapshot.empty) {
                console.log(`ℹ️ User already exists (Phone: ${userData.phone}). Skipping.`);
                continue;
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            const userToSave = {
                ...userData,
                password: hashedPassword,
                createdAt: new Date().toISOString()
            };

            await db.collection('users').add(userToSave);
            console.log(`✅ Seeded ${userData.role}: ${userData.phone} (${userData.password})`);
        }

        console.log('\n✨ ALL TEST USERS SEEDED SUCCESSFULLY\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Error:', error.message);
        process.exit(1);
    }
};

seedUsers();
