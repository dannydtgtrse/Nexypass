import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Copy, 
  Eye, 
  EyeOff, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  productName: string;
  price: number;
  credentials: {
    email: string;
    password: string;
    profile?: string;
    pin?: string;
  };
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired';
  customerName: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    productName: 'Netflix Premium',
    price: 25.00,
    credentials: {
      email: 'user1@netflix.com',
      password: 'pass123456',
      profile: '1',
      pin: '1234'
    },
    startDate: new Date('2024-01-15'),
    endDate: addDays(new Date('2024-01-15'), 30),
    status: 'active',
    customerName: 'Juan Pérez'
  },
  {
    id: '2',
    productName: 'Spotify Premium',
    price: 15.00,
    credentials: {
      email: 'user2@spotify.com',
      password: 'spotify789',
      profile: '2',
      pin: '5678'
    },
    startDate: new Date('2024-01-10'),
    endDate: addDays(new Date('2024-01-10'), 30),
    status: 'active',
    customerName: 'María García'
  },
  {
    id: '3',
    productName: 'Disney+ Premium',
    price: 20.00,
    credentials: {
      email: 'user3@disney.com',
      password: 'disney321',
      profile: '1',
      pin: '9876'
    },
    startDate: new Date('2023-12-20'),
    endDate: addDays(new Date('2023-12-20'), 30),
    status: 'expired',
    customerName: 'Carlos López'
  }
];

export default function VendorOrders() {
  const [orders] = useState<Order[]>(mockOrders);
  const [showExpired, setShowExpired] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [visiblePins, setVisiblePins] = useState<Set<string>>(new Set());

  const filteredOrders = orders.filter(order => 
    showExpired ? true : order.status === 'active'
  );

  const activeOrders = orders.filter(order => order.status === 'active');
  const expiredOrders = orders.filter(order => order.status === 'expired');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  const togglePasswordVisibility = (orderId: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(orderId)) {
      newVisible.delete(orderId);
    } else {
      newVisible.add(orderId);
    }
    setVisiblePasswords(newVisible);
  };

  const togglePinVisibility = (orderId: string) => {
    const newVisible = new Set(visiblePins);
    if (newVisible.has(orderId)) {
      newVisible.delete(orderId);
    } else {
      newVisible.add(orderId);
    }
    setVisiblePins(newVisible);
  };

  const getDaysRemaining = (endDate: Date) => {
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Compras</h1>
        <p className="text-gray-600">Historial de productos adquiridos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Compras Activas</p>
              <p className="text-2xl font-bold text-green-600">{activeOrders.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Gastado</p>
              <p className="text-2xl font-bold text-gray-900">
                S/ {orders.reduce((sum, order) => sum + order.price, 0).toFixed(2)}
              </p>
            </div>
            <ShoppingBag className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Mostrar:</span>
        </div>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showExpired}
            onChange={(e) => setShowExpired(e.target.checked)}
            className="sr-only"
          />
          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            showExpired ? 'bg-blue-600' : 'bg-gray-200'
          }`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showExpired ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </div>
          <span className="ml-2 text-sm text-gray-700">
            Incluir compras expiradas ({expiredOrders.length})
          </span>
        </label>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showExpired ? 'No tienes compras' : 'No tienes compras activas'}
            </h3>
            <p className="text-gray-600">
              {showExpired 
                ? 'Tus compras aparecerán aquí una vez que realices alguna'
                : 'Activa "Incluir compras expiradas" para ver tu historial completo'
              }
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const daysRemaining = getDaysRemaining(order.endDate);
            const isExpiringSoon = daysRemaining <= 3 && daysRemaining > 0;
            
            return (
              <div 
                key={order.id} 
                className={`bg-white rounded-xl border p-4 ${
                  order.status === 'expired' 
                    ? 'border-gray-200 bg-gray-50' 
                    : isExpiringSoon
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-gray-100'
                }`}
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{order.productName}</h3>
                    <p className="text-sm text-gray-600">Cliente: {order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">S/ {order.price.toFixed(2)}</p>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'active'
                        ? isExpiringSoon
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'active' ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {isExpiringSoon ? `Expira en ${daysRemaining} días` : 'Activo'}
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Expirado
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Credentials Table */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Credenciales de Acceso</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {/* Email */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Correo/Usuario:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900 font-mono">
                          {order.credentials.email}
                        </span>
                        <button
                          onClick={() => copyToClipboard(order.credentials.email, 'Correo')}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Contraseña:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900 font-mono">
                          {visiblePasswords.has(order.id) 
                            ? order.credentials.password 
                            : '••••••••'
                          }
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(order.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          {visiblePasswords.has(order.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(order.credentials.password, 'Contraseña')}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Profile */}
                    {order.credentials.profile && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Perfil:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900 font-mono">
                            {order.credentials.profile}
                          </span>
                          <button
                            onClick={() => copyToClipboard(order.credentials.profile!, 'Perfil')}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* PIN */}
                    {order.credentials.pin && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">PIN:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900 font-mono">
                            {visiblePins.has(order.id) 
                              ? order.credentials.pin 
                              : '••••'
                            }
                          </span>
                          <button
                            onClick={() => togglePinVisibility(order.id)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            {visiblePins.has(order.id) ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(order.credentials.pin!, 'PIN')}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Fecha de Inicio:</span>
                    <p className="text-gray-900 flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(order.startDate, 'dd/MM/yyyy', { locale: es })}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Fecha de Fin:</span>
                    <p className="text-gray-900 flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      {format(order.endDate, 'dd/MM/yyyy', { locale: es })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}