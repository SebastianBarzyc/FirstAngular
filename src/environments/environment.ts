// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCroPyy5M4p7OPB4jfaB1NmLOf7ClBMGFU",
  authDomain: "fitbuddy-cf167.firebaseapp.com",
  projectId: "fitbuddy-cf167",
  storageBucket: "fitbuddy-cf167.firebasestorage.app",
  messagingSenderId: "1078504399107",
  appId: "1:1078504399107:web:73c60b09f914f10748c936",
  measurementId: "G-S1L3KQY9Q8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);