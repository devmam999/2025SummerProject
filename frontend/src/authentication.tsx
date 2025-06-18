// Authentication imports
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
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

export const signInUser = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Signed in successfully!
      const user = userCredential.user;
      console.log("User signed in:", user);
      return user; // Return the user or handle success
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error signing in:", errorCode, errorMessage);
      throw error; // Re-throw the error
    }
  };
