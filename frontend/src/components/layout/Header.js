import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ toggleSidebar, user, onLogout }) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/dashboard" className="brand">
            <span className="brand-name">MedChain</span>
          </Link>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <span className="username">{user?.username || 'User'}</span>
            <span className="user-role">{user?.role || 'Guest'}</span>
          </div>
          
          <div className="dropdown">
            <button className="dropdown-toggle" aria-haspopup="true" aria-expanded="false">
              <div className="avatar">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </button>
            <div className="dropdown-menu">
              <Link to="/profile" className="dropdown-item">Profile</Link>
              <Link to="/settings" className="dropdown-item">Settings</Link>
              <div className="dropdown-divider"></div>
              <button onClick={onLogout} className="dropdown-item logout-btn">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;