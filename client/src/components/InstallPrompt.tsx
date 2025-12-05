import { useState, useEffect } from 'react';
import './InstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      console.log('✅ App is running as standalone');
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setShowPrompt(true);
      console.log('📱 Install prompt available');
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('🎉 App installed successfully');
      setIsInstalled(true);
      setShowPrompt(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ User accepted install prompt');
      } else {
        console.log('❌ User dismissed install prompt');
      }
      
      setShowPrompt(false);
      setInstallPrompt(null);
    } catch (error) {
      console.error('Install failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  // Don't show if already installed or no install prompt available
  if (isInstalled || !showPrompt || !installPrompt) {
    return null;
  }

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <div className="install-icon">📱</div>
        <div className="install-text">
          <h3>Install Safety Zones</h3>
          <p>Get instant access to emergency features on your home screen</p>
        </div>
        <div className="install-buttons">
          <button className="install-btn-yes" onClick={handleInstall}>
            Install
          </button>
          <button className="install-btn-no" onClick={handleDismiss}>
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
