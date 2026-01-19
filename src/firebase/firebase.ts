// firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA_PTICpE5_EuBGP4RTeyjO2iTBwqkMSrg",
  authDomain: "nexora-d239b.firebaseapp.com",
  projectId: "nexora-d239b",
  storageBucket: "nexora-d239b.appspot.com", // ⚠ Corregido
  messagingSenderId: "923075228284",
  appId: "1:923075228284:web:664ed617bd04eb530d8ff9",
  measurementId: "G-TDTMN9ZZ2V"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar Firestore y Auth
export const db = getFirestore(app);
export const auth = getAuth(app);
