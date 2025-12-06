import { useEffect, useState } from 'react';
import './OfflineIndicator.css';
import offlineManager from '../services/offlineManager';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending sync items
    const checkPending = async () => {
      try {
        const { default: offlineStorage } = await import('../services/offlineStorage');
        const unsynced = await offlineStorage.getUnsynced();
        setPendingSync(unsynced.length);
      } catch (error) {
        console.error('Failed to check pending sync:', error);
      }
    };

    checkPending();
    const interval = setInterval(checkPending, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && pendingSync === 0) return null;

  return (
    <div className={`offline-indicator ${isOnline ? 'syncing' : 'offline'}`}>
      <div className="offline-indicator-content">
        {!isOnline ? (
          <>
            <span className="offline-icon">📴</span>
            <div className="offline-text">
              <strong>Offline Mode</strong>
              <span>App features still available</span>
            </div>
          </>
        ) : pendingSync > 0 ? (
          <>
            <span className="offline-icon">🔄</span>
            <div className="offline-text">
              <strong>Syncing...</strong>
              <span>{pendingSync} items pending</span>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default OfflineIndicator;
