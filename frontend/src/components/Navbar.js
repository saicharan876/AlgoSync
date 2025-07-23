import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';
import {BookmarkIcon, HomeIcon,LogInIcon,LogOutIcon,UserIcon,UsersIcon,Wand2, Wand2Icon} from 'lucide-react'

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
          <Link to="/" className='inline'> 
            <HomeIcon /> 
            <span className='fontstyle'>
              Home
            </span> 
          </Link>

          <Link to="/problems" className='inline'>
            <Wand2Icon />
            <span className='fontstyle'>
              Problems
            </span> 
          </Link>
          <Link to="/bookmarks" className='inline'>
            <BookmarkIcon/>
            <span className='fontstyle'>
              Bookmark
            </span> 
          </Link>
          <Link to="/chatroom" className='inline'>
            <UsersIcon/>
            <span className='fontstyle'>
              Chatroom
            </span> 
          </Link>

          {isAuthenticated ? (
            <>
              <Link to={`/user/${id}`} className='inline'>
                <UserIcon/>
                <span className='fontstyle'>
                  Profile
                </span>
              </Link>
              <button onClick={handleLogout} className="logout-button inline">
               <LogOutIcon/>
               <span className='fontstyle'>
                Logout
              </span> 
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className='inline'>
                <LogInIcon/>
                <span className='fontstyle'>
                  Login/SignUp
                </span> 
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
