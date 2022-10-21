import {getFirestore} from 'firebase/firestore';
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC__BV5wz7asRJltpBM4f7X3lIziPXVoIE",
  authDomain: "house-marketplace-app-da38d.firebaseapp.com",
  projectId: "house-marketplace-app-da38d",
  storageBucket: "house-marketplace-app-da38d.appspot.com",
  messagingSenderId: "604805031607",
  appId: "1:604805031607:web:82ee484b213f90fa838f32",
  measurementId: "G-EDPN6B5WM9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// exporting getfirestore function as db (database)
export const db = getFirestore();