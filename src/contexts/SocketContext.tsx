import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useConnection } from './ConnectionContext';
import toast from 'react-hot-toast';
import { Bell, Package, UserPlus, CreditCard, Zap, Wifi, WifiOff } from 'lucide-react';

interface SocketContextType {
  isConnected: boolean;
  sendMessage: (event: string, data: any) => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const { user, isOnline } = useAuth();
  const { isOnline: connectionOnline } = useConnection();

  useEffect(() => {
    if (!user || !isOnline || !connectionOnline) {
      setIsConnected(false);
      setConnectionStatus('disconnected');
      return;
    }

    // Simular establecimiento de conexión WebSocket
    setConnectionStatus('connecting');
    
    const connectTimeout = setTimeout(() => {
      setIsConnected(true);
      setConnectionStatus('connected');
      
      // Mostrar toast de conexión exitosa
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-slide-up' : 'animate-fade-out'} max-w-md w-full bg-slate-800 border border-green-500/30 shadow-glow-green rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Wifi className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-gray-50">
                  ⚡ Conectado en Tiempo Real
                </p>
                <p className="mt-1 text-sm text-gray-300">
                  Sistema de sincronización automática activado
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-slate-700">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-green-400 hover:text-green-300 focus:outline-none transition-colors"
            >
              ✓
            </button>
          </div>
        </div>
      ), { 
        duration: 4000,
        position: 'top-right'
      });
    }, 1500);

    // Simular notificaciones en tiempo real para administradores
    let notificationInterval: NodeJS.Timeout;
    
    if (user.role === 'admin') {
      notificationInterval = setInterval(() => {
        if (Math.random() > 0.90) { // 10% de probabilidad cada 25 segundos
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
            },
            {
              type: 'system_update',
              title: '🔄 Sincronización Automática',
              message: 'Datos sincronizados exitosamente con la base de datos',
              icon: Zap,
              color: 'blue'
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
      }, 25000);
    }

    // Simular notificaciones para usuarios regulares
    if (user.role === 'user') {
      const userNotificationInterval = setInterval(() => {
        if (Math.random() > 0.95) { // 5% de probabilidad cada 30 segundos
          const userNotifications = [
            {
              title: '🎉 ¡Nuevo Producto Disponible!',
              message: 'Se ha agregado un nuevo producto al catálogo',
              icon: Package,
              color: 'green'
            },
            {
              title: '💰 Saldo Actualizado',
              message: 'Tu saldo ha sido actualizado exitosamente',
              icon: CreditCard,
              color: 'blue'
            }
          ];
          
          const notification = userNotifications[Math.floor(Math.random() * userNotifications.length)];
          
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
                  ✓
                </button>
              </div>
            </div>
          ), { 
            duration: 6000,
            position: 'top-right'
          });
        }
      }, 30000);

      return () => {
        clearTimeout(connectTimeout);
        if (userNotificationInterval) clearInterval(userNotificationInterval);
      };
    }

    return () => {
      clearTimeout(connectTimeout);
      if (notificationInterval) clearInterval(notificationInterval);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };
  }, [user, isOnline, connectionOnline]);

  // Detectar desconexión
  useEffect(() => {
    if (!isOnline || !connectionOnline) {
      if (isConnected) {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-slide-up' : 'animate-fade-out'} max-w-md w-full bg-slate-800 border border-nexy-rose-500/30 shadow-glow-red rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <WifiOff className="h-6 w-6 text-nexy-rose-500" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-gray-50">
                    📱 Modo Offline Activado
                  </p>
                  <p className="mt-1 text-sm text-gray-300">
                    Los datos se guardan localmente y se sincronizarán automáticamente
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-slate-700">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-nexy-rose-500 hover:text-nexy-rose-400 focus:outline-none transition-colors"
              >
                ✓
              </button>
            </div>
          </div>
        ), { 
          duration: 5000,
          position: 'top-right'
        });
      }
    }
  }, [isOnline, connectionOnline, isConnected]);

  const sendMessage = (event: string, data: any) => {
    if (isConnected) {
      console.log('📡 WebSocket Message Sent:', event, data);
      
      // Simular respuesta instantánea
      toast.success('Acción procesada en tiempo real', {
        icon: '⚡',
        duration: 2000,
      });
    } else {
      console.log('📱 Offline Message Queued:', event, data);
      
      toast.success('Acción guardada localmente', {
        icon: '📱',
        duration: 2000,
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