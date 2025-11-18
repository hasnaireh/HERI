import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBmQy2xA1sGLKHW06QrtU_YAC68nkV7pLA",
    authDomain: "portfolio-c2e48.firebaseapp.com",
    projectId: "portfolio-c2e48",
    storageBucket: "portfolio-c2e48.firebasestorage.app",
    messagingSenderId: "110130536954",
    appId: "1:110130536954:web:528517f2b54006a33443",
    measurementId: "G-433SEYHTQ4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;