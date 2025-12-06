import { useState } from 'react';
import Header from '../components/Header';
import './Alerts.css';

interface AlertItem {
  id: number;
  location: string;
  time: string;
  severity: 'danger' | 'warning' | 'info';
  message: string;
}

interface AlertsProps {
  onLogout: () => void;
}

const Alerts = ({ onLogout }: AlertsProps) => {
  const [alerts] = useState<AlertItem[]>([
    { id: 1, location: 'Connaught Place', time: '10 mins ago', severity: 'danger', message: 'Multiple reports of harassment' },
    { id: 2, location: 'Saket Metro', time: '25 mins ago', severity: 'warning', message: 'Poor lighting reported' },
    { id: 3, location: 'Hauz Khas', time: '1 hour ago', severity: 'info', message: 'Increased police presence' },
    { id: 4, location: 'Lajpat Nagar', time: '2 hours ago', severity: 'warning', message: 'Crowded area alert' },
    { id: 5, location: 'Nehru Place', time: '3 hours ago', severity: 'danger', message: 'Accident reported' },
  ]);

  const [filterSeverity, setFilterSeverity] = useState<'all' | 'danger' | 'warning' | 'info'>('all');

  const filteredAlerts = filterSeverity === 'all' 
    ? alerts 
    : alerts.filter(a => a.severity === filterSeverity);

  return (
    <div className="alerts-page">
      <Header onLogout={onLogout} />
      
      <div className="alerts-container">
        <div className="alerts-header">
          <h1>🔔 Active Alerts</h1>
          <p>Real-time safety alerts from your area</p>
        </div>

        <div className="alert-filters">
          <button
            className={`filter-btn ${filterSeverity === 'all' ? 'active' : ''}`}
            onClick={() => setFilterSeverity('all')}
          >
            All ({alerts.length})
          </button>
          <button
            className={`filter-btn ${filterSeverity === 'danger' ? 'active' : ''}`}
            onClick={() => setFilterSeverity('danger')}
          >
            🚨 High ({alerts.filter(a => a.severity === 'danger').length})
          </button>
          <button
            className={`filter-btn ${filterSeverity === 'warning' ? 'active' : ''}`}
            onClick={() => setFilterSeverity('warning')}
          >
            ⚠️ Medium ({alerts.filter(a => a.severity === 'warning').length})
          </button>
          <button
            className={`filter-btn ${filterSeverity === 'info' ? 'active' : ''}`}
            onClick={() => setFilterSeverity('info')}
          >
            ℹ️ Info ({alerts.filter(a => a.severity === 'info').length})
          </button>
        </div>

        <div className="alerts-list">
          {filteredAlerts.length === 0 ? (
            <div className="no-alerts">
              <p>✨ No alerts for this category</p>
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <div key={alert.id} className={`alert-card ${alert.severity}`}>
                <div className="alert-icon">
                  {alert.severity === 'danger' && '🚨'}
                  {alert.severity === 'warning' && '⚠️'}
                  {alert.severity === 'info' && 'ℹ️'}
                </div>
                <div className="alert-content">
                  <h3>{alert.location}</h3>
                  <p>{alert.message}</p>
                  <span className="alert-time">{alert.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
