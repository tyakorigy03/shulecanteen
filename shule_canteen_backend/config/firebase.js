const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

try {
    const serviceAccountPath = path.join(__dirname,'shulecanteen-firebase-service-key.json');

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath)
    });

    console.log('✅ Firebase Admin Initialized with Service Key');
} catch (error) {
    console.error('❌ Firebase Initialization Error:', error.message);

    // Fallback for development if file is missing (to prevent crash)
    if (process.env.FIREBASE_PROJECT_ID) {
        admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID
        });
        console.log('⚠️ Warning: Initialized in Partial Mode (Service Key missing)');
    }
}

const db = admin.firestore();
module.exports = { admin, db };
