import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Header.css';

interface HeaderProps {
  onLogout?: () => void;
}

const Header = ({ onLogout }: HeaderProps) => {
  const [notifications] = useState(3);
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <span className="logo-icon">🛡️</span>
          <h1>SafeZone AI</h1>
        </Link>
        <nav className="nav">
          {isLoggedIn && (
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/profile" className="nav-link">Safety Profile</Link>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <div className="notification-bell">
                🔔
                {notifications > 0 && (
                  <span className="notification-badge">{notifications}</span>
                )}
              </div>
              <button 
                className="nav-link btn-logout" 
                onClick={onLogout}
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;