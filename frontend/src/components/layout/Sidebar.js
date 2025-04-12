import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const navLinks = [
    { path: '/dashboard', name: 'Dashboard', icon: '📊' },
    { path: '/medical-records', name: 'Medical Records', icon: '🏥' },
    { path: '/chatbot', name: 'Medical Chatbot', icon: '💬' },
    { path: '/disease-prediction', name: 'Disease Prediction', icon: '🧬' }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3 className="sidebar-title">HEALTH PORTAL</h3>
          <button className="sidebar-close" onClick={closeSidebar} aria-label="Close sidebar">
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="sidebar-content">
          <ul className="nav-list">
            {navLinks.map((link) => (
              <li key={link.path} className="nav-item">
                <NavLink 
                  to={link.path} 
                  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                  onClick={closeSidebar}
                >
                  <span className="material-icons nav-icon">{link.icon}</span>
                  <span className="nav-text">{link.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="sidebar-footer">
          <div className="blockchain-status">
            <span className="status-indicator"></span>
            <span className="status-text">Secure Connection</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;