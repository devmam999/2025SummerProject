// authentication.ts

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword, // <--- Import this
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type UserCredential // Ensure 'type' is here if verbatimModuleSyntax is on
} from "firebase/auth";
import { app } from "./firebase"; // Assuming you have firebaseConfig.ts exporting 'app'

const auth = getAuth(app); // Get the auth instance

// Function to sign in with email and password
export const signInUser = async (email: string, password: string, rememberMe: boolean): Promise<UserCredential> => {
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential;
};

// Function to sign in with Google
export const signInWithGoogle = async (rememberMe: boolean): Promise<UserCredential> => {
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  return userCredential;
};

// --- ADD THIS NEW FUNCTION ---
// Function to sign up with email and password
export const signUpUser = async (email: string, password: string, rememberMe: boolean): Promise<UserCredential> => {
  // Set persistence immediately after successful signup if "remember me" is checked
  // This ensures the session is saved right away
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential;
};
// --- END NEW FUNCTION ---

// You might also want a signOut function
export const signOutUser = async () => {
  await auth.signOut();
};

// Export the auth instance for use with onAuthStateChanged listener
export { auth };