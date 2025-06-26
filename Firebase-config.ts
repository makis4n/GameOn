// Import the functions you need from the SDKs you need
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLs_KlGSMEJRMqiB03zZk-rQcvsekHFkc",
  authDomain: "gameon-a4f63.firebaseapp.com",
  projectId: "gameon-a4f63",
  storageBucket: "gameon-a4f63.firebasestorage.app",
  messagingSenderId: "498717298627",
  appId: "1:498717298627:web:cf39b073f584cda4eb3776",
  measurementId: "G-T8H1GFX87Z",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
export const cleanupFirestoreListeners = () => {
  const firestoreInstance = getFirestore();
  (firestoreInstance as any)._listeners = {};
};
