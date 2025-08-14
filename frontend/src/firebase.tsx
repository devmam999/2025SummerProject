// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// Import firebase authentication
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDPW2l6R3d8x4VYTBBWle4HEqXtuzu2Tgg",
  authDomain: "road-trip-planner-2a3d1.firebaseapp.com",
  projectId: "road-trip-planner-2a3d1",
  storageBucket: "road-trip-planner-2a3d1.firebasestorage.app",
  messagingSenderId: "352561575394",
  appId: "1:352561575394:web:aec0c51d0de01859cef5bb",
  measurementId: "G-ERT6LFYRKZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const db = getFirestore(app); // ⬅️ ADD THIS

export { app, analytics, auth, db};