import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCWzNYkEglKb8IWkYUDJOiEX2h26EnlRck",
    authDomain: "sunrise-app-61717.firebaseapp.com",
    projectId: "sunrise-app-61717",
    storageBucket: "sunrise-app-61717.firebasestorage.app",
    messagingSenderId: "861178102797",
    appId: "1:861178102797:web:433c4a9712435dfac14144",
    measurementId: "G-ETZ9JBWY23"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
