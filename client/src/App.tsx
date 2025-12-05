import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PersonalInfo from './pages/PersonalInfo';
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

  useEffect(() => {
    // Check if user is already logged in (token exists)
    const token = localStorage.getItem('token');
    const savedProfileStatus = localStorage.getItem('profileComplete') === 'true';
    if (token) {
      setIsAuthenticated(true);
      setProfileComplete(savedProfileStatus);
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setProfileComplete(false);
  };

  const handleProfileComplete = () => {
    localStorage.setItem('profileComplete', 'true');
    setProfileComplete(true);
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
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
                  <Home onLogout={handleLogout} />
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;