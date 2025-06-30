import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Store, 
  Wallet, 
  ShoppingBag, 
  User, 
  LogOut,
  Shield,
  Phone
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../contexts/SocketContext';

const navigation = [
  { name: 'Tienda', href: '/', icon: Store },
  { name: 'Mi Billetera', href: '/wallet', icon: Wallet },
  { name: 'Mis Compras', href: '/orders', icon: ShoppingBag },
  { name: 'Perfil', href: '/profile', icon: User },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const location = useLocation();

  const handleSupportContact = () => {
    // In a real app, this would use the provider's configured support number
    const supportNumber = '+51987654321';
    window.open(`https://wa.me/${supportNumber.replace('+', '')}`, '_blank');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <Shield className="h-8 w-8 text-blue-600 mr-2" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">NexyPass</h1>
              <p className="text-xs text-gray-500">Panel de Vendedor</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-1 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </div>
          
          <button
            onClick={handleSupportContact}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Contactar Soporte"
          >
            <Phone className="h-5 w-5" />
          </button>
          
          <div className="flex items-center">
            <div className="text-right mr-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">
                Saldo: S/ {user?.balance?.toFixed(2) || '0.00'}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
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

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}