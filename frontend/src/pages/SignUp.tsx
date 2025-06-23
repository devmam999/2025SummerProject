import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUpUser } from "../authentication";

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
      navigate("/signin");
    } catch (e: any) {
      setError("Registration failed. Please try again.");
      console.error("Registration error:", e);
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
          className="text-black font-medium no-underline hover:underline"
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
              className="mt-3 py-2 bg-[#8BC34A] hover:bg-[#7cb342] text-white font-bold rounded transition-colors"
            >
              Create Account
            </button>
          </form>

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
