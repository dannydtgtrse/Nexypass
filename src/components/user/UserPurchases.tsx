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
  Filter,
  ExternalLink
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../contexts/DataContext';
import toast from 'react-hot-toast';

export default function UserPurchases() {
  const { user } = useAuth();
  const { getUserOrders } = useData();
  const [showExpired, setShowExpired] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [visiblePins, setVisiblePins] = useState<Set<string>>(new Set());

  const orders = getUserOrders(user?.id || '');
  
  const filteredOrders = orders.filter(order => 
    showExpired ? true : order.status === 'active'
  );

  const activeOrders = orders.filter(order => order.status === 'active');
  const expiredOrders = orders.filter(order => order.status === 'expired');

  const parseCredentials = (credentialsString: string) => {
    const parts = credentialsString.split(':');
    return {
      email: parts[0] || '',
      password: parts[1] || '',
      profile: parts[2] || '',
      pin: parts[3] || ''
    };
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`, {
      icon: '📋',
      duration: 2000,
    });
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

  const getDaysRemaining = (expiresAt: Date) => {
    const today = new Date();
    const expireDate = new Date(expiresAt);
    const diffTime = expireDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-4 space-y-6 mobile-padding">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-50">Mis Compras</h1>
        <p className="text-gray-400">Historial de productos adquiridos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 animate-slide-up">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Compras Activas</p>
              <p className="text-2xl font-bold text-green-400">{activeOrders.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Gastado</p>
              <p className="text-2xl font-bold text-gray-50">
                S/ {orders.reduce((sum, order) => sum + order.priceAtPurchase, 0).toFixed(2)}
              </p>
            </div>
            <ShoppingBag className="h-8 w-8 text-nexy-blue-400" />
          </div>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between animate-slide-up">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-semibold text-gray-300">Mostrar:</span>
        </div>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showExpired}
            onChange={(e) => setShowExpired(e.target.checked)}
            className="sr-only"
          />
          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            showExpired ? 'bg-nexy-blue-600' : 'bg-slate-700'
          }`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showExpired ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </div>
          <span className="ml-2 text-sm text-gray-300">
            Incluir compras expiradas ({expiredOrders.length})
          </span>
        </label>
      </div>

      {/* Orders List */}
      <div className="space-y-4 animate-slide-up">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              {showExpired ? 'No tienes compras' : 'No tienes compras activas'}
            </h3>
            <p className="text-gray-500">
              {showExpired 
                ? 'Tus compras aparecerán aquí una vez que realices alguna'
                : 'Activa "Incluir compras expiradas" para ver tu historial completo'
              }
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const credentials = parseCredentials(order.credentialsDelivered);
            const daysRemaining = getDaysRemaining(order.expiresAt);
            const isExpiringSoon = daysRemaining <= 3 && daysRemaining > 0;
            
            return (
              <div 
                key={order.id} 
                className={`bg-slate-800 border rounded-xl p-4 shadow-lg transition-all ${
                  order.status === 'expired' 
                    ? 'border-slate-600 opacity-75' 
                    : isExpiringSoon
                    ? 'border-yellow-500/50 shadow-glow-red'
                    : 'border-slate-700 hover:shadow-glow-blue'
                }`}
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-50">{order.productName}</h3>
                    <p className="text-sm text-gray-400">Código: {order.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-50">S/ {order.priceAtPurchase.toFixed(2)}</p>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'active'
                        ? isExpiringSoon
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-slate-700 text-gray-400 border border-slate-600'
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
                <div className="bg-slate-700 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-50 mb-3 flex items-center">
                    <Copy className="h-4 w-4 mr-2" />
                    Credenciales de Acceso
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {/* Email/Usuario */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-300">CORREO/USUARIO:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-50 font-mono bg-slate-800 px-2 py-1 rounded">
                          {credentials.email}
                        </span>
                        <button
                          onClick={() => copyToClipboard(credentials.email, 'Correo')}
                          className="p-1 text-gray-400 hover:text-nexy-blue-400 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-300">CONTRASEÑA:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-50 font-mono bg-slate-800 px-2 py-1 rounded">
                          {visiblePasswords.has(order.id) 
                            ? credentials.password 
                            : '••••••••'
                          }
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(order.id)}
                          className="p-1 text-gray-400 hover:text-nexy-blue-400 transition-colors"
                        >
                          {visiblePasswords.has(order.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(credentials.password, 'Contraseña')}
                          className="p-1 text-gray-400 hover:text-nexy-blue-400 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Profile */}
                    {credentials.profile && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-300">PERFIL:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-50 font-mono bg-slate-800 px-2 py-1 rounded">
                            {credentials.profile}
                          </span>
                          <button
                            onClick={() => copyToClipboard(credentials.profile, 'Perfil')}
                            className="p-1 text-gray-400 hover:text-nexy-blue-400 transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* PIN */}
                    {credentials.pin && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-300">PIN:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-50 font-mono bg-slate-800 px-2 py-1 rounded">
                            {visiblePins.has(order.id) 
                              ? credentials.pin 
                              : '••••'
                            }
                          </span>
                          <button
                            onClick={() => togglePinVisibility(order.id)}
                            className="p-1 text-gray-400 hover:text-nexy-blue-400 transition-colors"
                          >
                            {visiblePins.has(order.id) ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(credentials.pin, 'PIN')}
                            className="p-1 text-gray-400 hover:text-nexy-blue-400 transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* URL de Acceso */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-300">URL DE ACCESO:</span>
                      <div className="flex items-center space-x-2">
                        <a
                          href={order.purchaseURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-nexy-blue-400 hover:text-nexy-blue-300 underline flex items-center"
                        >
                          Ir al sitio
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                        <button
                          onClick={() => copyToClipboard(order.purchaseURL, 'URL')}
                          className="p-1 text-gray-400 hover:text-nexy-blue-400 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dates and Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-300">FECHA DE INICIO:</span>
                    <p className="text-gray-50 flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: es })}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-300">FECHA DE FIN:</span>
                    <p className="text-gray-50 flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      {format(new Date(order.expiresAt), 'dd/MM/yyyy', { locale: es })}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-600">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Proveedor: {order.supplier}</span>
                    <span className="text-gray-400">{order.profileInfo}</span>
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