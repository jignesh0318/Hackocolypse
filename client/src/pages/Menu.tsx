import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReportForm from '../components/ReportForm';
import './Menu.css';

interface MenuProps {
  onLogout: () => void;
}

const Menu = ({ onLogout }: MenuProps) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'User');
  const [userPhone, setUserPhone] = useState(localStorage.getItem('userPhone') || '+91 XXXXX XXXXX');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editPhone, setEditPhone] = useState(userPhone);
  const [profilePicture, setProfilePicture] = useState(localStorage.getItem('profilePicture') || '');
  const [showReportForm, setShowReportForm] = useState(false);

  const handleMenuItemClick = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleEditClick = () => {
    setEditName(userName);
    setEditPhone(userPhone);
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    localStorage.setItem('userName', editName);
    localStorage.setItem('userPhone', editPhone);
    setUserName(editName);
    setUserPhone(editPhone);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(userName);
    setEditPhone(userPhone);
    setIsEditing(false);
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePicture(base64String);
        localStorage.setItem('profilePicture', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Export all user data
  const handleExportData = () => {
    try {
      const userData = {
        profile: {
          name: userName,
          phone: userPhone,
          profilePicture: profilePicture ? 'Yes' : 'No'
        },
        emergencyContacts: {
          contact1: localStorage.getItem('emergencyContact1'),
          phone1: localStorage.getItem('emergencyContact1Phone'),
          contact2: localStorage.getItem('emergencyContact2'),
          phone2: localStorage.getItem('emergencyContact2Phone')
        },
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0'
      };

      // Collect all localStorage data
      const allData: Record<string, unknown> = userData;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !['profilePicture', 'token', 'userId'].includes(key)) {
          allData[key] = localStorage.getItem(key);
        }
      }

      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `safezone_data_export_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    }
  };

  return (
    <div className="menu-page">
      {/* Header */}
      <div className="menu-header">
        <div className="menu-logo">🛡️ SafeZone AI</div>
        <button 
          className="menu-close-btn"
          onClick={() => navigate('/dashboard')}
        >
          ✕
        </button>
      </div>

      {/* User Profile Card */}
      <div className="profile-card">
        <div className="profile-avatar-container">
          {profilePicture ? (
            <img src={profilePicture} alt="Profile" className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar">{userName.charAt(0).toUpperCase()}</div>
          )}
          {isEditing && (
            <label className="change-photo-btn">
              📷
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="file-input-hidden"
              />
            </label>
          )}
        </div>
        <div className="profile-info">
          {isEditing ? (
            <>
              <input
                type="text"
                className="edit-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter name"
              />
              <input
                type="tel"
                className="edit-input"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Enter phone"
              />
            </>
          ) : (
            <>
              <h2>{userName}</h2>
              <p>{userPhone}</p>
            </>
          )}
        </div>
        {isEditing ? (
          <div className="edit-actions">
            <button className="save-btn" onClick={handleSaveProfile}>✓</button>
            <button className="cancel-btn" onClick={handleCancelEdit}>✕</button>
          </div>
        ) : (
          <button className="edit-btn" onClick={handleEditClick}>✏️</button>
        )}
      </div>

      {/* SOS Device Section - Replaced with Report Issue & Export Data */}
      <div className="utilities-section">
        {/* Report Issue Box */}
        <div className="utility-box report-box">
          <div className="utility-header">
            <span className="utility-icon">📝</span>
            <span className="utility-title">Report Issue</span>
          </div>
          <button 
            className="utility-btn"
            onClick={() => setShowReportForm(!showReportForm)}
          >
            {showReportForm ? '✕ Close' : 'Report Now'}
          </button>
        </div>

        {/* Export Data Box */}
        <div className="utility-box export-box">
          <div className="utility-header">
            <span className="utility-icon">📥</span>
            <span className="utility-title">Export Data</span>
          </div>
          <button 
            className="utility-btn"
            onClick={handleExportData}
          >
            Download Data
          </button>
        </div>
      </div>

      {/* Report Form - Shown when toggled */}
      {showReportForm && (
        <div className="report-form-wrapper">
          <ReportForm />
        </div>
      )}

      {/* SOS Device Section */}
      <div className="sos-device-section">
        <div className="section-header">
          <span className="device-icon">📱</span>
          <span>SOS Device</span>
          <span className="info-icon">ℹ️</span>
        </div>
        <div className="device-status">
          <span className="device-icon-alt">📦</span>
          <span>No device</span>
        </div>
        <div className="device-actions">
          <button className="notification-btn">🔔</button>
          <button className="connect-btn">Connect</button>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="menu-grid">
        <button 
          className="menu-tile"
          onClick={() => handleMenuItemClick('/safety-analysis')}
        >
          <span className="menu-icon">🛡️</span>
          <span className="menu-label">Safety Analysis</span>
        </button>

        <button 
          className="menu-tile featured"
          onClick={() => handleMenuItemClick('/police-24x7')}
          title="24/7 Personal Police Mode with live tracking and emergency SOS"
        >
          <span className="menu-icon featured-icon">🚔</span>
          <span className="menu-label">Police Mode 24/7</span>
          <span className="menu-badge">Featured</span>
        </button>

        <button 
          className="menu-tile"
          onClick={() => handleMenuItemClick('/sos-history')}
        >
          <span className="menu-icon">🚨</span>
          <span className="menu-label">SOS History</span>
        </button>

        <button 
          className="menu-tile"
          onClick={() => handleMenuItemClick('/profile')}
        >
          <span className="menu-icon">👤</span>
          <span className="menu-label">Personal Info</span>
        </button>

        <button 
          className="menu-tile"
          onClick={() => handleMenuItemClick('/')}
        >
          <span className="menu-icon">📋</span>
          <span className="menu-label">Legal</span>
        </button>

        <button 
          className="menu-tile"
          onClick={() => handleMenuItemClick('/')}
        >
          <span className="menu-icon">💬</span>
          <span className="menu-label">Feedback</span>
        </button>

        <button 
          className="menu-tile"
          onClick={() => handleMenuItemClick('/')}
        >
          <span className="menu-icon">🆘</span>
          <span className="menu-label">Help</span>
        </button>

        <button 
          className="menu-tile"
          onClick={() => handleMenuItemClick('/')}
        >
          <span className="menu-icon">📞</span>
          <span className="menu-label">Helpline</span>
        </button>

        <button 
          className="menu-tile"
          onClick={() => handleMenuItemClick('/')}
        >
          <span className="menu-icon">⚙️</span>
          <span className="menu-label">Settings</span>
        </button>

        <button 
          className="menu-tile"
          onClick={() => handleMenuItemClick('/')}
        >
          <span className="menu-icon">↗️</span>
          <span className="menu-label">Share App</span>
        </button>

        <button 
          className="menu-tile"
          onClick={() => handleMenuItemClick('/')}
        >
          <span className="menu-icon">❓</span>
          <span className="menu-label">Help Tour</span>
        </button>
      </div>

      {/* Logout Button */}
      <div className="menu-footer">
        <button 
          className="logout-btn"
          onClick={handleLogout}
        >
          <span className="logout-icon">⏻</span>
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default Menu;
