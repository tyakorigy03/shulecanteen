const admin = require('../config/firebase');
const db = admin.firestore();

/**
 * Clean all collections specified in the array
 */
const cleanCollections = async (collections) => {
    console.log('🧹 Cleaning database...');
    for (const collectionName of collections) {
        const snapshot = await db.collection(collectionName).get();
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`   ✅ Cleaned collection: ${collectionName}`);
    }
};

/**
 * Seed data according to database_schema_standard.md
 */
const seedData = async () => {
    try {
        await cleanCollections([
            'students_manifest',
            'inventory',
            'users',
            'canteens',
            'schools',
            'purchase_orders',
            'shipments',
            'sales',
            'cashout_requests'
        ]);

        console.log('🌱 Seeding fresh data...');

        // 1. Seed Schools
        const schoolCode = 'GS-KGL-001';
        await db.collection('schools').doc(schoolCode).set({
            name: 'Groupe Scolaire Kigali',
            location: 'Kigali, Rwanda',
            contactEmail: 'admin@gskigali.rw',
            managerName: 'Jean Damascene',
            createdAt: new Date().toISOString()
        });

        // 2. Seed Canteens
        const canteenId = 'CAN-001';
        await db.collection('canteens').doc(canteenId).set({
            name: 'Central Canteen A',
            schoolCode,
            operatorName: 'Alice Muhanzu',
            phone: '0788112233',
            status: 'active',
            createdAt: new Date().toISOString()
        });

        // 3. Seed Users (JWT Credentials)
        // Note: These should match the credentials used for testing
        const users = [
            {
                uid: 'USER-OP-001',
                phone: '0788112233',
                password: 'password123', // In real prod, this is hashed
                role: 'operator',
                name: 'Alice Muhanzu',
                canteenId,
                schoolCode
            },
            {
                uid: 'USER-DR-001',
                phone: '0788445566',
                password: 'password123',
                role: 'driver',
                name: 'Robert Gakuba',
                provider: 'Inyange'
            },
            {
                uid: 'USER-SUP-001',
                phone: '0788778899',
                password: 'password123',
                role: 'supplier',
                name: 'Inyange Industries Admin',
                supplierName: 'Inyange Industries'
            }
        ];

        for (const user of users) {
            await db.collection('users').doc(user.uid).set(user);
        }

        // 4. Seed Student Manifest (The Balance Source)
        const students = [
            { id: 'STU-001', name: 'Kabera Eric', balance: 5000, schoolCode, qrCode: 'STU-001-KIG' },
            { id: 'STU-002', name: 'Uwase Aline', balance: 12500, schoolCode, qrCode: 'STU-002-KIG' },
            { id: 'STU-003', name: 'Mugisha Kevin', balance: 300, schoolCode, qrCode: 'STU-003-KIG' }
        ];

        for (const student of students) {
            await db.collection('students_manifest').doc(student.id).set(student);
        }

        // 5. Seed Inventory
        const inventory = [
            { id: 'PRD-001', name: 'Samosa (Beef)', category: 'Snacks', price: 500, stock: 45, canteenId },
            { id: 'PRD-002', name: 'Inyange Milk (500ml)', category: 'Drinks', price: 700, stock: 24, canteenId },
            { id: 'PRD-003', name: 'Chapati', category: 'Snacks', price: 300, stock: 15, canteenId },
            { id: 'PRD-004', name: 'Water (Inyange)', category: 'Drinks', price: 400, stock: 60, canteenId }
        ];

        for (const item of inventory) {
            await db.collection('inventory').doc(item.id).set(item);
        }

        // 6. Seed a sample Pending Shipment to test "Mark as Received"
        const orderId = 'ORD-1001';
        await db.collection('purchase_orders').doc(orderId).set({
            id: orderId,
            canteenId,
            supplierName: 'Inyange Industries',
            items: [
                { id: 'PRD-002', name: 'Inyange Milk (500ml)', quantity: 20, price: 600 }
            ],
            total: 12000,
            status: 'shipped',
            createdAt: new Date().toISOString()
        });

        await db.collection('shipments').add({
            driverId: 'USER-DR-001',
            driverName: 'Robert Gakuba',
            supplierName: 'Inyange Industries',
            orderIds: [orderId],
            canteenId,
            status: 'in_transit',
            createdAt: new Date().toISOString()
        });

        console.log('\n✨ Database reset and seeded successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
