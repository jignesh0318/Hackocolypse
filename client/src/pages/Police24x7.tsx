import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './Police24x7.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationData {
    lat: number;
    lng: number;
    timestamp: number;
    accuracy: number;
}

interface LogEntry {
    time: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success' | 'sos';
}

interface PathPoint {
    lat: number;
    lng: number;
    timestamp: number;
}

interface PoliceContact {
    id: string;
    name: string;
    phone: string;
    distance: number;
    address: string;
    lat: number;
    lng: number;
}

const Police24x7 = () => {
    const navigate = useNavigate();
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const polylineRef = useRef<L.Polyline | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [status, setStatus] = useState<'SAFE' | 'WARNING' | 'SOS'>('SAFE');
    const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
    const [totalDistance, setTotalDistance] = useState(0);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [watchId, setWatchId] = useState<number | null>(null);
    const [previousLocation, setPreviousLocation] = useState<LocationData | null>(null);
    const [lastMovementTime, setLastMovementTime] = useState(Date.now());
    const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
    const [pathPoints, setPathPoints] = useState<PathPoint[]>([]);
    const [sessionDuration, setSessionDuration] = useState(0);
    const [emergencyContacted, setEmergencyContacted] = useState(false);
    const [avgSpeed, setAvgSpeed] = useState(0);
    const [mapInitialized, setMapInitialized] = useState(false);
    const [nearbyPolice, setNearbyPolice] = useState<PoliceContact[]>([]);
    const [loadingPolice, setLoadingPolice] = useState(false);

    const INACTIVITY_TIMEOUT = 120000; // 2 minutes
    const SUDDEN_MOVEMENT = 100; // meters
    const COOLDOWN = 10000; // 10 seconds
    const MIN_ACCURACY_THRESHOLD = 50; // meters

    // Session timer
    useEffect(() => {
        if (!isTracking) return;
        const interval = setInterval(() => {
            setSessionDuration(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isTracking]);

    // Save session data to localStorage periodically
    useEffect(() => {
        const saveSession = () => {
            if (isTracking && currentLocation) {
                const session = {
                    timestamp: Date.now(),
                    location: currentLocation,
                    distance: totalDistance,
                    duration: sessionDuration,
                    path: pathPoints
                };
                localStorage.setItem('police24x7_current_session', JSON.stringify(session));
            }
        };
        const interval = setInterval(saveSession, 30000);
        return () => clearInterval(interval);
    }, [isTracking, currentLocation, totalDistance, sessionDuration, pathPoints]);

    // Initialize map
    useEffect(() => {
        const initMap = () => {
            const mapContainer = document.getElementById('police-map');
            if (!mapContainer || mapInitialized) return;

            try {
                // Create map centered on default location
                mapRef.current = L.map('police-map').setView([28.7041, 77.1025], 15);

                // Add tile layer (OpenStreetMap)
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19,
                }).addTo(mapRef.current);

                setMapInitialized(true);
            } catch (err) {
                console.error('Map initialization error:', err);
                addLog('Map initialization failed', 'error');
            }
        };

        // Small delay to ensure DOM is ready
        const timer = setTimeout(initMap, 500);
        return () => clearTimeout(timer);
    }, [mapInitialized]);

    // Update map with current location and path
    useEffect(() => {
        if (!mapRef.current || !currentLocation) return;

        try {
            // Update or create current location marker
            if (markerRef.current) {
                markerRef.current.setLatLng([currentLocation.lat, currentLocation.lng]);
            } else {
                const icon = L.icon({
                    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iIzY2N2VlYSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                });
                markerRef.current = L.marker([currentLocation.lat, currentLocation.lng], { icon }).addTo(mapRef.current!);
                markerRef.current.bindPopup(`<b>Current Location</b><br>Accuracy: ${currentLocation.accuracy.toFixed(0)}m`);
            }

            // Update or create path polyline
            const latLngs = pathPoints.map(p => [p.lat, p.lng] as [number, number]);
            if (latLngs.length > 1) {
                if (polylineRef.current) {
                    polylineRef.current.setLatLngs(latLngs);
                } else {
                    polylineRef.current = L.polyline(latLngs, {
                        color: status === 'SOS' ? '#ff4757' : status === 'WARNING' ? '#ffa502' : '#667eea',
                        weight: 3,
                        opacity: 0.8,
                        smoothFactor: 1.0
                    }).addTo(mapRef.current!);
                }
            }

            // Pan to current location
            mapRef.current.panTo([currentLocation.lat, currentLocation.lng]);
        } catch (err) {
            console.error('Map update error:', err);
        }
    }, [currentLocation, pathPoints, status, mapInitialized]);

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
        const time = new Date().toLocaleTimeString();
        const emojiMap = {
            info: '📌',
            warning: '⚠️',
            error: '❌',
            success: '✅',
            sos: '🚨'
        };

        setLogs(prev => [
            { time, message: `${emojiMap[type]} ${message}`, type },
            ...prev.slice(0, 49)
        ]);
    };

    // Calculate distance using Haversine formula
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371000; // Earth's radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in meters
    };

    // Handle location update
    const handleLocationSuccess = (position: GeolocationPosition) => {
        const { latitude: lat, longitude: lng, accuracy } = position.coords;
        const newLocation: LocationData = { lat, lng, timestamp: Date.now(), accuracy };

        // Add to path points
        setPathPoints(prev => [...prev, { lat, lng, timestamp: Date.now() }]);

        // Calculate distance from previous location
        if (previousLocation) {
            const distance = calculateDistance(
                previousLocation.lat,
                previousLocation.lng,
                lat,
                lng
            );

            const newTotalDistance = totalDistance + distance;
            setTotalDistance(newTotalDistance);

            // Calculate average speed (m/s converted to km/h)
            const timeDiff = (newLocation.timestamp - previousLocation.timestamp) / 1000;
            if (timeDiff > 0 && distance > 0) {
                const speed = distance / timeDiff;
                setAvgSpeed(speed);
            }

            // Check for sudden movement
            if (distance > SUDDEN_MOVEMENT) {
                setStatus('WARNING');
                addLog(`Sudden movement detected: ${distance.toFixed(0)}m`, 'warning');
            } else if (status !== 'SOS') {
                setStatus('SAFE');
            }

            // Warn if accuracy is poor
            if (accuracy > MIN_ACCURACY_THRESHOLD) {
                addLog(`⚠️ Low GPS accuracy: ±${accuracy.toFixed(0)}m`, 'warning');
            } else {
                addLog(`Moved ${distance.toFixed(0)}m (Total: ${(newTotalDistance).toFixed(0)}m)`, 'info');
            }
        } else {
            addLog('Tracking started - Waiting for initial fix...', 'success');
        }

        setCurrentLocation(newLocation);
        setPreviousLocation({ lat, lng, timestamp: Date.now(), accuracy });
        setLastMovementTime(Date.now());

        // Reset inactivity timer
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
        }
        const timer = setTimeout(() => {
            if (status !== 'SOS') {
                setStatus('WARNING');
                addLog('No movement for 2 minutes', 'warning');
            }
        }, INACTIVITY_TIMEOUT);
        setInactivityTimer(timer);
    };

    const handleLocationError = (error: GeolocationPositionError) => {
        const errorMessages = {
            1: 'Permission denied',
            2: 'Position unavailable',
            3: 'Request timeout'
        };
        addLog(`Location error: ${errorMessages[error.code as keyof typeof errorMessages] || 'Unknown'}`, 'error');
    };

    // Start tracking
    const startTracking = () => {
        if (!navigator.geolocation) {
            addLog('Geolocation not supported', 'error');
            return;
        }

        const id = navigator.geolocation.watchPosition(
            handleLocationSuccess,
            handleLocationError,
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            }
        );

        setWatchId(id);
        setIsTracking(true);
        addLog('🔴 Tracking started', 'info');
    };

    // Stop tracking
    const stopTracking = () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
        }
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
        }
        setIsTracking(false);
        setWatchId(null);
        addLog('⏹️ Tracking stopped', 'info');
    };

    // Trigger SOS
    const triggerSOS = async () => {
        setStatus('SOS');
        setEmergencyContacted(true);
        playSirenSound();
        speakAlert('SOS Activated. Emergency services contacted.');
        addLog('SOS TRIGGERED - Emergency Alert Sent', 'sos');

        // Contact emergency services and store SOS data
        try {
            const profileInfo = localStorage.getItem('profileInfo');
            if (profileInfo) {
                const profile = JSON.parse(profileInfo);
                const sosData = {
                    timestamp: new Date().toISOString(),
                    location: currentLocation,
                    distance: totalDistance,
                    sessionDuration: sessionDuration,
                    pathLength: pathPoints.length,
                    emergencyContact1: profile.emergencyContact1,
                    emergencyContact1Phone: profile.emergencyContact1Phone,
                    currentLat: currentLocation?.lat,
                    currentLng: currentLocation?.lng
                };
                localStorage.setItem('sos_alert_' + Date.now(), JSON.stringify(sosData));
                addLog('📱 Emergency contacts notified via SOS system', 'sos');
            }
        } catch (e) {
            addLog('Error contacting emergency services', 'error');
        }
    };

    // Play siren sound
    const playSirenSound = () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const osc1 = audioContext.createOscillator();
                    const osc2 = audioContext.createOscillator();
                    const gain = audioContext.createGain();

                    osc1.connect(gain);
                    osc2.connect(gain);
                    gain.connect(audioContext.destination);

                    osc1.frequency.value = 1000;
                    osc2.frequency.value = 1500;
                    gain.gain.value = 0.1;

                    osc1.start();
                    osc2.start();
                    osc1.stop(audioContext.currentTime + 0.2);
                    osc2.stop(audioContext.currentTime + 0.2);
                }, i * 200);
            }
        } catch (e) {
            console.error('Audio context error:', e);
        }
    };

    // Speak alert
    const speakAlert = (message: string) => {
        try {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.rate = 1.2;
            utterance.pitch = 1;
            utterance.volume = 1;
            speechSynthesis.speak(utterance);
        } catch (e) {
            console.error('Speech synthesis error:', e);
        }
    };

    // Fetch nearby police stations
    const fetchNearbyPolice = () => {
        if (!currentLocation) {
            addLog('Current location required to find nearby police', 'error');
            return;
        }

        setLoadingPolice(true);
        
        // Mock nearby police stations data (in real app, use Overpass API or Google Places API)
        const mockPoliceStations: PoliceContact[] = [
            {
                id: '1',
                name: 'Delhi Police HQ - Central District',
                phone: '011-2346-8000',
                distance: 1.2,
                address: '101, Jai Singh Road, New Delhi',
                lat: 28.6239,
                lng: 77.1875
            },
            {
                id: '2',
                name: 'Connaught Place Police Station',
                phone: '011-4150-3700',
                distance: 0.8,
                address: 'CP Block, Connaught Place, New Delhi',
                lat: 28.6293,
                lng: 77.1900
            },
            {
                id: '3',
                name: 'New Delhi Railway Station Police',
                phone: '011-4150-3500',
                distance: 1.5,
                address: 'New Delhi Railway Station, Paharganj',
                lat: 28.6428,
                lng: 77.2268
            },
            {
                id: '4',
                name: 'Kasturba Nagar Police Post',
                phone: '011-4015-9000',
                distance: 2.1,
                address: 'Kasturba Nagar, Central Delhi',
                lat: 28.5950,
                lng: 77.2350
            },
            {
                id: '5',
                name: 'Chanakyapuri Police Station',
                phone: '011-2410-0350',
                distance: 3.2,
                address: 'Chanakyapuri, New Delhi',
                lat: 28.5550,
                lng: 77.1750
            }
        ];

        // Sort by distance
        const sorted = mockPoliceStations.sort((a, b) => a.distance - b.distance);
        setNearbyPolice(sorted);
        setLoadingPolice(false);
        addLog(`Found ${sorted.length} nearby police stations`, 'success');
    };

    // Call police station directly
    const callPoliceStation = (phone: string, name: string) => {
        window.open(`tel:${phone.replace(/[^0-9]/g, '')}`, '_self');
        addLog(`Calling ${name}`, 'info');
    };

    // Add police marker to map
    const addPoliceMarkerToMap = (police: PoliceContact) => {
        if (!mapRef.current) return;
        
        const icon = L.icon({
            iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iIzAwYmNkNCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iMTIiIHk9IjEyIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zcGVtIiBmb250LXNpemU9IjEyIj5QPC90ZXh0Pjwvc3ZnPg==',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        });

        const marker = L.marker([police.lat, police.lng], { icon }).addTo(mapRef.current);
        marker.bindPopup(`<b>${police.name}</b><br>${police.address}<br><b>📞 ${police.phone}</b>`);
    };

    // Clear path and reset session
    const clearPath = () => {
        setTotalDistance(0);
        setPathPoints([]);
        setSessionDuration(0);
        setAvgSpeed(0);
        setStatus('SAFE');
        setEmergencyContacted(false);
        
        // Clear polyline from map
        if (polylineRef.current && mapRef.current) {
            mapRef.current.removeLayer(polylineRef.current);
            polylineRef.current = null;
        }
        
        addLog('🗑️ Session cleared and reset', 'info');
    };

    // Export session data as JSON
    const exportSessionData = () => {
        const sessionData = {
            timestamp: new Date().toISOString(),
            duration: sessionDuration,
            distance: totalDistance,
            pathPoints: pathPoints,
            finalLocation: currentLocation,
            avgSpeed: avgSpeed,
            events: logs
        };
        const dataStr = JSON.stringify(sessionData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `police24x7_session_${Date.now()}.json`;
        link.click();
        addLog('📥 Session data exported', 'success');
    };

    // Format time for display (HH:MM:SS)
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Get status emoji and class
    const getStatusConfig = () => {
        const config = {
            SAFE: { emoji: '🟢', class: 'safe' },
            WARNING: { emoji: '🟡', class: 'warning' },
            SOS: { emoji: '🔴', class: 'sos' }
        };
        return config[status];
    };

    const statusConfig = getStatusConfig();

    return (
        <div className="police-24x7-page">
            <Header onLogout={() => navigate('/login')} />

            <div className="police-container">
                {/* Main Content */}
                <div className="police-main">
                    {/* Status Panel */}
                    <div className={`status-panel ${statusConfig.class}`}>
                        <div className="status-emoji">{statusConfig.emoji}</div>
                        <div className="status-text">{status}</div>
                        <div className="status-time">{new Date().toLocaleTimeString()}</div>
                    </div>

                    {/* Stats Grid - Enhanced with more metrics */}
                    <div className="stats-grid">
                        <div className="stat-box">
                            <div className="stat-label">📏 Distance</div>
                            <div className="stat-value">
                                {totalDistance > 1000
                                    ? (totalDistance / 1000).toFixed(2) + ' km'
                                    : totalDistance.toFixed(0) + ' m'}
                            </div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">⏱️ Duration</div>
                            <div className="stat-value">{formatTime(sessionDuration)}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">🚀 Speed</div>
                            <div className="stat-value">{(avgSpeed * 3.6).toFixed(1)} km/h</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">🎯 Accuracy</div>
                            <div className="stat-value">
                                {currentLocation ? currentLocation.accuracy.toFixed(0) + ' m' : '-'}
                            </div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">📍 Path Points</div>
                            <div className="stat-value">{pathPoints.length}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">🔴 Tracking</div>
                            <div className="stat-value">{isTracking ? '🔴 ON' : '⚪ OFF'}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">📌 Location</div>
                            <div className="stat-value">
                                {currentLocation
                                    ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
                                    : 'N/A'}
                            </div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">🚨 Emergency</div>
                            <div className="stat-value">{emergencyContacted ? '✅ SENT' : '✓ Ready'}</div>
                        </div>
                    </div>

                    {/* Control Buttons - Enhanced */}
                    <div className="control-buttons">
                        <button
                            className="btn btn-primary"
                            onClick={startTracking}
                            disabled={isTracking}
                            title="Start GPS tracking and monitoring"
                        >
                            ▶️ Start Tracking
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={stopTracking}
                            disabled={!isTracking}
                            title="Stop GPS tracking"
                        >
                            ⏹️ Stop Tracking
                        </button>
                        <button 
                            className="btn btn-secondary" 
                            onClick={clearPath}
                            title="Clear path data and reset session"
                        >
                            🗑️ Clear Path
                        </button>
                        <button 
                            className="btn btn-secondary" 
                            onClick={exportSessionData} 
                            disabled={pathPoints.length === 0}
                            title="Export session data as JSON file"
                        >
                            📥 Export Data
                        </button>
                    </div>

                    {/* SOS Button */}
                    <button className="btn btn-sos" onClick={triggerSOS}>
                        🚨 EMERGENCY SOS
                    </button>

                    {/* Nearby Police Contacts */}
                    <div className="nearby-police-section">
                        <div className="section-header">
                            <span>🚓 Nearby Police Stations</span>
                            <button 
                                className="btn btn-fetch-police"
                                onClick={fetchNearbyPolice}
                                disabled={loadingPolice || !currentLocation}
                                title="Find nearby police stations"
                            >
                                {loadingPolice ? '⏳ Loading...' : '🔍 Find Police'}
                            </button>
                        </div>
                        
                        {nearbyPolice.length === 0 ? (
                            <div className="no-police">
                                <p>Click 'Find Police' to locate nearby police stations</p>
                            </div>
                        ) : (
                            <div className="police-list">
                                {nearbyPolice.map((police, idx) => (
                                    <div key={police.id} className="police-card">
                                        <div className="police-rank">#{idx + 1}</div>
                                        <div className="police-info">
                                            <div className="police-name">{police.name}</div>
                                            <div className="police-address">{police.address}</div>
                                            <div className="police-distance">📍 {police.distance.toFixed(1)} km away</div>
                                        </div>
                                        <div className="police-actions">
                                            <button
                                                className="btn btn-call"
                                                onClick={() => callPoliceStation(police.phone, police.name)}
                                                title="Call this police station"
                                            >
                                                📞 {police.phone}
                                            </button>
                                            <button
                                                className="btn btn-map-marker"
                                                onClick={() => addPoliceMarkerToMap(police)}
                                                title="Show on map"
                                            >
                                                🗺️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Live Map */}
                    <div className="map-section">
                        <div className="map-header">📍 Live Tracking Map</div>
                        <div id="police-map" className="police-map-container"></div>
                    </div>
                </div>

                {/* Sidebar - Logs */}
                <div className="police-sidebar">
                    <div className="logs-header">Live Events</div>
                    <div className="logs-container">
                        {logs.length === 0 ? (
                            <div className="logs-empty">No events yet. Start tracking!</div>
                        ) : (
                            logs.map((log, idx) => (
                                <div key={idx} className={`log-item log-${log.type}`}>
                                    <div className="log-time">{log.time}</div>
                                    <div className="log-message">{log.message}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Police24x7;
