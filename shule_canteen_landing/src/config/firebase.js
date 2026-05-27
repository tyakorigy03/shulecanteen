import { initializeApp } from "@firebase/app";
import { getFirestore } from "@firebase/firestore";

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
const db = getFirestore(app);

export { db };
