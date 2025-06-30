import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Store, 
  ShoppingBag, 
  User, 
  LogOut,
  Shield,
  Zap,
  Wallet,
  Signal
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../contexts/SocketContext';
import { useConnection } from '../../contexts/ConnectionContext';

const navigation = [
  { name: 'Tienda', href: '/', icon: Store },
  { name: 'Mis Compras', href: '/purchases', icon: ShoppingBag },
  { name: 'Perfil', href: '/profile', icon: User },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { isConnected, connectionStatus } = useSocket();
  const { connectionQuality } = useConnection();
  const location = useLocation();

  const getConnectionColor = () => {
    if (!isConnected) return 'text-nexy-rose-500';
    switch (connectionQuality) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-nexy-blue-400';
      case 'poor': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getConnectionText = () => {
    if (!isConnected) return 'Desconectado';
    switch (connectionQuality) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Buena';
      case 'poor': return 'Limitada';
      default: return 'Conectando...';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Header - Ultra Compacto */}
      <header className="bg-slate-800 border-b border-slate-700 px-2 py-1.5 flex items-center justify-between shadow-lg flex-shrink-0">
        <div className="flex items-center">
          <div className="flex items-center mr-2">
            <div className="w-6 h-6 bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 rounded-md flex items-center justify-center mr-1.5 shadow-glow-blue">
              <Shield className="h-3 w-3 text-white" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-gray-50">NexyPass</h1>
              <p className="text-xs text-gray-400 leading-none">v13.0 • Cliente</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1.5">
          <div className={`flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 border ${
            isConnected ? 'border-green-500/30' : 'border-nexy-rose-500/30'
          }`}>
            <div className={`w-1 h-1 rounded-full mr-1 ${
              isConnected ? 'bg-green-400 animate-pulse' : 'bg-nexy-rose-500'
            }`}></div>
            <span className={`${getConnectionColor()} text-xs`}>{getConnectionText()}</span>
          </div>
          
          <div className="flex items-center">
            <div className="text-right mr-1.5">
              <p className="text-xs font-semibold text-gray-50 leading-none">{user?.username}</p>
              <div className="flex items-center text-xs text-gray-400">
                <Wallet className="h-2 w-2 mr-0.5" />
                <span className="text-xs leading-none">S/ {user?.walletBalance?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1 text-gray-400 hover:text-nexy-rose-500 hover:bg-slate-700 rounded-md transition-colors"
            >
              <LogOut className="h-3 w-3" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Bottom Navigation - Ultra Compacto */}
      <nav className="bg-slate-800 border-t border-slate-700 px-2 py-1.5 shadow-lg flex-shrink-0">
        <div className="flex justify-around">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center py-1 px-1.5 rounded-md transition-all ${
                  isActive
                    ? 'text-nexy-blue-400 bg-slate-700 shadow-glow-blue transform scale-105'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-slate-700'
                }`}
              >
                <item.icon className="h-3 w-3 mb-0.5" />
                <span className="text-xs font-medium leading-none">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}