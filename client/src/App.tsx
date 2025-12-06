import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PersonalInfo from './pages/PersonalInfo';
import SafetyMap from './pages/SafetyMap';
import Alerts from './pages/Alerts';
import EmergencyContacts from './pages/EmergencyContacts';
import SafetyTips from './pages/SafetyTips';
import VoiceSOSPage from './pages/VoiceSOSPage';
import Menu from './pages/Menu';
import SOSHistory from './pages/SOSHistory';
import RouteInfoPage from './pages/RouteInfoPage';
import SafetyAnalysisPage from './pages/SafetyAnalysis';
import Police24x7 from './pages/Police24x7';
import OfflineIndicator from './components/OfflineIndicator';
import RiskZoneAlert from './components/RiskZoneAlert';
import offlineManager from './services/offlineManager';
import offlineRiskDetector from './services/offlineRiskDetector';
import CreateBubble from './pages/CreateBubble';
import InstallPrompt from './components/InstallPrompt';
import Chatbot from './components/Chatbot';
import VoiceAssistant from './components/VoiceAssistant';
import './App.css';

interface ProtectedRouteProps {
  element: JSX.Element;
  isAuthenticated: boolean;
}

const ProtectedRoute = ({ element, isAuthenticated }: ProtectedRouteProps) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return element;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Initialize offline manager
      offlineManager.init();
      offlineManager.requestNotificationPermission();
      
      // Initialize offline risk detector
      offlineRiskDetector.init();

      // Check if user is already logged in (token exists)
      const token = localStorage.getItem('token');
      const savedProfileStatus = localStorage.getItem('profileComplete') === 'true';
      if (token) {
        setIsAuthenticated(true);
        setProfileComplete(savedProfileStatus);
        
        // Cache user data for offline use
        const profileInfo = localStorage.getItem('profileInfo');
        if (profileInfo) {
          offlineManager.cacheUserProfile(JSON.parse(profileInfo));
        }
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading app state:', err);
      setError('Failed to load application');
      setIsLoading(false);
    }
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('profileComplete');
      setIsAuthenticated(false);
      setProfileComplete(false);
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  const handleProfileComplete = () => {
    try {
      localStorage.setItem('profileComplete', 'true');
      setProfileComplete(true);
    } catch (err) {
      console.error('Error saving profile completion:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner">
          <div className="spinner-animation"></div>
          <p>Loading SafeZone AI...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reload Application</button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <OfflineIndicator />
      <RiskZoneAlert />
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              onLoginSuccess={() => {
                setIsAuthenticated(true);
                const savedProfileStatus = localStorage.getItem('profileComplete') === 'true';
                setProfileComplete(savedProfileStatus);
                // Always send newly logged-in users to profile setup first
              }}
            />
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<PersonalInfo onComplete={handleProfileComplete} onLogout={handleLogout} />}
            />
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={
                profileComplete ? (
                  <Dashboard onLogout={handleLogout} />
                ) : (
                  <Navigate to="/profile" replace />
                )
              }
            />
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={
                profileComplete ? (
                  <Dashboard onLogout={handleLogout} />
                ) : (
                  <Navigate to="/profile" replace />
                )
              }
            />
          }
        />

        <Route
          path="/map"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={
                profileComplete ? (
                  <SafetyMap onLogout={handleLogout} />
                ) : (
                  <Navigate to="/profile" replace />
                )
              }
            />
          }
        />

        <Route
          path="/alerts"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={
                profileComplete ? (
                  <Alerts onLogout={handleLogout} />
                ) : (
                  <Navigate to="/profile" replace />
                )
              }
            />
          }
        />

        <Route
          path="/emergency-contacts"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={
                profileComplete ? (
                  <EmergencyContacts onLogout={handleLogout} />
                ) : (
                  <Navigate to="/profile" replace />
                )
              }
            />
          }
        />

        <Route
          path="/safety-tips"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={
                profileComplete ? (
                  <SafetyTips onLogout={handleLogout} />
                ) : (
                  <Navigate to="/profile" replace />
                )
              }
            />
          }
        />

        <Route
          path="/voice-sos"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={
                profileComplete ? (
                  <VoiceSOSPage onLogout={handleLogout} />
                ) : (
                  <Navigate to="/profile" replace />
                )
              }
            />
          }
        />

        <Route
          path="/menu"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={
                profileComplete ? (
                  <Menu onLogout={handleLogout} />
                ) : (
                  <Navigate to="/profile" replace />
                )
              }
            />
          }
        />

        <Route
          path="/sos-history"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={
                profileComplete ? (
                  <SOSHistory onLogout={handleLogout} />
                ) : (
                  <Navigate to="/profile" replace />
                )
              }
            />
          }
        />

        <Route
          path="/route"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={
                profileComplete ? (
                  <RouteInfoPage onLogout={handleLogout} />
                ) : (
                  <Navigate to="/profile" replace />
                )
              }
            />
          }
        />

        <Route
          path="/create-bubble"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={
                profileComplete ? (
                  <CreateBubble onLogout={handleLogout} />
                ) : (
                  <Navigate to="/profile" replace />
                )
              }
            />
          }
        />

        <Route
          path="/safety-analysis"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={
                profileComplete ? (
                  <SafetyAnalysisPage onLogout={handleLogout} />
                ) : (
                  <Navigate to="/profile" replace />
                )
              }
            />
          }
        />

        <Route
          path="/police-24x7"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={
                profileComplete ? (
                  <Police24x7 />
                ) : (
                  <Navigate to="/profile" replace />
                )
              }
            />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <InstallPrompt />
      {isAuthenticated && <Chatbot />}
      {isAuthenticated && profileComplete && <VoiceAssistant onLogout={handleLogout} />}
    </Router>
  );
}

export default App;