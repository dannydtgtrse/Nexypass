import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useConnection } from './ConnectionContext';
import toast from 'react-hot-toast';
import { Bell, Package, UserPlus, CreditCard, Zap } from 'lucide-react';

interface SocketContextType {
  isConnected: boolean;
  sendMessage: (event: string, data: any) => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const { user } = useAuth();
  const { isOnline } = useConnection();

  useEffect(() => {
    if (!user || !isOnline) {
      setIsConnected(false);
      setConnectionStatus('disconnected');
      return;
    }

    // Simulate WebSocket connection establishment
    setConnectionStatus('connecting');
    
    const connectTimeout = setTimeout(() => {
      setIsConnected(true);
      setConnectionStatus('connected');
      
      // Show connection success toast
      toast.success('Conectado en tiempo real', {
        icon: '⚡',
        duration: 3000,
      });
    }, 2000);

    // Simulate real-time notifications for provider
    let notificationInterval: NodeJS.Timeout;
    
    if (user.role === 'admin') {
      notificationInterval = setInterval(() => {
        if (Math.random() > 0.85) { // 15% chance every 20 seconds
          const notifications = [
            {
              type: 'new_user',
              title: '🆕 Nuevo Usuario Registrado',
              message: 'Un nuevo cliente se ha registrado en la plataforma',
              icon: UserPlus,
              color: 'blue'
            },
            {
              type: 'recharge_request',
              title: '💰 Solicitud de Recarga',
              message: 'Un usuario solicita recarga de saldo',
              icon: CreditCard,
              color: 'green'
            },
            {
              type: 'low_stock',
              title: '📦 Stock Bajo',
              message: 'Un producto tiene menos de 3 unidades disponibles',
              icon: Package,
              color: 'yellow'
            }
          ];
          
          const notification = notifications[Math.floor(Math.random() * notifications.length)];
          
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-slide-up' : 'animate-fade-out'} max-w-md w-full bg-slate-800 border border-slate-700 shadow-glow-blue rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <notification.icon className={`h-6 w-6 text-${notification.color}-400`} />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-semibold text-gray-50">
                      {notification.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-300">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-slate-700">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-nexy-blue-400 hover:text-nexy-blue-300 focus:outline-none transition-colors"
                >
                  Ver
                </button>
              </div>
            </div>
          ), { 
            duration: 8000,
            position: 'top-right'
          });
        }
      }, 20000);
    }

    return () => {
      clearTimeout(connectTimeout);
      if (notificationInterval) clearInterval(notificationInterval);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };
  }, [user, isOnline]);

  const sendMessage = (event: string, data: any) => {
    if (isConnected) {
      console.log('📡 WebSocket Message Sent:', event, data);
      // In a real implementation, this would send via socket.io
      
      // Simulate instant feedback
      toast.success('Mensaje enviado', {
        icon: '📡',
        duration: 2000,
      });
    } else {
      toast.error('Sin conexión en tiempo real', {
        icon: '⚠️',
        duration: 3000,
      });
    }
  };

  return (
    <SocketContext.Provider value={{ isConnected, sendMessage, connectionStatus }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}