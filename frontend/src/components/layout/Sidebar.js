import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  const navLinks = [
    { path: '/dashboard', name: 'Dashboard', icon: '📊' },
    { path: '/medical-records', name: 'Medical Records', icon: '🏥' },
    { path: '/chatbot', name: 'Medical Chatbot', icon: '💬' },
    { path: '/disease-prediction', name: 'Disease Prediction', icon: '🧬' }
  ];

  const toggleMobileSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile toggle button (hamburger) */}
      {isMobile && (
        <button className="sidebar-mobile-toggle" onClick={toggleMobileSidebar} aria-label="Toggle sidebar">
          <span className="material-icons">{isOpen ? 'close' : 'menu'}</span>
        </button>
      )}

      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div className="sidebar-overlay" onClick={closeMobileSidebar}></div>
      )}
      
      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isMobile ? 'mobile' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!isCollapsed && <h3 className="sidebar-title">HEALTH PORTAL</h3>}
          <div className="sidebar-header-actions">
            {/* Collapse toggle button (visible on desktop) */}
            {!isMobile && (
              <button className="sidebar-collapse-toggle" onClick={toggleCollapse} aria-label="Collapse sidebar">
                <span className="material-icons">
                  {isCollapsed ? 'chevron_right' : 'chevron_left'}
                </span>
              </button>
            )}
            {/* Close button (visible on mobile) */}
            {isMobile && (
              <button className="sidebar-close" onClick={closeMobileSidebar} aria-label="Close sidebar">
                <span className="material-icons">close</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="sidebar-content">
          <ul className="nav-list">
            {navLinks.map((link) => (
              <li key={link.path} className="nav-item">
                <NavLink 
                  to={link.path} 
                  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                  onClick={closeMobileSidebar}
                >
                  <span className="material-icons nav-icon">{link.icon}</span>
                  {!isCollapsed && <span className="nav-text">{link.name}</span>}
                  {isCollapsed && <span className="nav-tooltip">{link.name}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="sidebar-footer">
          {!isCollapsed && (
            <div className="blockchain-status">
              <span className="status-indicator"></span>
              <span className="status-text">Secure Connection</span>
            </div>
          )}
          {isCollapsed && (
            <div className="blockchain-status-collapsed">
              <span className="status-indicator"></span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;