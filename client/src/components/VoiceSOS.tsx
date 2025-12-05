import { useState, useEffect, useRef } from 'react';
import voiceSOSService from '../services/voiceSOS';
import './VoiceSOS.css';

interface VoiceSOSProps {
  onSOSTriggered?: () => void;
  keywords?: string[];
}

const VoiceSOS = ({ onSOSTriggered, keywords = ['help me', 'emergency', 'code red'] }: VoiceSOSProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'error'>('idle');
  const [matchedKeyword, setMatchedKeyword] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [customKeywords, setCustomKeywords] = useState<string[]>(keywords);
  const [newKeyword, setNewKeyword] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [volume, setVolume] = useState(0);
  const micAnimationRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    setIsSupported(voiceSOSService.isSupported());

    // Setup voice SOS event handlers
    voiceSOSService.onStatusChange = (newStatus) => {
      setStatus(newStatus);
      setIsListening(newStatus === 'listening');
    };

    voiceSOSService.onMatch = (keyword) => {
      setMatchedKeyword(keyword);
      console.log('🚨 SOS TRIGGERED BY VOICE:', keyword);
      
      // Show animation
      showMatchAnimation();
      
      // Trigger SOS callback
      setTimeout(() => {
        onSOSTriggered?.();
        resetAfterMatch();
      }, 1000);
    };

    voiceSOSService.onError = (error) => {
      console.error('Voice recognition error:', error);
      setStatus('error');
    };

    // Set initial keywords
    if (keywords.length > 0) {
      voiceSOSService.setKeywords(keywords);
      setCustomKeywords(keywords);
    }

    // Initialize microphone volume monitoring (for visual feedback)
    initMicrophoneMonitoring();

    return () => {
      voiceSOSService.stop();
    };
  }, []);

  const initMicrophoneMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      source.connect(analyser);
      analyserRef.current = analyser;
      audioContextRef.current = audioContext;

      // Monitor volume
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(Math.min(100, (average / 255) * 100));
        if (isListening) {
          requestAnimationFrame(updateVolume);
        }
      };
      updateVolume();
    } catch (error) {
      console.log('Microphone access denied (optional):', error);
    }
  };

  const showMatchAnimation = () => {
    if (micAnimationRef.current) {
      micAnimationRef.current.classList.remove('voice-match-animation');
      void micAnimationRef.current.offsetWidth; // Trigger reflow
      micAnimationRef.current.classList.add('voice-match-animation');
    }
  };

  const resetAfterMatch = () => {
    setTimeout(() => {
      setMatchedKeyword('');
      setTranscript('');
    }, 2000);
  };

  const handleStartListening = () => {
    if (!isSupported) {
      alert('Web Speech API is not supported in your browser. Use Chrome, Edge, or Safari.');
      return;
    }

    voiceSOSService.setKeywords(customKeywords);
    const started = voiceSOSService.start();
    
    if (!started) {
      setStatus('error');
    }
  };

  const handleStopListening = () => {
    voiceSOSService.stop();
    setIsListening(false);
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !customKeywords.includes(newKeyword.trim())) {
      const updated = [...customKeywords, newKeyword.trim().toLowerCase()];
      setCustomKeywords(updated);
      voiceSOSService.setKeywords(updated);
      localStorage.setItem('voiceKeywords', JSON.stringify(updated));
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    const updated = customKeywords.filter(k => k !== keyword);
    setCustomKeywords(updated);
    voiceSOSService.setKeywords(updated);
    localStorage.setItem('voiceKeywords', JSON.stringify(updated));
  };

  const handleLoadSavedKeywords = () => {
    const saved = localStorage.getItem('voiceKeywords');
    if (saved) {
      try {
        const keywords = JSON.parse(saved);
        setCustomKeywords(keywords);
        voiceSOSService.setKeywords(keywords);
      } catch (error) {
        console.error('Failed to load keywords:', error);
      }
    }
  };

  useEffect(() => {
    handleLoadSavedKeywords();
  }, []);

  if (!isSupported) {
    return (
      <div className="voice-sos-container">
        <div className="voice-sos-unavailable">
          <p>⚠️ Web Speech API not supported</p>
          <small>Use Chrome, Edge, or Safari for voice activation</small>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-sos-container">
      <div className="voice-sos-card">
        {/* Header */}
        <div className="voice-sos-header">
          <h3>🎙️ Voice-Activated SOS</h3>
          <button 
            className="settings-btn"
            onClick={() => setShowSettings(!showSettings)}
            title="Configure keywords"
          >
            ⚙️
          </button>
        </div>

        {/* Main Microphone */}
        <div className="voice-sos-main">
          <div 
            ref={micAnimationRef}
            className={`microphone-circle ${isListening ? 'active' : ''} ${matchedKeyword ? 'matched' : ''}`}
            style={{
              '--volume': `${volume}%`
            } as React.CSSProperties & { '--volume': string }}
          >
            <div className="mic-icon">🎤</div>
            {isListening && (
              <>
                <div className="pulse-ring"></div>
                <div className="pulse-ring" style={{ animationDelay: '0.5s' }}></div>
              </>
            )}
          </div>

          {/* Status Text */}
          <div className="status-text">
            {status === 'listening' ? (
              <p className="status-listening">🔴 Listening for voice commands...</p>
            ) : status === 'error' ? (
              <p className="status-error">❌ Error - Microphone access denied</p>
            ) : (
              <p className="status-idle">⭕ Press to activate voice SOS</p>
            )}
            {matchedKeyword && (
              <p className="matched-keyword">✅ Detected: "{matchedKeyword}"</p>
            )}
          </div>

          {/* Recognized Text */}
          {transcript && (
            <div className="transcript-box">
              <small>Recognized: "{transcript}"</small>
            </div>
          )}

          {/* Volume Indicator */}
          {isListening && (
            <div className="volume-meter">
              <div className="volume-bar" style={{ width: `${volume}%` }}></div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="voice-sos-buttons">
            {!isListening ? (
              <button 
                className="btn-start-listening"
                onClick={handleStartListening}
              >
                🎤 Start Listening
              </button>
            ) : (
              <button 
                className="btn-stop-listening"
                onClick={handleStopListening}
              >
                ⏹️ Stop Listening
              </button>
            )}
          </div>

          {/* Keywords Display */}
          <div className="keywords-display">
            <p className="keywords-label">Active Keywords:</p>
            <div className="keywords-list">
              {customKeywords.map((keyword, index) => (
                <span key={index} className="keyword-badge">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="voice-sos-settings">
            <h4>⚙️ Configure Voice Keywords</h4>
            
            <div className="settings-content">
              <p className="settings-info">
                Say any of these phrases to trigger emergency SOS:
              </p>

              {/* Existing Keywords */}
              <div className="existing-keywords">
                <p className="settings-label">Current Keywords:</p>
                <div className="keywords-management">
                  {customKeywords.map((keyword, index) => (
                    <div key={index} className="keyword-item">
                      <span className="keyword-name">"{keyword}"</span>
                      <button
                        className="btn-remove-keyword"
                        onClick={() => handleRemoveKeyword(keyword)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Keyword */}
              <div className="add-keyword-section">
                <p className="settings-label">Add New Keyword:</p>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="e.g., 'help me', 'code red', 'mayday'"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                    className="keyword-input"
                  />
                  <button
                    className="btn-add-keyword"
                    onClick={handleAddKeyword}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="settings-info-box">
                <p>💡 <strong>Tips:</strong></p>
                <ul>
                  <li>Use short, clear phrases</li>
                  <li>Avoid common everyday words</li>
                  <li>Keep 2-3 keywords active</li>
                  <li>Test keywords before emergency</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feature Info */}
      <div className="voice-sos-info">
        <p>
          <strong>🎙️ How it works:</strong> Start listening and say your voice keyword.
          The app will automatically trigger SOS when it detects your keyword.
          Works best in quiet environments.
        </p>
      </div>
    </div>
  );
};

export default VoiceSOS;
