const { db } = require('../config/firebase');

// Helper to generate context-aware IDs (Memorable Numeric Format)
const generateId = (prefix) => {
    const number = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${number}`;
};

const seedOnboarding = async () => {
    try {
        console.log('🚀 Seeding Onboarding Requests...');

        const requests = [
            {
                prefix: 'SUP',
                data: {
                    entityType: 'supplier',
                    companyName: 'FreshVeggies Ltd',
                    fullName: 'Musa John',
                    email: 'musa@freshveggies.com',
                    phone: '0788111222',
                    province: 'Kigali',
                    district: 'Nyarugenge',
                    status: 'active',
                    createdAt: new Date().toISOString()
                }
            },
            {
                prefix: 'SUP',
                data: {
                    entityType: 'supplier',
                    companyName: 'Poultry Direct',
                    fullName: 'Ganza Eric',
                    email: 'eric@poultrydirect.com',
                    phone: '0788222333',
                    province: 'East',
                    district: 'Kayonza',
                    status: 'active',
                    createdAt: new Date().toISOString()
                }
            },
            {
                prefix: 'CAN',
                data: {
                    entityType: 'canteen',
                    schoolName: 'GS Kigali',
                    fullName: 'Habimana Ali',
                    email: 'admin@gskigali.rw',
                    phone: '0788999888',
                    province: 'Kigali',
                    district: 'Gasabo',
                    status: 'pending',
                    createdAt: new Date().toISOString()
                }
            }
        ];

        for (const req of requests) {
            // Check if already exists by email
            const snapshot = await db.collection('onboarding_requests')
                .where('email', '==', req.data.email)
                .get();

            if (snapshot.empty) {
                const id = generateId(req.prefix);
                const finalData = { id, ...req.data };
                await db.collection('onboarding_requests').doc(id).set(finalData);
                console.log(`✅ Seeded: ${req.data.companyName || req.data.schoolName} with ID: ${id}`);
            } else {
                console.log(`ℹ️ Already exists: ${req.data.companyName || req.data.schoolName}`);
            }
        }

        console.log('\n✨ Seeding Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Error:', error.message);
        process.exit(1);
    }
};

seedOnboarding();
