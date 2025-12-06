import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import './Header.css';

interface HeaderProps {
  onLogout?: () => void;
}

const Header = ({ onLogout }: HeaderProps) => {
  const [notifications, setNotifications] = useState(3);
  const isLoggedIn = !!localStorage.getItem('token');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for new SOS alerts and update notification count
    const checkNewAlerts = () => {
      const sosAlerts = Object.keys(localStorage).filter(key => key.startsWith('sos_alert_'));
      setNotifications(Math.max(3, sosAlerts.length));
    };
    
    checkNewAlerts();
    const interval = setInterval(checkNewAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    onLogout?.();
  };

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
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <div className="notification-bell">
                🔔
                {notifications > 0 && (
                  <span className="notification-badge">{notifications}</span>
                )}
              </div>
              <div className="menu-wrapper" ref={menuRef}>
                <button
                  className={`nav-link menu-trigger ${isMenuOpen ? 'open' : ''}`}
                  onClick={() => navigate('/menu')}
                >
                  ☰ Menu
                </button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;