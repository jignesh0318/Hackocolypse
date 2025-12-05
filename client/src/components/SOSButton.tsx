import { useState, useEffect, useRef } from 'react';
import './SOSButton.css';

interface SOSButtonProps {
  onSOSConfirmed: () => void;
}

const SOSButton = ({ onSOSConfirmed }: SOSButtonProps) => {
  const [isTriggered, setIsTriggered] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create buzzer audio using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

    const startBuzzer = () => {
      oscillator.start();
      // Buzzer pattern: beep every 0.5 seconds
      let isOn = true;
      const buzzerInterval = setInterval(() => {
        gainNode.gain.setValueAtTime(isOn ? 0.3 : 0, audioContext.currentTime);
        isOn = !isOn;
      }, 500);

      return () => {
        clearInterval(buzzerInterval);
        try {
          oscillator.stop();
        } catch (e) {
          // Oscillator already stopped
        }
      };
    };

    if (isTriggered) {
      const stopBuzzer = startBuzzer();

      // Start countdown
      setCountdown(5);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Countdown finished - trigger SOS
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            stopBuzzer();
            onSOSConfirmed();
            setIsTriggered(false);
            return 5;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        stopBuzzer();
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      };
    }
  }, [isTriggered, onSOSConfirmed]);

  const handleSOSClick = () => {
    setIsTriggered(true);
  };

  const handleCancel = () => {
    setIsTriggered(false);
    setCountdown(5);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  };

  return (
    <div className="sos-container">
      {!isTriggered ? (
        <button className="sos-button" onClick={handleSOSClick}>
          <span className="sos-icon">🚨</span>
          <span className="sos-text">Emergency SOS</span>
        </button>
      ) : (
        <div className="sos-active">
          <div className="countdown-circle">
            <svg className="countdown-svg" viewBox="0 0 100 100">
              <circle
                className="countdown-bg"
                cx="50"
                cy="50"
                r="45"
              />
              <circle
                className="countdown-progress"
                cx="50"
                cy="50"
                r="45"
                style={{
                  '--progress': `${(countdown / 5) * 283}px`,
                } as React.CSSProperties & { '--progress': string }}
              />
            </svg>
            <div className="countdown-number">{countdown}</div>
          </div>
          <div className="sos-active-text">
            <h3>🚨 SOS TRIGGERED</h3>
            <p>Alerting emergency contacts in {countdown}s</p>
            <p className="buzzer-text">🔊 Buzzer active</p>
          </div>
          <button className="cancel-button" onClick={handleCancel}>
            CANCEL SOS
          </button>
        </div>
      )}
    </div>
  );
};

export default SOSButton;
