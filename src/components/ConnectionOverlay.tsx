import React from 'react';
import { AlertTriangle, Wifi, WifiOff, Zap, Signal, RefreshCw } from 'lucide-react';
import { useConnection } from '../contexts/ConnectionContext';
import { useAuth } from '../hooks/useAuth';

export default function ConnectionOverlay() {
  const { isOnline, isConnecting, connectionQuality } = useConnection();
  const { isOnline: authOnline } = useAuth();

  // Solo mostrar overlay si está completamente offline o conectando
  if ((isOnline && authOnline && !isConnecting) || (!isOnline && !isConnecting)) return null;

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-sm w-full text-center shadow-glow-blue animate-slide-up">
        <div className="mb-6">
          {isConnecting ? (
            <div className="relative">
              <Wifi className="h-16 w-16 text-nexy-blue-400 mx-auto animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-nexy-blue-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <WifiOff className="h-16 w-16 text-nexy-rose-500 mx-auto" />
              <AlertTriangle className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 bg-slate-800 rounded-full p-1" />
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-50 mb-2">
          {isConnecting ? 'Estableciendo Conexión...' : 'Verificando Conexión'}
        </h3>
        
        <p className="text-gray-300 mb-4">
          {isConnecting 
            ? 'Configurando sistema de tiempo real y sincronización automática...'
            : 'Verificando conectividad de red y servicios...'
          }
        </p>
        
        {!isConnecting && (
          <div className="space-y-4">
            <div className="bg-yellow-900/30 border border-yellow-600/30 rounded-lg p-3">
              <div className="flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                <p className="text-sm text-yellow-300 font-medium">
                  Modo offline disponible - Los datos se guardan localmente
                </p>
              </div>
            </div>
            
            <button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-nexy-blue-500 hover:to-nexy-blue-700 transition-all flex items-center justify-center shadow-glow-blue transform hover:scale-105"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar Conexión
            </button>
          </div>
        )}

        {isConnecting && (
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <Zap className="h-4 w-4 text-nexy-blue-400 animate-pulse" />
            <span>Sistema "Siempre Conectado" • Auto-Sincronización</span>
          </div>
        )}
      </div>
    </div>
  );
}