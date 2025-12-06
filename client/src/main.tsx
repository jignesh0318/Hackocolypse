/// <reference types="vite/client" />
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css'

// Load Google Maps API from environment variable
const loadGoogleMapsAPI = async () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ Google Maps API key not configured in VITE_GOOGLE_MAPS_API_KEY');
    return;
  }

  // Check if already loaded
  if (window.google?.maps) {
    console.log('✅ Google Maps already loaded');
    return;
  }

  return new Promise<void>((resolve) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,marker,geocoding`;
    script.async = true;
    script.defer = true;
    script.id = 'google-maps-script';
    script.onload = () => {
      console.log('✅ Google Maps API loaded successfully with key:', apiKey.substring(0, 10) + '...');
      resolve();
    };
    script.onerror = () => {
      console.error('❌ Failed to load Google Maps API. Check your API key and permissions.');
      resolve(); // Continue even if Google Maps fails
    };
    document.head.appendChild(script);
  });
};

// Render app immediately, Google Maps loads in parallel
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

// Load Google Maps in background
loadGoogleMapsAPI();