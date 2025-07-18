// src/pages/SignUp.tsx

import React, { useState, useEffect } from "react"; // Import useEffect
import { useNavigate } from "react-router-dom";
import { signInWithGoogle, signUpUser, auth } from "../authentication"; // Make sure 'auth' is imported

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Add this useEffect to handle redirects if the user is already authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        // If user is already logged in when this component mounts, redirect them
        // This prevents an already logged-in user from seeing the signup page
        // It will *not* interfere with the navigate("/settings") immediately after a fresh signup
        console.log("User already logged in on SignUp page, redirecting to dashboard.");
        navigate("/dashboard", { replace: true });
      }
    });
    return () => unsubscribe(); // Clean up the listener on component unmount
  }, [navigate]); // Dependency array to re-run if navigate function changes (unlikely)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signUpUser(email, password, rememberMe);
      console.log("Signed up Firebase user, navigating to settings...");
      navigate("/settings"); // This will now correctly navigate to settings
    } catch (err: any) {
      setError(err.message || "Sign-up failed. Please try again.");
      console.error("Sign-up error:", err);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      await signInWithGoogle(rememberMe);
      console.log("Google signed in user, navigating to settings...");
      navigate("/settings"); // This will now correctly navigate to settings
    } catch (e: any) {
      const errorMessage = e.message || "Google Sign-in failed. Please try again.";
      setError(errorMessage);
      console.error("Google Sign-in error:", e);
    }
  };

  return (
    <div
      className="min-h-screen bg-[url('/green-waves.png')] bg-center bg-no-repeat bg-cover relative font-sans"
      style={{ backgroundColor: "rgb(253, 253, 251)" }}
    >
      {/* Navbar */}
      <nav className="flex justify-between items-center bg-white py-2 px-5 border-b border-gray-300">
        <div className="flex items-center text-[#049645] font-bold text-2xl">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-[70.92px] h-[49.14px] mr-2"
          />
          RoadMap AI
        </div>
        <a href="#" className="text-black font-medium no-underline hover:underline">
          Home
        </a>
      </nav>

      {/* Content */}
      <div className="flex justify-center items-center py-16 px-5">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-[350px] w-full text-center mt-3%">
          <h2 className="text-4xl font-bold mb-2">Create an Account</h2>
          <p className="text-sm text-gray-600 mb-5">
            Sign up to start mapping your next exciting journey!
          </p>
          {error && <p className="text-red-600 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mb-2 p-2 text-sm border border-gray-300 rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mb-4 p-2 text-sm border border-gray-300 rounded"
            />
            <div className="flex items-center mb-4">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-[#049645] border-gray-300 rounded focus:ring-[#049645]"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            <button
              type="submit"
              className="mt-3 py-2 bg-[#8BC34A] hover:bg-[#7cb342] text-white font-bold rounded transition-colors cursor-pointer"
            >
              Sign Up
            </button>
          </form>

          <div className="my-4 text-sm text-gray-500">
            Or
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="py-2 w-full flex items-center justify-center
              bg-gray-100 hover:bg-gray-200
              text-gray-800
              font-bold rounded transition-colors mb-2
              border border-gray-300
              cursor-pointer"
          >
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
            Sign Up with Google
          </button>

          <p className="text-xs mt-4">
            Already have an account?{" "}
            <a href="/signin" className="text-[#007acc] no-underline hover:underline cursor-pointer">
              Sign In
            </a>
          </p>
        </div>
      </div>

      {/* Background images */}
      <img
        src="/Sdesign.png"
        alt="Cool background right"
        className="hidden md:block absolute right-0 top-0 h-screen object-cover -z-10"
      />
      <img
        src="/Sdesign.png"
        alt="Cool background left"
        className="hidden md:block absolute left-0 top-0 h-screen object-cover -z-10 rotate-180"
      />
    </div>
  );
};

export default SignUp;