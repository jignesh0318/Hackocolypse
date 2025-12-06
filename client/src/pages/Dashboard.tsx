import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import GoogleMap from '../components/GoogleMap';
import SOSButton from '../components/SOSButton';
import routeTracker from '../services/routeTracker';
import { sendSOSAlert } from '../services/api';
import blackBoxRecorder from '../services/blackBoxRecorder';
import { uploadEvidence, canUploadEvidence } from '../services/evidenceUpload';
import offlineManager from '../services/offlineManager';
import './Dashboard.css';

interface DashboardProps {
    onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
    const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [showSOS, setShowSOS] = useState(false);
    const [bubbles, setBubbles] = useState<Array<{
        id: string;
        name: string;
        icon: string;
        color: string;
        type: string;
    }>>([]);

    // Initialize route tracking when component mounts
    useEffect(() => {
        // Start route tracking
        routeTracker.startTracking();
        setIsTracking(true);

        // Update battery level periodically
        const updateBattery = async () => {
            const level = await routeTracker.getBatteryLevel();
            setBatteryLevel(level);
        };
        
        updateBattery();
        const batteryInterval = setInterval(updateBattery, 30000); // Update every 30 seconds

        // Cleanup on unmount
        return () => {
            clearInterval(batteryInterval);
            // Keep tracking active even when leaving dashboard
            // routeTracker.stopTracking();
        };
    }, []);

    // Fetch user's bubbles
    useEffect(() => {
        const fetchBubbles = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/bubbles', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setBubbles(data.bubbles);
                }
            } catch (error) {
                console.error('Error fetching bubbles:', error);
            }
        };

        fetchBubbles();
    }, []);

    // Compute AI risk score periodically (heuristic)
    useEffect(() => {
        // Moved to dedicated pages; keeping tracking for evidence only
    }, []);

    // Start rolling audio buffer for evidence (audio-only, may stop if tab is backgrounded)
    useEffect(() => {
        blackBoxRecorder.start();
        return () => blackBoxRecorder.stop();
    }, []);

    // Compute AI risk score periodically (heuristic)
    useEffect(() => {
        // Moved to dedicated pages; keeping tracking for evidence only
    }, []);

    const handleSOSConfirmed = async () => {
        const profileInfo = localStorage.getItem('profileInfo');

        if (!profileInfo) {
            alert('🚨 SOS TRIGGERED!\n\nPlease complete your safety profile to enable emergency contact notifications.');
            return;
        }

        try {
            const profile = JSON.parse(profileInfo);
            
            // Cache profile for offline use
            offlineManager.cacheUserProfile(profile);
            
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
                        reason: 'SOS triggered from app',
                        triggeredAt: new Date().toISOString(),
                        evidenceUrl,
                    });

                    // Save to SOS History
                    const sosRecord = {
                        id: `sos-${Date.now()}`,
                        reason: 'SOS triggered from app',
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

                    alert(`🚨 SOS ALERT SENT!\n\nEmergency contacts notified:\n${contacts.map(c => `• ${c.name} (${c.relation}): ${c.phone}`).join('\n')}${locationUrl ? `\n\nYour location: ${locationUrl}` : ''}${evidenceUrl ? `\n\nEvidence: ${evidenceUrl}` : ''}\n\nHelp is on the way!`);
                } catch (error) {
                    console.error('Failed to send SOS SMS:', error);
                    
                    // Save failed SOS to history
                    const sosRecord = {
                        id: `sos-${Date.now()}`,
                        reason: 'SOS triggered from app',
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

                    // If offline, save for later sync
                    if (!navigator.onLine) {
                        await offlineManager.saveForLater('sos', {
                            contacts,
                            location: coords ? { ...coords, url: locationUrl } : undefined,
                            user: {
                                name: profile.fullName,
                                phone: profile.primaryPhone,
                                bloodGroup: profile.bloodGroup,
                                allergies: profile.allergies,
                                medications: profile.medications,
                            },
                            reason: 'SOS triggered from app',
                            triggeredAt: new Date().toISOString(),
                        });
                        alert('📴 OFFLINE MODE:\n\nSOS saved! Will send automatically when connection is restored.\n\nMeanwhile, try calling your emergency contacts directly.');
                    } else {
                        alert('SOS triggered, but SMS sending failed. Please call your contacts directly.');
                    }
                }
            };

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const { latitude, longitude } = position.coords;
                    sendSms({ latitude, longitude });
                }, (error) => {
                    console.error('Error getting location:', error);
                    alert('Unable to fetch location. SOS sent without location.');
                    sendSms();
                });
            } else {
                alert('Geolocation is not supported by your browser. SOS sent without location.');
                sendSms();
            }
        } catch (error) {
            console.error('Error parsing profile:', error);
            alert('🚨 SOS TRIGGERED!\n\nPlease complete your safety profile to enable emergency contact notifications.');
        }
    };

    const navigate = useNavigate();

        const handleFakeCall = () => {
                const fakeCallWindow = window.open('', 'fake-call', 'width=380,height=720');

                if (!fakeCallWindow) {
                        alert('Please allow popups to show the fake call screen.');
                        return;
                }

                fakeCallWindow.document.write(`
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8" />
                            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                            <title>Incoming Call</title>
                            <style>
                                body {
                                    margin: 0;
                                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                    background: linear-gradient(160deg, #0f172a 0%, #111827 45%, #0b1021 100%);
                                    color: #e5e7eb;
                                    height: 100vh;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                }
                                .call-card {
                                    width: 90%;
                                    max-width: 360px;
                                    background: rgba(255, 255, 255, 0.04);
                                    border: 1px solid rgba(255, 255, 255, 0.08);
                                    border-radius: 24px;
                                    padding: 1.6rem 1.4rem 1.8rem;
                                    box-shadow: 0 20px 60px rgba(0,0,0,0.45);
                                    text-align: center;
                                    backdrop-filter: blur(10px);
                                }
                                .avatar {
                                    width: 90px;
                                    height: 90px;
                                    border-radius: 50%;
                                    margin: 0 auto 1rem;
                                    background: linear-gradient(135deg, #5f27cd, #7c3aed);
                                    display: grid;
                                    place-items: center;
                                    font-size: 2rem;
                                    color: #fff;
                                    box-shadow: 0 10px 30px rgba(94, 92, 255, 0.35);
                                }
                                .title { font-size: 1rem; letter-spacing: 0.08em; color: #9ca3af; margin: 0 0 0.35rem; text-transform: uppercase; }
                                .name { font-size: 1.8rem; font-weight: 700; margin: 0 0 0.2rem; color: #e5e7eb; }
                                .label { font-size: 0.95rem; color: #a5b4fc; margin: 0 0 1.1rem; }
                                .status { color: #fca5a5; font-weight: 600; margin: 0 0 1.4rem; }
                                .wave {
                                    position: relative;
                                    width: 120px;
                                    height: 120px;
                                    margin: 0 auto 1rem;
                                }
                                .wave::before, .wave::after {
                                    content: '';
                                    position: absolute;
                                    inset: 0;
                                    border: 2px solid rgba(124, 58, 237, 0.45);
                                    border-radius: 50%;
                                    animation: pulse 2.4s infinite;
                                }
                                .wave::after { animation-delay: 0.8s; }
                                @keyframes pulse {
                                    0% { transform: scale(0.6); opacity: 0.8; }
                                    70% { transform: scale(1.4); opacity: 0; }
                                    100% { opacity: 0; }
                                }
                                .actions {
                                    display: grid;
                                    grid-template-columns: repeat(2, minmax(0, 1fr));
                                    gap: 1rem;
                                    margin-top: 1.2rem;
                                }
                                button {
                                    border: none;
                                    border-radius: 14px;
                                    padding: 0.85rem 1rem;
                                    font-weight: 700;
                                    cursor: pointer;
                                    font-size: 1rem;
                                    display: inline-flex;
                                    align-items: center;
                                    justify-content: center;
                                    gap: 0.5rem;
                                    box-shadow: 0 12px 30px rgba(0,0,0,0.25);
                                    transition: transform 0.2s, box-shadow 0.2s;
                                }
                                button:active { transform: translateY(1px); }
                                .decline { background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; }
                                .accept { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; }
                                .mute { background: rgba(255,255,255,0.08); color: #e5e7eb; border: 1px solid rgba(255,255,255,0.08); }
                                .text { background: rgba(255,255,255,0.08); color: #e5e7eb; border: 1px solid rgba(255,255,255,0.08); }
                            </style>
                        </head>
                        <body>
                            <div class="call-card">
                                <div class="title">Incoming Call</div>
                                <div class="avatar">📞</div>
                                <div class="name">Unknown Caller</div>
                                <div class="label">+1 (555) 010-2025</div>
                                <div class="status">Ringing...</div>
                                <div class="wave"></div>
                                <div class="actions">
                                    <button class="decline" onclick="window.close()">✖ Decline</button>
                                    <button class="accept">✔ Accept</button>
                                    <button class="mute" onclick="toggleMute()">🔇 Mute</button>
                                    <button class="text">💬 Message</button>
                                </div>
                            </div>

                            <script>
                                let audioCtx;
                                let gain;
                                let isMuted = false;

                                function startTone() {
                                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                                    gain = audioCtx.createGain();
                                    gain.gain.value = 0.08;
                                    gain.connect(audioCtx.destination);

                                    const makeBeep = () => {
                                        if (!audioCtx || audioCtx.state === 'closed') return;
                                        const osc1 = audioCtx.createOscillator();
                                        const osc2 = audioCtx.createOscillator();
                                        osc1.frequency.value = 440;
                                        osc2.frequency.value = 480;
                                        osc1.connect(gain);
                                        osc2.connect(gain);
                                        osc1.start();
                                        osc2.start();
                                        osc1.stop(audioCtx.currentTime + 0.4);
                                        osc2.stop(audioCtx.currentTime + 0.4);
                                    };

                                    makeBeep();
                                    setInterval(makeBeep, 1200);
                                }

                                function toggleMute() {
                                    isMuted = !isMuted;
                                    if (gain) {
                                        gain.gain.value = isMuted ? 0 : 0.08;
                                    }
                                    document.querySelector('.mute').textContent = isMuted ? '🔊 Unmute' : '🔇 Mute';
                                }

                                window.addEventListener('focus', () => {
                                    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
                                });

                                startTone();
                            </script>
                        </body>
                        </html>
                `);

                fakeCallWindow.document.close();
        };

    return (
        <div className="dashboard-page">
            <Header onLogout={onLogout} />
            
            <div className="dashboard-container">
                {/* Top Action Circles */}
                <div className="top-circles">
                    <div className="circle-item" onClick={() => navigate('/create-bubble')}>
                        <div className="circle-btn create-circle">
                            <span>+</span>
                        </div>
                        <p>Create</p>
                    </div>
                    <div className="circle-item" onClick={() => navigate('/emergency-contacts')}>
                        <div className="circle-btn friends-circle">
                            <span>👥</span>
                        </div>
                        <p>Friends</p>
                    </div>
                    {bubbles.map((bubble) => (
                        <div key={bubble.id} className="circle-item">
                            <div 
                                className="circle-btn bubble-circle" 
                                style={{ backgroundColor: bubble.color }}
                            >
                                <span>{bubble.icon}</span>
                            </div>
                            <p>{bubble.name}</p>
                        </div>
                    ))}
                </div>

                {/* Status Badge */}
                {batteryLevel !== null && (
                    <div className="status-badge">
                        <span className="status-icon">👥</span>
                        <span className="status-count">1</span>
                    </div>
                )}

                {/* Map Controls */}
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    padding: '0 1rem',
                    justifyContent: 'center',
                }}>
                    <div style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: '#fff',
                        fontWeight: 'bold',
                        textAlign: 'center',
                    }}>
                        🌍 Google Maps (Live GPS)
                    </div>
                </div>

                {/* Map Section */}
                <div className="map-container">
                    <GoogleMap showGPS={true} showRouteTrail={true} />
                </div>
                {/* Bottom Action Buttons */}
                <div className="bottom-actions">
                    <button className="action-button bubble-btn" onClick={() => navigate('/voice-sos')}>
                        <span className="action-icon">🎙️</span>
                        <p>Voice Alert</p>
                    </button>
                    <button className="action-button record-btn" onClick={() => navigate('/alerts')}>
                        <span className="action-icon">🔔</span>
                        <p>Alerts</p>
                    </button>
                    <button className="action-button sos-btn" onClick={() => setShowSOS(true)}>
                        <span className="action-icon">🚨</span>
                        <p>SOS</p>
                    </button>
                    <button className="action-button route-btn" onClick={() => navigate('/route-info')}>
                        <span className="action-icon">🧭</span>
                        <p>Route</p>
                    </button>
                </div>
                
                {/* SOS Modal */}
                {showSOS && (
                    <div className="sos-modal-overlay" onClick={() => setShowSOS(false)}>
                        <div className="sos-modal-content" onClick={(e) => e.stopPropagation()}>
                            <SOSButton onSOSConfirmed={() => {
                                handleSOSConfirmed();
                                setShowSOS(false);
                            }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;