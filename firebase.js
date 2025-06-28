import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAaOec6xFfXBYw1klGxWOQj2zdlKxmfFrQ",
    authDomain: "smoothoperators-d0248.firebaseapp.com",
    projectId: "smoothoperators-d0248",
    storageBucket: "smoothoperators-d0248.firebasestorage.app",
    messagingSenderId: "10991625124",
    appId: "1:10991625124:web:b704b6a4abb2618e2d5731"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore DB
export const db = getFirestore(app);