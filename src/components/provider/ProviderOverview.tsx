import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  Zap,
  Shield,
  Bell,
  AlertTriangle,
  Calendar,
  Activity,
  Eye,
  X
} from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';

const initialStats = [
  {
    name: 'Ventas Totales',
    value: 'S/ 0.00',
    change: '+0%',
    changeType: 'neutral',
    icon: DollarSign,
  },
  {
    name: 'Usuarios Activos',
    value: '0',
    change: '+0',
    changeType: 'neutral',
    icon: Users,
  },
  {
    name: 'Productos',
    value: '0',
    change: '+0',
    changeType: 'neutral',
    icon: Package,
  },
  {
    name: 'Órdenes Hoy',
    value: '0',
    change: '+0%',
    changeType: 'neutral',
    icon: TrendingUp,
  },
];

const initialWeeklySales = [
  { day: 'lun, 23 jun.', amount: 0.00 },
  { day: 'mar, 24 jun.', amount: 0.00 },
  { day: 'mié, 25 jun.', amount: 0.00 },
  { day: 'jue, 26 jun.', amount: 0.00 },
  { day: 'vie, 27 jun.', amount: 0.00 },
  { day: 'sáb, 28 jun.', amount: 0.00 },
  { day: 'dom, 29 jun.', amount: 0.00 },
];

const initialRecentActivity = [
  {
    id: 1,
    type: 'system',
    message: 'Sistema iniciado correctamente',
    user: 'Sistema',
    time: 'Hace 1 min',
    icon: CheckCircle,
    iconColor: 'text-green-400',
  },
];

export default function ProviderOverview() {
  const { isConnected } = useSocket();
  const [stats, setStats] = useState(initialStats);
  const [weeklySales, setWeeklySales] = useState(initialWeeklySales);
  const [recentActivity, setRecentActivity] = useState(initialRecentActivity);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [lastActivity, setLastActivity] = useState('Hace 1 min');
  const [showGlobalSales, setShowGlobalSales] = useState(false);
  const [showTransactionMonitoring, setShowTransactionMonitoring] = useState(false);

  useEffect(() => {
    // Actualizar última actividad cada minuto
    const interval = setInterval(() => {
      const now = new Date();
      setLastActivity(`${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'text-green-400';
      case 'decrease': return 'text-nexy-rose-500';
      default: return 'text-gray-400';
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return ArrowUpRight;
      case 'decrease': return ArrowDownRight;
      default: return () => null;
    }
  };

  return (
    <div className="p-4 space-y-4 mobile-padding">
      {/* Welcome Section - Reducido */}
      <div className="bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 rounded-xl p-4 text-white shadow-glow-blue-strong animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold mb-1 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              ¡Bienvenido a NexyPass!
            </h1>
            <p className="text-blue-100 text-sm">
              Panel de control administrativo activo.
            </p>
          </div>
          <div className="flex items-center text-blue-100">
            <Zap className="h-4 w-4 mr-1" />
            <span className="text-xs font-semibold">v13.0</span>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg animate-slide-up">
        <h2 className="text-lg font-bold text-gray-50 mb-3 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Estado del Sistema
        </h2>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Plataforma:</span>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-green-400 font-semibold text-sm">🟢 Operativo</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Solicitudes Pendientes:</span>
            <div className="flex items-center">
              <Bell className="h-4 w-4 mr-1 text-nexy-blue-400" />
              <span className="text-gray-50 font-semibold text-sm">{pendingRequests} 🔔</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Última actividad:</span>
            <span className="text-gray-50 font-semibold text-sm">{lastActivity}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Conexión en tiempo real:</span>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-nexy-rose-500'}`}></div>
              <span className={`font-semibold text-sm ${isConnected ? 'text-green-400' : 'text-nexy-rose-500'}`}>
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 animate-slide-up">
        {stats.map((stat) => {
          const ChangeIcon = getChangeIcon(stat.changeType);
          return (
            <div key={stat.name} className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-lg hover:shadow-glow-blue transition-all">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="h-5 w-5 text-gray-400" />
                <div className={`flex items-center text-xs font-semibold ${getChangeColor(stat.changeType)}`}>
                  <ChangeIcon className="h-3 w-3 mr-1" />
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-50">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Sales */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg animate-slide-up">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-gray-50 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Ventas Últimos 7 Días
          </h2>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {weeklySales.map((sale, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-b-0">
                <span className="text-gray-300 text-sm">{sale.day}</span>
                <span className="text-gray-50 font-semibold text-sm">S/ {sale.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Analytics Buttons */}
      <div className="grid grid-cols-1 gap-3 animate-slide-up">
        <button 
          onClick={() => setShowGlobalSales(true)}
          className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-left hover:bg-slate-700 hover:shadow-glow-blue transition-all transform hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <TrendingUp className="h-5 w-5 text-nexy-blue-400 mb-2" />
              <p className="font-semibold text-gray-50 text-sm">Ventas Globales</p>
              <p className="text-xs text-gray-400">Ver historial completo de transacciones</p>
            </div>
            <Eye className="h-4 w-4 text-gray-400" />
          </div>
        </button>
        
        <button 
          onClick={() => setShowTransactionMonitoring(true)}
          className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-left hover:bg-slate-700 hover:shadow-glow-blue transition-all transform hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <Activity className="h-5 w-5 text-green-400 mb-2" />
              <p className="font-semibold text-gray-50 text-sm">Vigilancia Total de Transacciones</p>
              <p className="text-xs text-gray-400">Monitoreo en tiempo real de todos los movimientos</p>
            </div>
            <Eye className="h-4 w-4 text-gray-400" />
          </div>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg animate-slide-up">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-gray-50 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Actividad Reciente
          </h2>
        </div>
        <div className="divide-y divide-slate-700">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-4 flex items-start space-x-3 hover:bg-slate-700/50 transition-colors">
              <activity.icon className={`h-5 w-5 mt-0.5 ${activity.iconColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-50">
                  {activity.message}
                </p>
                <p className="text-sm text-gray-400">
                  {activity.user} • {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 animate-slide-up">
        <button className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-left hover:bg-slate-700 hover:shadow-glow-blue transition-all transform hover:scale-105">
          <Package className="h-5 w-5 text-nexy-blue-400 mb-2" />
          <p className="font-semibold text-gray-50 text-sm">Agregar Producto</p>
          <p className="text-xs text-gray-400">Crear nuevo producto</p>
        </button>
        
        <button className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-left hover:bg-slate-700 hover:shadow-glow-blue transition-all transform hover:scale-105">
          <Users className="h-5 w-5 text-green-400 mb-2" />
          <p className="font-semibold text-gray-50 text-sm">Gestionar Usuarios</p>
          <p className="text-xs text-gray-400">Ver usuarios registrados</p>
        </button>
      </div>

      {/* Global Sales Modal */}
      {showGlobalSales && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto shadow-glow-blue animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-50 flex items-center">
                <TrendingUp className="h-6 w-6 mr-2" />
                Ventas Globales - Historial Completo
              </h3>
              <button
                onClick={() => setShowGlobalSales(false)}
                className="p-2 text-gray-400 hover:text-gray-300 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                Sin transacciones registradas
              </h3>
              <p className="text-gray-500">
                Las ventas aparecerán aquí una vez que se realicen las primeras transacciones
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Monitoring Modal */}
      {showTransactionMonitoring && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto shadow-glow-blue animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-50 flex items-center">
                <Activity className="h-6 w-6 mr-2" />
                Vigilancia Total de Transacciones
              </h3>
              <button
                onClick={() => setShowTransactionMonitoring(false)}
                className="p-2 text-gray-400 hover:text-gray-300 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="text-center py-12">
              <Activity className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                Monitoreo en tiempo real activo
              </h3>
              <p className="text-gray-500">
                Todas las transacciones serán monitoreadas y registradas aquí en tiempo real
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}