import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { signUpUser } from "../authentication"; 

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Reset error message
    try {
      await signUpUser(email, password);
      navigate('/signin');
    } catch (e: any) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', e);
    }
  };

  return (
    <div className="signup-container">
      <div className="navbar">
        <div className="logo">
          <img src="/logo.png" alt="Logo" />
          <span>RoadMap AI</span>
        </div>
        <a href="#" className="nav-link">Home</a>
      </div>
      <div className="signup-content">
        <div className="signup-card">
          <h2>Sign Up</h2>
          <p>Create your account and start<br />mapping your next exciting journey!</p>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <button type="submit">Create Account</button>
          </form>
          <p className="login-link">
            Already have an account? <a href="/signin">Log In</a>
          </p>
        </div>
      </div>
      <img src="/Sdesign.png" alt="Cool background" className="SdesignRight"/>
      <img src="/Sdesign.png" alt="Cool background" className="SdesignLeft"/>
    </div>
  );
};

export default SignUp;