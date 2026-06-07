import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/** Lightweight online/offline signal without extra native deps. */
export function useNetworkStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const update = () => setOnline(navigator.onLine);
      update();
      window.addEventListener('online', update);
      window.addEventListener('offline', update);
      return () => {
        window.removeEventListener('online', update);
        window.removeEventListener('offline', update);
      };
    }
    // Native: assume online; fetch failures surface per-request errors.
    setOnline(true);
  }, []);

  return { online };
}
