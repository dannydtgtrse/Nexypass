import React, { createContext, useContext, useState, useEffect } from 'react';

interface ConnectionContextType {
  isOnline: boolean;
  isConnecting: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'offline'>('excellent');

  useEffect(() => {
    const handleOnline = () => {
      setIsConnecting(true);
      setConnectionQuality('good');
      
      // Simulate connection verification with quality check
      setTimeout(() => {
        setIsOnline(true);
        setIsConnecting(false);
        setConnectionQuality('excellent');
      }, 1500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsConnecting(false);
      setConnectionQuality('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connection quality check
    const qualityCheck = setInterval(() => {
      if (navigator.onLine) {
        // Simulate network quality detection
        const quality = Math.random();
        if (quality > 0.8) setConnectionQuality('excellent');
        else if (quality > 0.5) setConnectionQuality('good');
        else setConnectionQuality('poor');
      } else {
        setConnectionQuality('offline');
        setIsOnline(false);
      }
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(qualityCheck);
    };
  }, []);

  return (
    <ConnectionContext.Provider value={{ isOnline, isConnecting, connectionQuality }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
}