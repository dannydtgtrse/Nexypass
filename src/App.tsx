import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConnectionProvider } from './contexts/ConnectionContext';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { SocketProvider } from './contexts/SocketContext';
import ErrorBoundary from './components/ErrorBoundary';
import ConnectionOverlay from './components/ConnectionOverlay';
import AuthScreen from './screens/AuthScreen';
import UserDashboard from './screens/UserDashboard';
import ProviderDashboard from './screens/ProviderDashboard';
import { useAuth } from './hooks/useAuth';
import { Clock, X, Shield, Zap } from 'lucide-react';

function AppContent() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-blue-strong">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <div className="w-16 h-16 border-4 border-nexy-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-50 mb-2">NexyPass v13.0</h1>
          <p className="text-gray-300 font-medium mb-2">Iniciando Sistema Auto-Solucionador...</p>
          <div className="flex items-center justify-center text-sm text-nexy-blue-400">
            <Zap className="h-4 w-4 mr-1 animate-pulse" />
            <span>Arquitectura "Siempre Conectado"</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-900">
      <Routes>
        <Route 
          path="/auth" 
          element={!user ? <AuthScreen /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/*" 
          element={
            user ? (
              user.role === 'admin' ? (
                <ProviderDashboard />
              ) : user.isApproved ? (
                <UserDashboard />
              ) : (
                <div className="h-screen flex items-center justify-center bg-slate-900 p-4">
                  <div className="bg-slate-800 border border-yellow-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-glow-blue animate-slide-up relative">
                    {/* Botón X para regresar */}
                    <button
                      onClick={logout}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-300 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Cerrar sesión y regresar"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-yellow-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-50 mb-4">Cuenta Pendiente de Aprobación</h2>
                    <p className="text-gray-300 mb-6">
                      Tu cuenta está siendo revisada por el administrador. Recibirás acceso una vez que sea aprobada.
                    </p>
                    
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6">
                      <p className="text-sm text-yellow-300 font-medium">
                        📱 Modo Offline Disponible
                      </p>
                      <p className="text-xs text-yellow-400 mt-1">
                        Tus datos se guardan localmente y se sincronizarán automáticamente
                      </p>
                    </div>
                    
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-nexy-blue-500 hover:to-nexy-blue-700 transition-all shadow-glow-blue transform hover:scale-105"
                    >
                      Verificar Estado
                    </button>
                  </div>
                </div>
              )
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
      </Routes>
      <ConnectionOverlay />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ConnectionProvider>
        <AuthProvider>
          <DataProvider>
            <SocketProvider>
              <AppContent />
            </SocketProvider>
          </DataProvider>
        </AuthProvider>
      </ConnectionProvider>
    </ErrorBoundary>
  );
}

export default App;