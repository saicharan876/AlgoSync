import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, logout, getUserId } = useContext(AuthContext); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  
  const id = isAuthenticated && getUserId ? getUserId() : null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/problems">Problems</Link>
          <Link to="/bookmarks">Bookmark</Link>

          {isAuthenticated ? (
            <>
              <Link to={`/user/${id}`}>Profile</Link>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login/Signup</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
