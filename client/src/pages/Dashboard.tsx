import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Map from '../components/Map';
import SOSButton from '../components/SOSButton';
import RouteInfo from '../components/RouteInfo';
import VoiceSOS from '../components/VoiceSOS';
import routeTracker from '../services/routeTracker';
import './Dashboard.css';

interface DashboardProps {
    onLogout: () => void;
}

interface Alert {
    id: number;
    location: string;
    time: string;
    severity: 'danger' | 'warning' | 'info';
    message: string;
}

interface Activity {
    id: number;
    action: string;
    time: string;
    icon: string;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
    const [stats] = useState({
        safeZones: 124,
        alertZones: 45,
        dangerZones: 12,
        activeUsers: 1248,
        reportsToday: 23,
        avgSafetyScore: 72
    });

    const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
    const [isTracking, setIsTracking] = useState(false);

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

    const [alerts] = useState<Alert[]>([
        { id: 1, location: 'Connaught Place', time: '10 mins ago', severity: 'danger', message: 'Multiple reports of harassment' },
        { id: 2, location: 'Saket Metro', time: '25 mins ago', severity: 'warning', message: 'Poor lighting reported' },
        { id: 3, location: 'Hauz Khas', time: '1 hour ago', severity: 'info', message: 'Increased police presence' },
        { id: 4, location: 'Lajpat Nagar', time: '2 hours ago', severity: 'warning', message: 'Crowded area alert' }
    ]);

    const [activities] = useState<Activity[]>([
        { id: 1, action: 'Reported unsafe zone in Karol Bagh', time: '5 mins ago', icon: '📍' },
        { id: 2, action: 'Safety score updated for Rohini', time: '15 mins ago', icon: '📊' },
        { id: 3, action: 'New safe zone verified in Dwarka', time: '1 hour ago', icon: '✅' },
        { id: 4, action: 'Alert issued for Nehru Place', time: '2 hours ago', icon: '⚠️' }
    ]);

    const handleSOSConfirmed = () => {
        // Get emergency contacts from localStorage
        const profileInfo = localStorage.getItem('profileInfo');
        
        if (profileInfo) {
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

                // Get current location
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                        const { latitude, longitude } = position.coords;
                        const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
                        
                        // Show confirmation
                        alert(`🚨 SOS ALERT SENT!\n\nEmergency contacts notified:\n${contacts.map(c => `• ${c.name} (${c.relation}): ${c.phone}`).join('\n')}\n\nYour location: ${locationUrl}\n\nHelp is on the way!`);
                        
                        // In a real app, this would:
                        // 1. Send SMS to emergency contacts
                        // 2. Call emergency services
                        // 3. Share live location
                        // 4. Log the incident
                        console.log('SOS Triggered:', {
                            contacts,
                            location: { latitude, longitude },
                            timestamp: new Date().toISOString(),
                            userInfo: {
                                name: profile.fullName,
                                phone: profile.primaryPhone,
                                bloodGroup: profile.bloodGroup,
                                allergies: profile.allergies,
                                medications: profile.medications
                            }
                        });
                    }, (error) => {
                        alert('🚨 SOS ALERT SENT!\n\nEmergency contacts notified (location unavailable)');
                        console.error('Location error:', error);
                    });
                } else {
                    alert('🚨 SOS ALERT SENT!\n\nEmergency contacts notified');
                }
            } catch (error) {
                console.error('Error parsing profile:', error);
                alert('🚨 SOS TRIGGERED!\n\nPlease complete your safety profile to enable emergency contact notifications.');
            }
        } else {
            alert('🚨 SOS TRIGGERED!\n\nPlease complete your safety profile to enable emergency contact notifications.');
        }
    };

    return (
        <div className="dashboard-page">
            <Header onLogout={onLogout} />
            
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p className="dashboard-subtitle">Real-time safety insights and analytics</p>
                        
                        {/* Battery and Tracking Status */}
                        <div className="status-indicators">
                            {batteryLevel !== null && (
                                <div className={`battery-indicator ${batteryLevel <= 10 ? 'low' : batteryLevel <= 20 ? 'warning' : ''}`}>
                                    <span className="battery-icon">
                                        {batteryLevel <= 10 ? '🔋' : batteryLevel <= 20 ? '🪫' : '🔋'}
                                    </span>
                                    <span className="battery-text">{batteryLevel.toFixed(0)}%</span>
                                </div>
                            )}
                            {isTracking && (
                                <div className="tracking-indicator">
                                    <span className="tracking-pulse">📍</span>
                                    <span className="tracking-text">Route Tracking Active</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="dashboard-actions">
                        <button className="btn-primary">
                            <span>📝</span> Report Issue
                        </button>
                        <button className="btn-secondary">
                            <span>📥</span> Export Data
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card safe">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <h3>{stats.safeZones}</h3>
                            <p>Safe Zones</p>
                            <span className="stat-trend up">+12% this week</span>
                        </div>
                    </div>
                    
                    <div className="stat-card warning">
                        <div className="stat-icon">⚠️</div>
                        <div className="stat-info">
                            <h3>{stats.alertZones}</h3>
                            <p>Alert Zones</p>
                            <span className="stat-trend">Monitoring</span>
                        </div>
                    </div>
                    
                    <div className="stat-card danger">
                        <div className="stat-icon">🚨</div>
                        <div className="stat-info">
                            <h3>{stats.dangerZones}</h3>
                            <p>Danger Zones</p>
                            <span className="stat-trend down">-3 since yesterday</span>
                        </div>
                    </div>
                    
                    <div className="stat-card users">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <h3>{stats.activeUsers.toLocaleString()}</h3>
                            <p>Active Users</p>
                            <span className="stat-trend up">+234 today</span>
                        </div>
                    </div>

                    <div className="stat-card reports">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <h3>{stats.reportsToday}</h3>
                            <p>Reports Today</p>
                            <span className="stat-trend">Last 24 hours</span>
                        </div>
                    </div>

                    <div className="stat-card score">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-info">
                            <h3>{stats.avgSafetyScore}%</h3>
                            <p>Avg Safety Score</p>
                            <span className="stat-trend up">+5% improvement</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="dashboard-content">
                    {/* Map Section */}
                    <div className="content-main">
                        <div className="map-section">
                            <div className="section-header">
                                <h2>Live Safety Map</h2>
                                <div className="map-controls">
                                    <button className="map-control-btn active">All Zones</button>
                                    <button className="map-control-btn">Safe</button>
                                    <button className="map-control-btn">Alert</button>
                                    <button className="map-control-btn">Danger</button>
                                </div>
                            </div>
                            <div className="map-wrapper">
                                <Map />
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="activity-section">
                            <h3>Recent Activity</h3>
                            <div className="activity-list">
                                {activities.map(activity => (
                                    <div key={activity.id} className="activity-item">
                                        <span className="activity-icon">{activity.icon}</span>
                                        <div className="activity-content">
                                            <p>{activity.action}</p>
                                            <span className="activity-time">{activity.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="dashboard-sidebar">
                        {/* Alerts */}
                        <div className="alerts-section">
                            <h3>🔔 Active Alerts</h3>
                            <div className="alerts-list">
                                {alerts.map(alert => (
                                    <div key={alert.id} className={`alert-card ${alert.severity}`}>
                                        <div className="alert-header">
                                            <strong>{alert.location}</strong>
                                            <span className="alert-time">{alert.time}</span>
                                        </div>
                                        <p className="alert-message">{alert.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SOS Emergency Button */}
                        <div className="sos-section">
                            <SOSButton onSOSConfirmed={handleSOSConfirmed} />
                        </div>

                        {/* Voice-Activated SOS */}
                        <div className="voice-sos-section">
                            <VoiceSOS onSOSTriggered={handleSOSConfirmed} />
                        </div>

                        {/* Route Tracking Info */}
                        <div className="route-section">
                            <RouteInfo />
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions">
                            <h3>⚡ Quick Actions</h3>
                            <button className="action-btn">
                                <span>📍</span>
                                <div>
                                    <strong>Check My Location</strong>
                                    <small>View safety score</small>
                                </div>
                            </button>
                            <button className="action-btn">
                                <span>👁️</span>
                                <div>
                                    <strong>Share Live Location</strong>
                                    <small>With trusted contacts</small>
                                </div>
                            </button>
                            <button className="action-btn">
                                <span>📞</span>
                                <div>
                                    <strong>Emergency Contacts</strong>
                                    <small>Police, Ambulance</small>
                                </div>
                            </button>
                        </div>

                        {/* Safety Tips */}
                        <div className="safety-tips">
                            <h3>💡 Safety Tip</h3>
                            <div className="tip-card">
                                <p>"Always share your live location with trusted contacts when traveling through unfamiliar areas, especially after dark."</p>
                                <button className="tip-btn">Next Tip →</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;