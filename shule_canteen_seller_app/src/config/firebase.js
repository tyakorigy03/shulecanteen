import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDNgkQVnpCIcVqu2d1DxrBu2taqF9bqMbE",
    authDomain: "shulecanteen.firebaseapp.com",
    projectId: "shulecanteen",
    storageBucket: "shulecanteen.firebasestorage.app",
    messagingSenderId: "495105758105",
    appId: "1:495105758105:web:d1c52695c6c1ba37eef908",
    measurementId: "G-8CHBLDZ2ZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        // Enable multiple tab support
        tabManager: persistentMultipleTabManager(),
        // Cache size limit (default is 40 MB)
        cacheSizeBytes: 50 * 1024 * 1024 // 50 MB
    })
});

const auth = getAuth(app);

export { db, auth };