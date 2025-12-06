import { useState } from 'react';
import Header from '../components/Header';
import VoiceSOS from '../components/VoiceSOS';
import { sendSOSAlert } from '../services/api';
import blackBoxRecorder from '../services/blackBoxRecorder';
import { uploadEvidence, canUploadEvidence } from '../services/evidenceUpload';
import './VoiceSOSPage.css';

interface VoiceSOSPageProps {
  onLogout: () => void;
}

const VoiceSOSPage = ({ onLogout }: VoiceSOSPageProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSOSConfirmed = async () => {
    const profileInfo = localStorage.getItem('profileInfo');

    if (!profileInfo) {
      alert('🚨 SOS TRIGGERED!\n\nPlease complete your safety profile to enable emergency contact notifications.');
      return;
    }

    setIsProcessing(true);

    try {
      const profile = JSON.parse(profileInfo);
      const contacts: Array<{ name: string; phone: string; relation: string }> = [];

      if (profile.emergencyContact1Phone) {
        contacts.push({
          name: profile.emergencyContact1,
          phone: profile.emergencyContact1Phone,
          relation: profile.emergencyContact1Relation
        });
      }

      if (profile.emergencyContact2Phone) {
        contacts.push({
          name: profile.emergencyContact2,
          phone: profile.emergencyContact2Phone,
          relation: profile.emergencyContact2Relation
        });
      }

      const captureEvidence = async (): Promise<string | undefined> => {
        try {
          const clip = await blackBoxRecorder.captureClip(15000);
          if (!clip) return undefined;
          if (!canUploadEvidence()) return undefined;
          const url = await uploadEvidence(clip, 'sos-evidence');
          return url;
        } catch (err) {
          console.error('Evidence capture/upload failed:', err);
          return undefined;
        }
      };

      const sendSms = async (coords?: { latitude: number; longitude: number }) => {
        const locationUrl = coords
          ? `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`
          : undefined;

        try {
          const evidenceUrl = await captureEvidence();

          await sendSOSAlert({
            contacts,
            location: coords ? { ...coords, url: locationUrl } : undefined,
            user: {
              name: profile.fullName,
              phone: profile.primaryPhone,
              bloodGroup: profile.bloodGroup,
              allergies: profile.allergies,
              medications: profile.medications
            },
            reason: 'Voice-activated SOS triggered',
            triggeredAt: new Date().toISOString(),
            evidenceUrl,
          });

          // Save to SOS History
          const sosRecord = {
            id: `sos-${Date.now()}`,
            reason: 'Voice-activated SOS triggered',
            triggeredAt: new Date().toISOString(),
            location: coords ? { ...coords, url: locationUrl } : undefined,
            user: {
              name: profile.fullName,
              phone: profile.primaryPhone,
            },
            contactsNotified: contacts.length,
            status: 'sent' as const,
          };

          const existingHistory = localStorage.getItem('sosHistory');
          const history = existingHistory ? JSON.parse(existingHistory) : [];
          history.unshift(sosRecord);
          localStorage.setItem('sosHistory', JSON.stringify(history));

          alert(`🚨 VOICE SOS ALERT SENT!\n\nEmergency contacts notified:\n${contacts.map(c => `• ${c.name} (${c.relation}): ${c.phone}`).join('\n')}${locationUrl ? `\n\nYour location: ${locationUrl}` : ''}${evidenceUrl ? `\n\nEvidence: ${evidenceUrl}` : ''}\n\nHelp is on the way!`);
        } catch (error) {
          console.error('Failed to send SOS SMS:', error);
          
          // Save failed SOS to history
          const sosRecord = {
            id: `sos-${Date.now()}`,
            reason: 'Voice-activated SOS triggered',
            triggeredAt: new Date().toISOString(),
            location: coords ? { ...coords, url: locationUrl } : undefined,
            user: {
              name: profile.fullName,
              phone: profile.primaryPhone,
            },
            contactsNotified: contacts.length,
            status: 'failed' as const,
          };

          const existingHistory = localStorage.getItem('sosHistory');
          const history = existingHistory ? JSON.parse(existingHistory) : [];
          history.unshift(sosRecord);
          localStorage.setItem('sosHistory', JSON.stringify(history));

          alert('Voice SOS triggered, but SMS sending failed. Please call your contacts directly.');
        } finally {
          setIsProcessing(false);
        }
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          sendSms({ latitude, longitude });
        }, (error) => {
          console.error('Error getting location:', error);
          alert('Unable to fetch location. Voice SOS sent without location.');
          sendSms();
        });
      } else {
        alert('Geolocation is not supported by your browser. Voice SOS sent without location.');
        sendSms();
      }
    } catch (error) {
      console.error('Error parsing profile:', error);
      alert('🚨 VOICE SOS TRIGGERED!\n\nPlease complete your safety profile to enable emergency contact notifications.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="voice-sos-page">
      <Header onLogout={onLogout} />
      
      <div className="voice-sos-container">
        <div className="voice-sos-header">
          <h1>🎤 Voice-Activated SOS</h1>
          <p>Activate emergency alert using voice commands</p>
        </div>

        <div className="voice-sos-main">
          <VoiceSOS onSOSTriggered={handleSOSConfirmed} />
        </div>

        <div className="voice-commands-info">
          <h3>📋 Supported Voice Commands</h3>
          <div className="commands-grid">
            <div className="command-card">
              <span className="command-icon">🆘</span>
              <div className="command-info">
                <strong>Help Me</strong>
                <p>Trigger SOS by saying "help me"</p>
              </div>
            </div>
            <div className="command-card">
              <span className="command-icon">🚨</span>
              <div className="command-info">
                <strong>Emergency</strong>
                <p>Trigger SOS by saying "emergency"</p>
              </div>
            </div>
            <div className="command-card">
              <span className="command-icon">🔴</span>
              <div className="command-info">
                <strong>Code Red</strong>
                <p>Trigger SOS by saying "code red"</p>
              </div>
            </div>
          </div>
        </div>

        {isProcessing && (
          <div className="processing-overlay">
            <div className="processing-spinner">
              <div className="spinner"></div>
              <p>Processing emergency alert...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceSOSPage;
