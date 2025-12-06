import React, { useState, useEffect, useRef } from 'react';
import VoiceAssistantService from '../services/voiceAssistant';
import './VoiceAssistant.css';

interface VoiceAssistantProps {
    onLogout: () => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onLogout }) => {
    const [isActive, setIsActive] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [waveAmplitudes, setWaveAmplitudes] = useState<number[]>(Array(20).fill(0.3));
    
    const assistantRef = useRef<VoiceAssistantService | null>(null);
    const waveAnimationRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize voice assistant
    useEffect(() => {
        assistantRef.current = new VoiceAssistantService({
            language: 'en-US',
            continuous: true,
            interimResults: true,
            onResult: handleVoiceResult,
            onError: handleVoiceError,
        });

        return () => {
            if (assistantRef.current) {
                assistantRef.current.destroy();
            }
        };
    }, []);

    // Listen to active/listening state
    useEffect(() => {
        if (!assistantRef.current) return;

        if (isActive && !isListening) {
            assistantRef.current.startListening();
            setIsListening(true);
            animateWave();
        } else if (!isActive && isListening) {
            assistantRef.current.stopListening();
            setIsListening(false);
            if (waveAnimationRef.current) {
                cancelAnimationFrame(waveAnimationRef.current);
            }
        }

        return () => {
            if (waveAnimationRef.current) {
                cancelAnimationFrame(waveAnimationRef.current);
            }
        };
    }, [isActive, isListening]);

    const handleVoiceResult = (text: string) => {
        setTranscript(text);
        console.log('Transcribed:', text);

        // Check for wake word
        const lowerText = text.toLowerCase();
        if (lowerText.includes('hey safezone') || lowerText.includes('safezone')) {
            activateAssistant();
            processCommand(text);
        } else if (isActive) {
            processCommand(text);
        }
    };

    const handleVoiceError = (error: string) => {
        console.error('Voice error:', error);
        setResponse(`Error: ${error}`);
    };

    const processCommand = (text: string) => {
        const lowerText = text.toLowerCase();

        // Send command to backend for processing
        sendVoiceCommand(text);
    };

    const sendVoiceCommand = async (transcript: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/voice/command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    command: transcript,
                    transcript: transcript,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setResponse(data.response);
                
                // Log the interaction
                logVoiceInteraction(transcript, data.command, data.success);

                // Speak the response
                speak(data.response, () => {
                    if (data.success) {
                        // Execute action based on command
                        executeAction(data.command);
                    }
                });
            } else {
                console.error('Failed to process voice command');
                setResponse('Sorry, I could not process that command. Please try again.');
            }
        } catch (error) {
            console.error('Error sending voice command:', error);
            setResponse('Sorry, there was an error processing your command.');
        }
    };

    const logVoiceInteraction = async (transcript: string, command: string, success: boolean) => {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/voice/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    command,
                    transcript,
                    success,
                    timestamp: new Date().toISOString(),
                }),
            });
        } catch (error) {
            console.error('Error logging voice interaction:', error);
        }
    };

    const executeAction = (command: string) => {
        switch (command) {
            case 'SOS_TRIGGERED':
                handleSOS();
                break;
            case 'LOCATION_SHARE':
                handleShareLocation();
                break;
            case 'OPEN_ROUTE':
                handleOpenRoute();
                break;
            default:
                break;
        }
    };

    const handleSOS = () => {
        // Trigger SOS alert
        const profileInfo = localStorage.getItem('profileInfo');
        if (profileInfo) {
            const profile = JSON.parse(profileInfo);
            // Send SOS via API similar to SOSButton
            console.log('SOS triggered via voice:', profile);
        }
    };

    const handleShareLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                console.log('Location shared:', latitude, longitude);
            });
        }
    };

    const handleOpenRoute = () => {
        window.location.href = '/route';
    };

    const activateAssistant = () => {
        setIsActive(true);
        setResponse('Listening...');
    };

    const deactivateAssistant = () => {
        setIsActive(false);
        setTranscript('');
        setResponse('');
        if (assistantRef.current) {
            assistantRef.current.stopListening();
        }
        setIsListening(false);
    };

    const speak = (text: string, onEnd?: () => void) => {
        if (assistantRef.current) {
            setIsSpeaking(true);
            assistantRef.current.speak(text, () => {
                setIsSpeaking(false);
                if (onEnd) onEnd();
                // Auto-deactivate after response
                setTimeout(() => {
                    deactivateAssistant();
                }, 1000);
            });
        }
    };

    const animateWave = () => {
        const newAmplitudes = waveAmplitudes.map(() => Math.random() * 0.8 + 0.2);
        setWaveAmplitudes(newAmplitudes);
        waveAnimationRef.current = requestAnimationFrame(animateWave);
    };

    const toggleAssistant = () => {
        if (isActive) {
            deactivateAssistant();
        } else {
            activateAssistant();
        }
    };

    return (
        <div className="voice-assistant-container">
            {/* Floating Voice Button */}
            <button
                className={`voice-button ${isActive ? 'active' : ''} ${isListening ? 'listening' : ''}`}
                onClick={toggleAssistant}
                title="Voice Assistant"
            >
                <div className="voice-orb">
                    {isListening && (
                        <div className="wave-container">
                            {waveAmplitudes.map((amp, i) => (
                                <div
                                    key={i}
                                    className={`wave-bar wave-bar-${i}`}
                                    style={{ height: `${amp * 100}%` }}
                                />
                            ))}
                        </div>
                    )}
                    {!isListening && (
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="microphone-icon"
                        >
                            <path d="M12 1a3 3 0 0 0-3 3v12a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="23" />
                            <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                    )}
                </div>
            </button>

            {/* Voice Assistant Panel */}
            {isActive && (
                <div className="voice-panel">
                    <div className="voice-panel-header">
                        <h3>SafeZone Voice Assistant</h3>
                        <button className="close-btn" onClick={deactivateAssistant}>
                            ✕
                        </button>
                    </div>

                    <div className="voice-panel-content">
                        {/* Status Indicator */}
                        <div className="status-indicator">
                            <span className={`status-dot ${isListening ? 'listening' : isSpeaking ? 'speaking' : ''}`} />
                            <span className="status-text">
                                {isListening ? '🎤 Listening...' : isSpeaking ? '🔊 Speaking...' : '⏸️ Ready'}
                            </span>
                        </div>

                        {/* Response Display */}
                        <div className="response-box">
                            {response && <p className="response-text">{response}</p>}
                            {transcript && !response && <p className="transcript-text">{transcript}</p>}
                            {!response && !transcript && <p className="placeholder">Say "Hey SafeZone" to get started</p>}
                        </div>

                        {/* Quick Commands */}
                        <div className="quick-commands">
                            <button onClick={() => speak('Emergency alert triggered.')} className="command-btn emergency">
                                🆘 SOS
                            </button>
                            <button onClick={() => speak('Sharing your location.')} className="command-btn">
                                📍 Location
                            </button>
                            <button onClick={() => speak('Opening safety tips.')} className="command-btn">
                                💡 Tips
                            </button>
                            <button onClick={() => speak('Opening your route.')} className="command-btn">
                                🗺️ Route
                            </button>
                        </div>

                        {/* Voice Commands Info */}
                        <div className="commands-info">
                            <p className="info-title">Voice Commands:</p>
                            <ul className="commands-list">
                                <li>"Emergency" or "Help" - Trigger SOS</li>
                                <li>"Location" - Share location</li>
                                <li>"Safety Tips" - Get safety advice</li>
                                <li>"Route" - Open map</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceAssistant;
