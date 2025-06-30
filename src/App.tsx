import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConnectionProvider } from './contexts/ConnectionContext';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { SocketProvider } from './contexts/SocketContext';
import ConnectionOverlay from './components/ConnectionOverlay';
import AuthScreen from './screens/AuthScreen';
import UserDashboard from './screens/UserDashboard';
import ProviderDashboard from './screens/ProviderDashboard';
import { useAuth } from './hooks/useAuth';
import { Clock } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-nexy-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4 glow-blue"></div>
          <p className="text-gray-300 font-medium">Cargando NexyPass...</p>
          <p className="text-gray-500 text-sm mt-2">Versión 13.0</p>
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
                  <div className="bg-slate-800 border border-yellow-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-glow-blue animate-slide-up">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-yellow-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-50 mb-4">Cuenta Pendiente de Aprobación</h2>
                    <p className="text-gray-300 mb-6">
                      Tu cuenta está siendo revisada por el administrador. Recibirás acceso una vez que sea aprobada.
                    </p>
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
    <ConnectionProvider>
      <AuthProvider>
        <DataProvider>
          <SocketProvider>
            <AppContent />
          </SocketProvider>
        </DataProvider>
      </AuthProvider>
    </ConnectionProvider>
  );
}

export default App;