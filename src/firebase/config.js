// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBJN9gk31-GMYwSpusoI1DxgTBwsJA-wY4",
  authDomain: "masterchillers-b7ebd.firebaseapp.com",
  projectId: "masterchillers-b7ebd",
  storageBucket: "masterchillers-b7ebd.firebasestorage.app",
  messagingSenderId: "94537270362",
  appId: "1:94537270362:web:398e3324000211e14d4463",
  measurementId: "G-329S43XW6D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Add this line to export the db instance
export const db = getFirestore(app);
export const auth = getAuth(app);