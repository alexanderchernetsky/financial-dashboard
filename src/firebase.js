import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBZrbNeLOW838LHqSzvCftgyt9OtKbeuKo",
    authDomain: "cryptotracker-edcb2.firebaseapp.com",
    projectId: "cryptotracker-edcb2",
    storageBucket: "cryptotracker-edcb2.firebasestorage.app",
    messagingSenderId: "154402800443",
    appId: "1:154402800443:web:d51d6162e3469a578c6d1e",
    measurementId: "G-4CG61CWG69"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
