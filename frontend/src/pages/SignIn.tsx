import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { signInUser } from "../authentication";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); 
    try {

      const user = await signInUser(email, password); // signInUser returns the Firebase User object

      // If signin is successful, the user object is returned.
      // Firebase SDK manages the session state automatically.
      console.log("Signed in Firebase user:", user);
      navigate('/dashboard'); 
    } catch (err) {
      setError('Invalid credentials');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="signin-container">
      <div className="navbar">
        <div className="logo">
          <img src="/logo.png" alt="Logo" />
          <span>RoadMap AI</span>
        </div>
        <a href="#" className="nav-link">Home</a>
      </div>
      <div className="signin-content">
        <div className="signin-card">
          <h2>Welcome Back</h2>
          <p>Enter your credentials and start<br />mapping your next exciting journey!</p>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <button type="submit">Login</button>
          </form>
          <p className="login-link">
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </div>
      </div>
      <img src="/Sdesign.png" alt="Cool background" className="SdesignRight"/>
      <img src="/Sdesign.png" alt="Cool background" className="SdesignLeft"/>
    </div>
  );
};

export default SignIn;