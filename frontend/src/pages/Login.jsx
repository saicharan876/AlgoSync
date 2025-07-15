import './Login.css';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:5000/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        alert(data.error || "Login failed");
        return;
      }

      
      login(data.token);

      
      const decoded = jwtDecode(data.token);
      const userId = decoded.id || decoded._id;

      navigate(`/profile/${userId}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Navbar transparent={true} />
        <div className="background-image-container" />
        
        <div className="form-container">
          <h1>Welcome to Zcoder</h1>
          <form className="login-form" onSubmit={handleSubmit}>
            <input 
              type="text" 
              placeholder="Email" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
            <Link to='/signup' className="signup-button">
              <button type="button">Sign up</button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
