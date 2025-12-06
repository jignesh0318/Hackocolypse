import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateBubble.css';

interface CreateBubbleProps {
  onLogout: () => void;
}

const CreateBubble: React.FC<CreateBubbleProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [bubbleName, setBubbleName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🚗');
  const [selectedColor, setSelectedColor] = useState('#C8F4C8');
  const [bubbleType, setBubbleType] = useState<'permanent' | 'temporary'>('permanent');
  const [inviteLink, setInviteLink] = useState('');

  const icons = ['🏠', '👥', '👨‍👩‍👧‍👦', '🚗'];
  const colors = [
    '#C8B6FF',
    '#A3E4F5',
    '#C8F4C8',
    '#FFF4C8',
    '#FFD4C8',
    '#FFB3D9',
  ];

  const handleCreate = async () => {
    if (!bubbleName.trim()) {
      alert('Please enter a bubble name');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bubbles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: bubbleName,
          icon: selectedIcon,
          color: selectedColor,
          type: bubbleType,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`Failed to create bubble: ${response.status}`);
      }

      const data = await response.json();
      
      // Generate invite link with the actual invite code
      const link = `${window.location.origin}/join/${data.bubble.inviteCode}`;
      setInviteLink(link);
      
      // Move to step 2
      setStep(2);
    } catch (error) {
      console.error('Error creating bubble:', error);
      alert(`Failed to create bubble. Please try again. ${error instanceof Error ? error.message : ''}`);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my SafeZone Bubble',
          text: `Join my ${bubbleName} bubble on SafeZone!`,
          url: inviteLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDone = () => {
    // Save bubble data (you can implement API call here)
    navigate('/dashboard');
  };

  return (
    <div className="create-bubble-page">
      {/* Header */}
      <div className="create-bubble-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')} title="Go back to dashboard">
          ←
        </button>
        <div className="header-content">
          <h1>Create New Bubble</h1>
          <p>Create a Bubble to stay connected.</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        <div className="step-circle">
          <svg className="progress-ring" width="80" height="80">
            <circle
              className="progress-ring-bg"
              cx="40"
              cy="40"
              r="35"
            />
            <circle
              className={`progress-ring-progress ${step === 1 ? 'step-1' : 'step-2'}`}
              cx="40"
              cy="40"
              r="35"
            />
          </svg>
          <div className="step-number">{step}</div>
        </div>
        <div className="step-info">
          <h3>Step {step}</h3>
          <p>{step === 1 ? 'Creating Bubble' : 'Adding friends'}</p>
        </div>
        {step === 1 && (
          <div className="next-hint">Add friends next</div>
        )}
      </div>

      {/* Step 1: Create Bubble */}
      {step === 1 && (
        <div className="bubble-form">
          {/* Icon and Color Selection */}
          <div className="selection-section">
            <div className="icon-preview">
              <div
                className="selected-icon"
                style={{ backgroundColor: selectedColor }}
              >
                <span>{selectedIcon}</span>
              </div>
            </div>

            {/* Icon Options */}
            <div className="icon-options">
              {icons.map((icon) => (
                  <button
                    key={icon}
                    className={`icon-option ${selectedIcon === icon ? 'active' : ''}`}
                    onClick={() => setSelectedIcon(icon)}
                    title={`Select ${icon} icon`}
                  >
                    <span>{icon}</span>
                  </button>
                ))}
            </div>

            {/* Color Options */}
            <div className="color-options">
              {colors.map((color) => (
                  <button
                    key={color}
                    className={`color-option ${selectedColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    title={`Select color ${color}`}
                  />
                ))}
            </div>
          </div>

          {/* Bubble Name */}
          <div className="form-group">
            <label>Bubble name</label>
            <input
              type="text"
              placeholder="e.g., My Family Bubble"
              value={bubbleName}
              onChange={(e) => setBubbleName(e.target.value)}
              maxLength={20}
            />
            <div className="char-count">{bubbleName.length}/20</div>
          </div>

          {/* Bubble Type */}
          <div className="form-group">
            <div className="type-header">
              <label>Select Bubble type</label>
              <button className="info-icon" title="Learn more about bubble types">ⓘ</button>
            </div>
            <div className="bubble-type-options">
              <label className="type-option">
                <input
                  type="radio"
                  name="bubbleType"
                  value="permanent"
                  checked={bubbleType === 'permanent'}
                  onChange={() => setBubbleType('permanent')}
                />
                <span className="radio-label">Permanent</span>
              </label>
              <label className="type-option">
                <input
                  type="radio"
                  name="bubbleType"
                  value="temporary"
                  checked={bubbleType === 'temporary'}
                  onChange={() => setBubbleType('temporary')}
                />
                <span className="radio-label">Temporary</span>
              </label>
            </div>
          </div>

          {/* Create Button */}
          <button className="create-btn" onClick={handleCreate}>
            Create
          </button>
        </div>
      )}

      {/* Step 2: Invite Friends */}
      {step === 2 && (
        <div className="invite-section">
          <div className="invite-card">
            <h3>Invite Link</h3>
            <p>Share this link with friends to invite them to your bubble.</p>
            <div className="invite-actions">
              <button className="copy-btn" onClick={handleCopyLink} title="Copy link">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
              <button className="share-btn" onClick={handleShare} title="Share">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Done Button */}
          <button className="done-btn" onClick={handleDone}>
            Done
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateBubble;
