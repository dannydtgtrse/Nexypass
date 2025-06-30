import React from 'react';
import { AlertTriangle, Wifi, WifiOff, Zap, Signal } from 'lucide-react';
import { useConnection } from '../contexts/ConnectionContext';

export default function ConnectionOverlay() {
  const { isOnline, isConnecting, connectionQuality } = useConnection();

  if (isOnline && !isConnecting) return null;

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
          {isConnecting ? 'Reconectando...' : 'Conexión Perdida'}
        </h3>
        
        <p className="text-gray-300 mb-4">
          {isConnecting 
            ? 'Restableciendo conexión en tiempo real...'
            : 'Se requiere una conexión a internet para continuar usando NexyPass.'
          }
        </p>
        
        {!isConnecting && (
          <div className="bg-yellow-900/30 border border-yellow-600/30 rounded-lg p-3">
            <div className="flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
              <p className="text-sm text-yellow-300 font-medium">
                Todas las funciones están deshabilitadas sin conexión
              </p>
            </div>
          </div>
        )}

        {isConnecting && (
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <Zap className="h-4 w-4 text-nexy-blue-400" />
            <span>Arquitectura "Siempre Conectado"</span>
          </div>
        )}
      </div>
    </div>
  );
}