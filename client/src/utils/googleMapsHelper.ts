// Google Maps API Helper
export const getGoogleMapsApiKey = (): string => {
  // For production, use environment variable
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ No Google Maps API key found. Set VITE_GOOGLE_MAPS_API_KEY in .env.local');
  }
  return apiKey || '';
};

export const loadGoogleMapsAPI = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=maps,marker`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });
};

// Extend Window interface to include google maps types
declare global {
  interface Window {
    google: any;
  }
}
