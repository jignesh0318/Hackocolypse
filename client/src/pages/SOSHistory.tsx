import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './SOSHistory.css';

interface SOSRecord {
  id: string;
  reason: string;
  triggeredAt: string;
  location?: {
    latitude: number;
    longitude: number;
    url?: string;
  };
  user?: {
    name?: string;
    phone?: string;
  };
  contactsNotified: number;
  status: 'sent' | 'pending' | 'failed';
}

interface SOSHistoryProps {
  onLogout: () => void;
}

const SOSHistory = ({ onLogout }: SOSHistoryProps) => {
  const navigate = useNavigate();
  const [sosRecords, setSosRecords] = useState<SOSRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sent' | 'failed'>('all');

  useEffect(() => {
    // Load SOS history from localStorage
    const loadSOSHistory = () => {
      try {
        const savedHistory = localStorage.getItem('sosHistory');
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          setSosRecords(Array.isArray(parsed) ? parsed : []);
        } else {
          setSosRecords([]);
        }
      } catch (error) {
        console.error('Error loading SOS history:', error);
        setSosRecords([]);
      }
      setLoading(false);
    };

    loadSOSHistory();
  }, []);

  const filteredRecords = sosRecords.filter((record) => {
    if (filter === 'all') return true;
    return record.status === filter;
  });

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const isToday = date.toDateString() === today.toDateString();
      const isYesterday = date.toDateString() === yesterday.toDateString();

      const time = date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      if (isToday) {
        return `Today ${time}`;
      } else if (isYesterday) {
        return `Yesterday ${time}`;
      } else {
        const dateStr = date.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: '2-digit',
        });
        return `${dateStr} ${time}`;
      }
    } catch {
      return isoString;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return '✓';
      case 'pending':
        return '⏳';
      case 'failed':
        return '✕';
      default:
        return '●';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'failed':
        return '#dc3545';
      default:
        return '#667eea';
    }
  };

  return (
    <div className="sos-history-page">
      <Header onLogout={onLogout} />

      <div className="sos-history-container">
        <div className="page-header">
          <h1>🚨 SOS History</h1>
          <button
            className="back-btn"
            onClick={() => navigate('/menu')}
            title="Back to menu"
          >
            ← Back
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({sosRecords.length})
          </button>
          <button
            className={`filter-btn ${filter === 'sent' ? 'active' : ''}`}
            onClick={() => setFilter('sent')}
          >
            Sent ({sosRecords.filter((r) => r.status === 'sent').length})
          </button>
          <button
            className={`filter-btn ${filter === 'failed' ? 'active' : ''}`}
            onClick={() => setFilter('failed')}
          >
            Failed ({sosRecords.filter((r) => r.status === 'failed').length})
          </button>
        </div>

        {/* SOS Records List */}
        {loading ? (
          <div className="loading">Loading SOS history...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚨</div>
            <p>
              {sosRecords.length === 0
                ? 'No SOS alerts have been triggered yet'
                : `No ${filter} SOS alerts found`}
            </p>
          </div>
        ) : (
          <div className="sos-list">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="sos-card"
                style={{
                  borderLeftColor: getStatusColor(record.status),
                }}
              >
                <div className="sos-card-header">
                  <div className="sos-status">
                    <span
                      className="status-icon"
                      style={{ color: getStatusColor(record.status) }}
                    >
                      {getStatusIcon(record.status)}
                    </span>
                    <span className="status-text">{record.status.toUpperCase()}</span>
                  </div>
                  <span className="sos-time">{formatDate(record.triggeredAt)}</span>
                </div>

                <div className="sos-card-body">
                  <p className="sos-reason">
                    <strong>Reason:</strong> {record.reason || 'SOS triggered from app'}
                  </p>

                  {record.user?.name && (
                    <p className="sos-user">
                      <strong>User:</strong> {record.user.name}
                    </p>
                  )}

                  {record.location?.url && (
                    <p className="sos-location">
                      <strong>Location:</strong>{' '}
                      <a href={record.location.url} target="_blank" rel="noopener noreferrer">
                        View on Map 🗺️
                      </a>
                    </p>
                  )}

                  <p className="sos-contacts">
                    <strong>Contacts Notified:</strong> {record.contactsNotified}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SOSHistory;
