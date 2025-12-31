// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Importante para la base de datos

const firebaseConfig = {
  apiKey: "AIzaSyDWR7zF5lgLPnCIq8LS5EZ4HBb9hs77ziY",
  authDomain: "catfeteria-pos.firebaseapp.com",
  projectId: "catfeteria-pos",
  storageBucket: "catfeteria-pos.firebasestorage.app",
  messagingSenderId: "61790343362",
  appId: "1:61790343362:web:f28665618270bf2cceeb5b",
  measurementId: "G-3JS5GQHKPS"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Inicializamos los servicios
export const analytics = getAnalytics(app);
export const db = getFirestore(app); // Exportamos la DB para usarla en App.vue