import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface SignInProps {
  setAuthToken: (token: string) => void;
}

const SignIn: React.FC<SignInProps> = ({ setAuthToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://your-backend-api.com/auth/signin', {
        username,
        password
      });
      
      setAuthToken(response.data.token);
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
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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