import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export const registerUser = async (email, password) => {
    try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCred.user.uid), {
            email: userCred.user.email,
            alarms: []
        });
        console.log("User registered:", userCred.user.uid);
        return userCred.user;
    } catch (error) {
        console.error("Registration error:", error.message);
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        console.log('User logged out');
    } catch (error) {
        console.error('Logout failed:', error.message);
    }
};