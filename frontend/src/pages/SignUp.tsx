import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUpUser, signInWithGoogle } from "../authentication";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signUpUser(email, password);
      navigate("/dashboard");
    } catch (e: any) {
      const errorMessage = e.message || "Registration failed. Please try again.";
      setError(errorMessage);
      console.error("Registration error:", e);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(""); // Clear previous errors
    try {
      await signInWithGoogle();
      navigate("/dashboard"); // Navigate to home or dashboard after successful Google sign-in
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
        <a
          href="#"
          className="text-black font-medium no-underline hover:underline cursor-pointer"
        >
          Home
        </a>
      </nav>

      {/* Content */}
      <div className="flex justify-center items-center py-16 px-5">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-[350px] w-full text-center mt-3%">
          <h2 className="text-4xl font-bold mb-2">Sign Up</h2>
          <p className="text-sm text-gray-600 mb-5">
            Create your account and start
            <br />
            mapping your next exciting journey!
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
            <button
              type="submit"
              className="mt-3 py-2 bg-[#8BC34A] hover:bg-[#7cb342] text-white font-bold rounded transition-colors cursor-pointer"
            >
              Create Account
            </button>
          </form>

          <div className="my-4 text-sm text-gray-500">
            Or
          </div>

          <button
            onClick={handleGoogleSignIn} // This calls the new function
            className="py-2 w-full flex items-center justify-center bg-gray-400 hover:bg-gray-500 text-white font-bold rounded transition-colors mb-2 cursor-pointer"
          >
            {/* You'll need a Google icon! Place 'google-icon.svg' in your public folder */}
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
            Sign Up with Google
          </button>

          <p className="text-xs mt-4">
            Already have an account?{" "}
            <a href="/signin" className="text-[#007acc] no-underline hover:underline">
              Log In
            </a>
          </p>
        </div>
      </div>

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
