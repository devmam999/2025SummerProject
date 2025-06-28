// Authentication imports
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "./firebase";

export const signUpUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Signed up successfully!
    const user = userCredential.user;
    console.log("User signed up:", user);
    return user; // Return the user or handle success
  } catch (error: any) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Error signing up:", errorCode, errorMessage);
    throw error; // Re-throw the error or handle it appropriately in your UI
  }
};

export const signInUser = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      // Set the persistence based on the 'rememberMe' flag
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence); // <--- ADDED LINE

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in:", userCredential.user);
      return userCredential;
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error signing in:", errorCode, errorMessage);
      throw error;
    }
  };

export const signInWithGoogle = async (rememberMe: boolean = false) => { // <--- ADDED rememberMe parameter
  const provider = new GoogleAuthProvider();
  try {
    // Set the persistence based on the 'rememberMe' flag
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence); // <--- ADDED LINE

    const userCredential = await signInWithPopup(auth, provider);
    console.log("Signed in with Google:", userCredential.user);
    return userCredential;
  } catch (error: any) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Error signing in with Google:", errorCode, errorMessage);

    if (errorCode === 'auth/popup-closed-by-user') {
      console.warn('Google sign-in popup was closed by the user.');
    }

    throw error;
  }
};