const { db } = require('./config/firebase');

const checkSchool = async (code) => {
    try {
        console.log(`Checking school code: ${code}...`);
        const doc = await db.collection('canteen_schools').doc(code).get();
        if (doc.exists) {
            console.log('✅ Found school profile:', JSON.stringify(doc.data(), null, 2));
        } else {
            console.log('❌ School profile NOT found in canteen_schools');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkSchool('04003');
