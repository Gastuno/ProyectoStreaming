// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCW4WpXnQkeGQz1hDheTAC6IzSe-L_LtSI",
  authDomain: "proyectostreaming-da8dc.firebaseapp.com",
  projectId: "proyectostreaming-da8dc",
  storageBucket: "proyectostreaming-da8dc.firebasestorage.app",
  messagingSenderId: "616870592225",
  appId: "1:616870592225:web:6e320c144923624408c1a0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);