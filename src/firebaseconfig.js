// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8psQvGcSOhrD0qwrT4rjNrDkgJ9C5Tj0",
  authDomain: "proye-19771.firebaseapp.com",
  projectId: "proye-19771",
  storageBucket: "proye-19771.firebasestorage.app",
  messagingSenderId: "692423803802",
  appId: "1:692423803802:web:095dcea6e991dcb84d7023"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);